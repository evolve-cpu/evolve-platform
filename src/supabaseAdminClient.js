import { supabase } from "./supabaseClient";

// Stand-in for the old service-role client. The service-role key never
// reaches the browser any more: this records each query chain
// (.from("x").select().eq()…) and runs it through api/admin.js, which
// checks that the signed-in user is an admin (admin_users / Anant staff)
// before touching the database. Same call shape and the same
// { data, error, count } results, so the admin screens use it unchanged.
//
// Uploads: the server hands out a one-time signed upload URL and the file
// goes straight from the browser to Storage (no size limit from the API).
// getPublicUrl is plain string building, done locally.

async function authHeader() {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function callAdminApi(body) {
  try {
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(await authHeader()) },
      body: JSON.stringify(body)
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return { error: { message: json.error || `admin api ${res.status}` }, status: res.status };
    return json;
  } catch (err) {
    return { error: { message: err.message || "network error" } };
  }
}

function queryBuilder(table) {
  const chain = [];
  let pending;
  const run = () => {
    pending ||= callAdminApi({ op: "query", table, chain }).then((r) => ({
      data: r.data ?? null,
      error: r.error ?? null,
      count: r.count ?? null,
      status: r.status
    }));
    return pending;
  };
  // every builder method (.select, .eq, .order, .single …) is recorded;
  // api/admin.js decides which are allowed
  const proxy = new Proxy(
    {},
    {
      get(_, prop) {
        if (prop === "then") return (ok, fail) => run().then(ok, fail);
        if (prop === "catch") return (fail) => run().catch(fail);
        if (prop === "finally") return (fn) => run().finally(fn);
        if (typeof prop === "symbol") return undefined;
        return (...args) => {
          chain.push([prop, args]);
          return proxy;
        };
      }
    }
  );
  return proxy;
}

function storageBucket(bucket) {
  const remote = (method) => (...args) => callAdminApi({ op: "storage", bucket, method, args });
  return {
    async upload(path, file, options = {}) {
      const signed = await callAdminApi({
        op: "storage",
        bucket,
        method: "createSignedUploadUrl",
        args: [path, { upsert: !!options.upsert }]
      });
      if (signed.error || !signed.data?.token) {
        return { data: null, error: signed.error || { message: "couldn't start upload" } };
      }
      return supabase.storage.from(bucket).uploadToSignedUrl(path, signed.data.token, file, options);
    },
    getPublicUrl: (...args) => supabase.storage.from(bucket).getPublicUrl(...args),
    createSignedUrl: remote("createSignedUrl"),
    createSignedUrls: remote("createSignedUrls"),
    remove: remote("remove"),
    list: remote("list")
  };
}

// The signed-in user's own anu_students row (null if they aren't an Anant
// student). The server also stamps auth_user_id / invite_accepted_at the
// first time a student arrives.
export async function fetchMyAnuStudent() {
  const r = await callAdminApi({ op: "anu_student_self" });
  return r.student || null;
}

// What the signed-in user is allowed to do in the admin panel:
// { role: "evolve" | "anant_admin" | "anant_faculty" | null, name, stream, program }
export function fetchAdminRole() {
  return callAdminApi({ op: "whoami" });
}

export const supabaseAdmin = {
  from: queryBuilder,
  storage: { from: storageBucket }
};
