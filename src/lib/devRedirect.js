import { supabase } from "../supabaseClient";
import { fetchAdminRole } from "../supabaseAdminClient";

// Dev links (e.g. a webinar link) went out to the public by mistake. On the
// dev host, anyone who isn't a signed-in Evolve team admin is sent to the
// same page on production. /admin stays open so admins can sign in on dev.
// This is a routing convenience, not access control — api/admin.js still
// guards everything sensitive.
const DEV_HOSTS = ["dev.evolvedesign.academy"];
const PROD_ORIGIN = "https://www.evolvedesign.academy";
const OK_KEY = "dev_admin_ok";

function toProd() {
  const { pathname, search, hash } = window.location;
  window.location.replace(`${PROD_ORIGIN}${pathname}${search}${hash}`);
}

// Resolves true when the app should render here, false when redirecting.
export async function devRedirectGate() {
  if (!DEV_HOSTS.includes(window.location.hostname)) return true;
  if (window.location.pathname.startsWith("/admin")) return true;

  try {
    if (sessionStorage.getItem(OK_KEY) === "1") return true;
  } catch {}

  try {
    const { data } = await supabase.auth.getSession();
    if (data?.session?.user) {
      const who = await fetchAdminRole();
      if (who?.role === "evolve") {
        try {
          sessionStorage.setItem(OK_KEY, "1");
        } catch {}
        return true;
      }
    }
  } catch {}

  toProd();
  return false;
}
