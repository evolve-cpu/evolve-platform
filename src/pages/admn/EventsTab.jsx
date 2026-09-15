import { useEffect, useState } from "react";
import { supabaseAdmin } from "../../supabaseAdminClient";

const Y = "#FFD007";
const inputStyle = { backgroundColor: "#0d0d0d", border: "1px solid #262626" };
const labelStyle = { color: "#666" };
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

async function callEventsNotify(body) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/events-notify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      apikey: SUPABASE_ANON_KEY
    },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "request failed");
  return data;
}

// best-effort — publishing shouldn't fail if the calendar sync hiccups
function syncCalendar(eventId) {
  callEventsNotify({ mode: "sync_calendar", event_id: eventId }).catch(() => {});
}

const STATUS_COLOR = {
  draft: "#888",
  published: Y,
  cancelled: "#ef4444",
  completed: "#22c55e"
};

const EMPTY_FORM = {
  title: "",
  slug: "",
  description: "",
  questionCategories: [{ name: "", questions: [""] }],
  date: "",
  time: "19:00",
  durationMinutes: "60",
  speaker_name: "",
  speaker_title: "",
  speaker_bio: "",
  speaker_photo_url: "",
  cover_image_url: "",
  join_link: "",
  capacity: ""
};

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Same IST<->UTC convention already used elsewhere in AdminDashboard.jsx /
// MentorshipV2Tab.jsx.
function istToUtc(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;
  const [h, m] = timeStr.split(":").map(Number);
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCHours(h - 5, m - 30, 0, 0);
  return d.toISOString();
}
function utcToIst(dtStr) {
  if (!dtStr) return { date: "", time: "19:00" };
  const d = new Date(dtStr);
  const ist = new Date(d.getTime() + 5.5 * 60 * 60 * 1000);
  return {
    date: ist.toISOString().slice(0, 10),
    time: `${String(ist.getUTCHours()).padStart(2, "0")}:${String(ist.getUTCMinutes()).padStart(2, "0")}`
  };
}
function fmtDt(dtStr) {
  if (!dtStr) return "not set";
  return (
    new Date(dtStr).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    }) + " IST"
  );
}

function downloadCSV(filename, rows) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => `"${String(r[h] ?? "").replace(/"/g, '""')}"`).join(","))
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function Field({ label, ...rest }) {
  return (
    <div>
      <label className="text-xs font-semibold mb-1 block" style={labelStyle}>
        {label}
      </label>
      <input className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none" style={inputStyle} {...rest} />
    </div>
  );
}

function TextAreaField({ label, ...rest }) {
  return (
    <div>
      <label className="text-xs font-semibold mb-1 block" style={labelStyle}>
        {label}
      </label>
      <textarea className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none resize-y" style={inputStyle} {...rest} />
    </div>
  );
}

function ImageField({ label, value, onUploaded, pathPrefix }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file) {
    if (!file) return;
    setUploading(true);
    setError("");
    const path = `${pathPrefix}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
    const { error: upErr } = await supabaseAdmin.storage.from("event-images").upload(path, file);
    if (upErr) {
      setError(upErr.message);
      setUploading(false);
      return;
    }
    const { data } = supabaseAdmin.storage.from("event-images").getPublicUrl(path);
    onUploaded(data.publicUrl);
    setUploading(false);
  }

  return (
    <div>
      <label className="text-xs font-semibold mb-1 block" style={labelStyle}>
        {label}
      </label>
      <div className="flex items-center gap-3">
        {value && (
          <img src={value} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" style={{ border: "1px solid #262626" }} />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleFile(e.target.files?.[0])}
          className="text-xs text-white"
          disabled={uploading}
        />
        {uploading && <span className="text-xs" style={{ color: "#888" }}>uploading…</span>}
      </div>
      {error && <p className="text-xs mt-1" style={{ color: "#ef4444" }}>{error}</p>}
    </div>
  );
}

function EventForm({ form, setForm, onSave, onCancel, saving }) {
  function updateCategoryName(ci, name) {
    setForm((f) => ({
      ...f,
      questionCategories: f.questionCategories.map((c, idx) => (idx === ci ? { ...c, name } : c))
    }));
  }
  function addCategory() {
    setForm((f) => ({ ...f, questionCategories: [...f.questionCategories, { name: "", questions: [""] }] }));
  }
  function removeCategory(ci) {
    setForm((f) => ({ ...f, questionCategories: f.questionCategories.filter((_, idx) => idx !== ci) }));
  }
  function updateQuestion(ci, qi, value) {
    setForm((f) => ({
      ...f,
      questionCategories: f.questionCategories.map((c, idx) =>
        idx === ci ? { ...c, questions: c.questions.map((q, qidx) => (qidx === qi ? value : q)) } : c
      )
    }));
  }
  function addQuestion(ci) {
    setForm((f) => ({
      ...f,
      questionCategories: f.questionCategories.map((c, idx) => (idx === ci ? { ...c, questions: [...c.questions, ""] } : c))
    }));
  }
  function removeQuestion(ci, qi) {
    setForm((f) => ({
      ...f,
      questionCategories: f.questionCategories.map((c, idx) =>
        idx === ci ? { ...c, questions: c.questions.filter((_, qidx) => qidx !== qi) } : c
      )
    }));
  }

  return (
    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
      <Field
        label="title"
        value={form.title}
        onChange={(e) => {
          const title = e.target.value;
          setForm((f) => ({ ...f, title, slug: f._slugTouched ? f.slug : slugify(title) }));
        }}
      />
      <Field
        label="slug (public URL: /events/...)"
        value={form.slug}
        onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value), _slugTouched: true }))}
      />

      <div className="md:col-span-2">
        <TextAreaField
          label="about the session"
          rows={3}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />
      </div>

      <div className="md:col-span-2">
        <label className="text-xs font-semibold mb-1 block" style={labelStyle}>
          question categories / what will be covered
        </label>
        <div className="space-y-3">
          {form.questionCategories.map((cat, ci) => (
            <div key={ci} className="rounded-lg p-3 space-y-2" style={{ backgroundColor: "#0d0d0d", border: "1px solid #1a1a1a" }}>
              <div className="flex gap-2">
                <input
                  className="flex-1 rounded-lg px-3 py-2 text-sm font-bold text-white outline-none"
                  style={inputStyle}
                  value={cat.name}
                  placeholder={`Category ${ci + 1} (e.g. "Decoding feedback & surviving stakeholders")`}
                  onChange={(e) => updateCategoryName(ci, e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => removeCategory(ci)}
                  className="text-xs font-bold px-3 rounded-lg"
                  style={{ border: "1px solid #333", color: "#aaa" }}
                >
                  remove category
                </button>
              </div>
              <div className="pl-3 space-y-2">
                {cat.questions.map((q, qi) => (
                  <div key={qi} className="flex gap-2">
                    <input
                      className="flex-1 rounded-lg px-3 py-2 text-sm text-white outline-none"
                      style={inputStyle}
                      value={q}
                      placeholder={`Sample question ${qi + 1}`}
                      onChange={(e) => updateQuestion(ci, qi, e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => removeQuestion(ci, qi)}
                      className="text-xs font-bold px-3 rounded-lg"
                      style={{ border: "1px solid #333", color: "#aaa" }}
                    >
                      remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addQuestion(ci)}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg"
                  style={{ border: "1px solid #333", color: "#aaa" }}
                >
                  + add question
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addCategory}
            className="text-xs font-bold px-3 py-1.5 rounded-lg"
            style={{ border: `1px solid ${Y}`, color: Y }}
          >
            + add category
          </button>
        </div>
      </div>

      <Field type="date" label="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
      <Field type="time" label="time (IST)" value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} />
      <Field
        type="number"
        label="duration (minutes)"
        value={form.durationMinutes}
        onChange={(e) => setForm((f) => ({ ...f, durationMinutes: e.target.value }))}
      />
      <Field
        type="number"
        label="capacity (blank = unlimited)"
        value={form.capacity}
        onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
      />

      <Field
        label="speaker / host name"
        value={form.speaker_name}
        onChange={(e) => setForm((f) => ({ ...f, speaker_name: e.target.value }))}
      />
      <Field
        label="speaker title / role"
        value={form.speaker_title}
        placeholder="Senior Product Designer at ..."
        onChange={(e) => setForm((f) => ({ ...f, speaker_title: e.target.value }))}
      />
      <div className="md:col-span-2">
        <TextAreaField
          label="speaker bio"
          rows={2}
          value={form.speaker_bio}
          onChange={(e) => setForm((f) => ({ ...f, speaker_bio: e.target.value }))}
        />
      </div>

      <ImageField
        label="speaker photo"
        value={form.speaker_photo_url}
        pathPrefix="speakers"
        onUploaded={(url) => setForm((f) => ({ ...f, speaker_photo_url: url }))}
      />
      <ImageField
        label="cover image"
        value={form.cover_image_url}
        pathPrefix="covers"
        onUploaded={(url) => setForm((f) => ({ ...f, cover_image_url: url }))}
      />

      <div className="md:col-span-2">
        <Field
          label="join link (Zoom / Google Meet)"
          value={form.join_link}
          placeholder="https://meet.google.com/..."
          onChange={(e) => setForm((f) => ({ ...f, join_link: e.target.value }))}
        />
      </div>

      <div className="md:col-span-2 flex gap-2 pt-1">
        <button
          onClick={() => onSave("draft")}
          disabled={saving}
          className="text-xs font-bold px-4 py-2 rounded-lg"
          style={{ border: "1px solid #333", color: "#aaa" }}
        >
          {saving ? "saving…" : "save as draft"}
        </button>
        <button
          onClick={() => onSave("published")}
          disabled={saving}
          className="text-xs font-black px-4 py-2 rounded-lg"
          style={{ background: Y, color: "#111" }}
        >
          {saving ? "saving…" : "publish"}
        </button>
        <button
          onClick={onCancel}
          className="text-xs font-bold px-4 py-2 rounded-lg"
          style={{ border: "1px solid #333", color: "#aaa" }}
        >
          cancel
        </button>
      </div>
    </div>
  );
}

function eventToForm(event) {
  const { date, time } = utcToIst(event.start_time);
  const durationMinutes =
    event.start_time && event.end_time
      ? Math.round((new Date(event.end_time) - new Date(event.start_time)) / 60000)
      : 60;
  return {
    title: event.title || "",
    slug: event.slug || "",
    _slugTouched: true,
    description: event.description || "",
    questionCategories: event.question_categories?.length
      ? event.question_categories.map((c) => ({ name: c.name || "", questions: c.questions?.length ? c.questions : [""] }))
      : [{ name: "", questions: [""] }],
    date,
    time,
    durationMinutes: String(durationMinutes),
    speaker_name: event.speaker_name || "",
    speaker_title: event.speaker_title || "",
    speaker_bio: event.speaker_bio || "",
    speaker_photo_url: event.speaker_photo_url || "",
    cover_image_url: event.cover_image_url || "",
    join_link: event.join_link || "",
    capacity: event.capacity ?? ""
  };
}

function formToPayload(form, status) {
  const start_time = istToUtc(form.date, form.time);
  const durationMinutes = parseInt(form.durationMinutes, 10) || 0;
  const end_time = start_time ? new Date(new Date(start_time).getTime() + durationMinutes * 60000).toISOString() : null;
  return {
    title: form.title.trim(),
    slug: slugify(form.slug || form.title),
    description: form.description.trim() || null,
    question_categories: form.questionCategories
      .map((c) => ({ name: c.name.trim(), questions: c.questions.map((q) => q.trim()).filter(Boolean) }))
      .filter((c) => c.name),
    start_time,
    end_time,
    speaker_name: form.speaker_name.trim() || null,
    speaker_title: form.speaker_title.trim() || null,
    speaker_bio: form.speaker_bio.trim() || null,
    speaker_photo_url: form.speaker_photo_url || null,
    cover_image_url: form.cover_image_url || null,
    join_link: form.join_link.trim() || null,
    capacity: form.capacity === "" ? null : parseInt(form.capacity, 10),
    status
  };
}

export default function EventsTab() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [registrantsByEvent, setRegistrantsByEvent] = useState({});
  const [expandedId, setExpandedId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_FORM);
  const [editForm, setEditForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [inviteForm, setInviteForm] = useState({ email: "", name: "" });
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const { data: eventRows } = await supabaseAdmin.from("events").select("*").order("start_time", { ascending: false });
    const eventIds = (eventRows || []).map((e) => e.id);

    const { data: registrations } = eventIds.length
      ? await supabaseAdmin.from("event_registrations").select("*").in("event_id", eventIds)
      : { data: [] };

    const userIds = [...new Set((registrations || []).map((r) => r.user_id).filter(Boolean))];
    const { data: profiles } = userIds.length
      ? await supabaseAdmin.from("profiles").select("id, name, username, email").in("id", userIds)
      : { data: [] };
    const profileById = Object.fromEntries((profiles || []).map((p) => [p.id, p]));

    const byEvent = {};
    (registrations || []).forEach((r) => {
      byEvent[r.event_id] = byEvent[r.event_id] || [];
      byEvent[r.event_id].push({ ...r, profile: profileById[r.user_id] });
    });

    setEvents(eventRows || []);
    setRegistrantsByEvent(byEvent);
    setLoading(false);
  }

  async function handleCreate(status) {
    if (!createForm.title.trim() || !createForm.date) return;
    setSaving(true);
    const payload = formToPayload(createForm, status);
    const { data, error } = await supabaseAdmin.from("events").insert(payload).select().single();
    setSaving(false);
    if (error) {
      alert(error.message);
      return;
    }
    setEvents((prev) => [data, ...prev]);
    setCreating(false);
    setCreateForm(EMPTY_FORM);
    if (data.status === "published") syncCalendar(data.id);
  }

  function openEdit(event) {
    setEditForm(eventToForm(event));
    setExpandedId(event.id);
  }

  async function handleUpdate(event, status) {
    if (!editForm.title.trim() || !editForm.date) return;
    setSaving(true);
    const payload = formToPayload(editForm, status);
    const { data, error } = await supabaseAdmin.from("events").update(payload).eq("id", event.id).select().single();
    setSaving(false);
    if (error) {
      alert(error.message);
      return;
    }
    setEvents((prev) => prev.map((e) => (e.id === event.id ? data : e)));
    setEditForm(null);
    if (data.status === "published") syncCalendar(data.id);
  }

  async function handleCancelEvent(event) {
    if (!confirm(`Cancel "${event.title}"? Registrants will remain recorded.`)) return;
    const { data, error } = await supabaseAdmin
      .from("events")
      .update({ status: "cancelled" })
      .eq("id", event.id)
      .select()
      .single();
    if (error) {
      alert(error.message);
      return;
    }
    setEvents((prev) => prev.map((e) => (e.id === event.id ? data : e)));
  }

  async function handleInvite(event) {
    if (!inviteForm.email.trim()) return;
    setInviting(true);
    setInviteError("");
    setInviteSuccess("");
    try {
      await callEventsNotify({ mode: "invite", event_id: event.id, email: inviteForm.email.trim(), name: inviteForm.name.trim() });
      setInviteSuccess(`Invited ${inviteForm.email.trim()}`);
      setInviteForm({ email: "", name: "" });
      await fetchData();
    } catch (err) {
      setInviteError(err.message);
    } finally {
      setInviting(false);
    }
  }

  function copyLink(event) {
    const url = `${window.location.origin}/events/${event.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(event.id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  if (loading) {
    return <p className="text-sm" style={{ color: "#888" }}>loading…</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-black uppercase tracking-wide" style={{ color: Y }}>
          events ({events.length})
        </p>
        {!creating && (
          <button
            onClick={() => {
              setCreateForm(EMPTY_FORM);
              setCreating(true);
              setExpandedId(null);
            }}
            className="text-xs font-black px-4 py-2 rounded-lg"
            style={{ background: Y, color: "#111" }}
          >
            + new event
          </button>
        )}
      </div>

      {creating && (
        <div className="rounded-xl p-4" style={{ backgroundColor: "#111", border: `1px solid ${Y}55` }}>
          <p className="text-xs font-bold text-white mb-1">New event</p>
          <EventForm form={createForm} setForm={setCreateForm} onSave={handleCreate} onCancel={() => setCreating(false)} saving={saving} />
        </div>
      )}

      {events.length === 0 && !creating && (
        <p className="text-sm" style={{ color: "#666" }}>No events yet.</p>
      )}

      {events.map((event) => {
        const isExpanded = expandedId === event.id;
        const isEditing = isExpanded && editForm;
        const registrants = registrantsByEvent[event.id] || [];
        return (
          <div key={event.id} className="rounded-xl overflow-hidden" style={{ backgroundColor: "#111", border: "1px solid #1f1f1f" }}>
            <button
              type="button"
              onClick={() => {
                if (isExpanded) {
                  setExpandedId(null);
                  setEditForm(null);
                } else {
                  setExpandedId(event.id);
                  setEditForm(null);
                }
                setCreating(false);
              }}
              className="w-full flex flex-wrap items-center justify-between gap-3 p-4 text-left hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 20 20"
                  fill="none"
                  className="flex-shrink-0 transition-transform"
                  style={{ color: "#666", transform: isExpanded ? "rotate(90deg)" : "none" }}
                >
                  <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white truncate">{event.title}</p>
                  <p className="text-xs truncate" style={{ color: "#888" }}>
                    {fmtDt(event.start_time)} · {registrants.length} registered
                  </p>
                </div>
              </div>
              <span
                className="text-[10px] font-black uppercase tracking-wide px-2.5 py-1 rounded-full flex-shrink-0"
                style={{ color: STATUS_COLOR[event.status], border: `1px solid ${STATUS_COLOR[event.status]}55` }}
              >
                {event.status}
              </span>
            </button>

            {isExpanded && (
              <div className="p-4 pt-0 space-y-3">
                {isEditing ? (
                  <EventForm
                    form={editForm}
                    setForm={setEditForm}
                    onSave={(status) => handleUpdate(event, status)}
                    onCancel={() => setEditForm(null)}
                    saving={saving}
                  />
                ) : (
                  <>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => openEdit(event)}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg"
                        style={{ border: `1px solid ${Y}`, color: Y }}
                      >
                        edit
                      </button>
                      {event.status === "published" && (
                        <button
                          onClick={() => copyLink(event)}
                          className="text-xs font-bold px-3 py-1.5 rounded-lg"
                          style={{ border: "1px solid #333", color: "#aaa" }}
                        >
                          {copiedId === event.id ? "copied!" : "copy public link"}
                        </button>
                      )}
                      {event.status !== "cancelled" && (
                        <button
                          onClick={() => handleCancelEvent(event)}
                          className="text-xs font-bold px-3 py-1.5 rounded-lg"
                          style={{ border: "1px solid #ef444455", color: "#ef4444" }}
                        >
                          cancel event
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs" style={{ color: "#aaa" }}>
                      <div>
                        <p className="font-bold text-white mb-1">Session</p>
                        <p>{event.description || "no description"}</p>
                        {event.question_categories?.length > 0 && (
                          <div className="mt-1 space-y-1">
                            {event.question_categories.map((cat, i) => (
                              <div key={i}>
                                <p className="font-bold" style={{ color: Y }}>{cat.name}</p>
                                <ul className="list-disc list-inside">
                                  {cat.questions?.map((q, qi) => (
                                    <li key={qi}>{q}</li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-white mb-1">Speaker / host</p>
                        <p>{event.speaker_name || "—"} {event.speaker_title ? `· ${event.speaker_title}` : ""}</p>
                        <p style={{ color: "#888" }}>{event.speaker_bio || ""}</p>
                        <p className="mt-1">join link: {event.join_link || "not set"}</p>
                        <p>capacity: {event.capacity ?? "unlimited"}</p>
                      </div>
                    </div>

                    <div className="border-t pt-3 space-y-2" style={{ borderColor: "#1f1f1f" }}>
                      <p className="text-xs font-bold text-white">Invite someone directly</p>
                      <div className="flex flex-wrap gap-2">
                        <input
                          className="rounded-lg px-3 py-2 text-sm text-white outline-none flex-1 min-w-[160px]"
                          style={inputStyle}
                          placeholder="email"
                          value={inviteForm.email}
                          onChange={(e) => setInviteForm((f) => ({ ...f, email: e.target.value }))}
                        />
                        <input
                          className="rounded-lg px-3 py-2 text-sm text-white outline-none flex-1 min-w-[140px]"
                          style={inputStyle}
                          placeholder="name (optional)"
                          value={inviteForm.name}
                          onChange={(e) => setInviteForm((f) => ({ ...f, name: e.target.value }))}
                        />
                        <button
                          onClick={() => handleInvite(event)}
                          disabled={inviting}
                          className="text-xs font-bold px-4 py-2 rounded-lg"
                          style={{ background: Y, color: "#111" }}
                        >
                          {inviting ? "inviting…" : "invite"}
                        </button>
                      </div>
                      {inviteError && <p className="text-xs" style={{ color: "#ef4444" }}>{inviteError}</p>}
                      {inviteSuccess && <p className="text-xs" style={{ color: "#22c55e" }}>{inviteSuccess}</p>}
                    </div>

                    <div className="border-t pt-3" style={{ borderColor: "#1f1f1f" }}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-bold text-white">Registrants ({registrants.length})</p>
                        <button
                          onClick={() =>
                            downloadCSV(
                              `${event.slug}-registrants.csv`,
                              registrants.map((r) => ({
                                name: r.profile?.name || r.invitee_name || "",
                                username: r.profile?.username || "",
                                email: r.profile?.email || r.invitee_email || "",
                                registered_at: r.registered_at,
                                status: r.status,
                                source: r.source,
                                question_category: r.question_category || "",
                                question_text: r.question_text || "",
                                question_anonymous: r.question_anonymous
                              }))
                            )
                          }
                          disabled={registrants.length === 0}
                          className="text-xs font-bold px-3 py-1.5 rounded-lg disabled:opacity-40"
                          style={{ border: "1px solid #333", color: "#aaa" }}
                        >
                          export CSV
                        </button>
                      </div>
                      {registrants.length === 0 ? (
                        <p className="text-xs" style={{ color: "#555" }}>No registrants yet.</p>
                      ) : (
                        <div className="space-y-1 text-xs" style={{ color: "#aaa" }}>
                          {registrants.map((r) => (
                            <div key={r.id}>
                              <p>
                                {r.profile?.name || r.invitee_name || "—"} ({r.profile?.email || r.invitee_email || "—"}) ·{" "}
                                {fmtDt(r.registered_at)}
                                {r.source === "admin_invite" && (
                                  <span className="ml-2 text-[10px] font-bold uppercase tracking-wide" style={{ color: Y }}>
                                    invited
                                  </span>
                                )}
                                {!r.calendar_synced && (
                                  <span className="ml-2 text-[10px]" style={{ color: "#666" }}>
                                    (calendar/email pending)
                                  </span>
                                )}
                              </p>
                              {r.question_text && (
                                <p style={{ color: "#888" }}>
                                  {r.question_anonymous ? "anonymous" : "asked"}
                                  {r.question_category ? ` · ${r.question_category}` : ""}: "{r.question_text}"
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
