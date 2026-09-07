import { useEffect, useState } from "react";
import { supabaseAdmin } from "../../supabaseAdminClient";

const Y = "#FFD007";
const inputStyle = { backgroundColor: "#0d0d0d", border: "1px solid #262626" };
const labelStyle = { color: "#666" };

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

// Same IST<->UTC convention already used by SessionsTab/AcceleratorTab
// elsewhere in AdminDashboard.jsx.
function istToUtc(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;
  const [h, m] = timeStr.split(":").map(Number);
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCHours(h - 5, m - 30, 0, 0);
  return d.toISOString();
}
function utcToIst(dtStr) {
  if (!dtStr) return { date: "", time: "21:00" };
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

/**
 * Admin view for the new individual-mentorship flow (mentorship_enrollments
 * / mentorship_intake / mentorship_bookings / mentorship_skill_tracker /
 * mentorship_session_links) — entirely separate from the old batch flow's
 * tabs in this same dashboard. Self-contained, own supabaseAdmin fetches —
 * same pattern as EvolveReviewsPanel.jsx, wired into AdminDashboard.jsx's
 * tab list the same way.
 *
 * Session 1's datetime + join link (the "calendly / booking link" for the
 * real, manually-scheduled meeting) is set here — mirrors the existing
 * AcceleratorTab's booking_link pattern, just against the new isolated
 * table instead of mentorship_accelerator_bonus.
 */
export default function MentorshipV2Tab() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [editingUserId, setEditingUserId] = useState(null);
  const [form, setForm] = useState({ date: "", time: "21:00", join_link: "" });
  const [saving, setSaving] = useState(false);
  const [expandedSkills, setExpandedSkills] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const { data: enrollments } = await supabaseAdmin
      .from("mentorship_enrollments")
      .select("*")
      .eq("status", "success")
      .order("created_at", { ascending: false });

    const userIds = (enrollments || []).map((e) => e.user_id);
    const [{ data: profiles }, { data: intake }, { data: bookings }, { data: skills }, { data: links }] =
      userIds.length
        ? await Promise.all([
            supabaseAdmin.from("profiles").select("id, name, username, email").in("id", userIds),
            supabaseAdmin.from("mentorship_intake").select("*").in("user_id", userIds),
            supabaseAdmin.from("mentorship_bookings").select("*").in("user_id", userIds),
            supabaseAdmin.from("mentorship_skill_tracker").select("*").in("user_id", userIds),
            supabaseAdmin
              .from("mentorship_session_links")
              .select("*")
              .in("user_id", userIds)
              .eq("session_number", 1)
          ])
        : [{ data: [] }, { data: [] }, { data: [] }, { data: [] }, { data: [] }];

    const byUser = (list) => Object.fromEntries((list || []).map((r) => [r.user_id, r]));
    const profileById = Object.fromEntries((profiles || []).map((p) => [p.id, p]));
    const intakeByUser = byUser(intake);
    const bookingByUser = byUser(bookings);
    const skillByUser = byUser(skills);
    const linkByUser = byUser(links);

    setRows(
      (enrollments || []).map((e) => ({
        enrollment: e,
        profile: profileById[e.user_id],
        intake: intakeByUser[e.user_id],
        booking: bookingByUser[e.user_id],
        skill: skillByUser[e.user_id],
        link: linkByUser[e.user_id]
      }))
    );
    setLoading(false);
  }

  function openEdit(row) {
    const { date, time } = utcToIst(row.link?.session_datetime);
    setForm({ date, time, join_link: row.link?.join_link || "" });
    setEditingUserId(row.enrollment.user_id);
  }

  async function handleSave(userId) {
    setSaving(true);
    const payload = {
      user_id: userId,
      session_number: 1,
      session_datetime: istToUtc(form.date, form.time),
      join_link: form.join_link.trim() || null
    };
    const { data, error } = await supabaseAdmin
      .from("mentorship_session_links")
      .upsert(payload, { onConflict: "user_id,session_number" })
      .select()
      .single();
    setSaving(false);
    if (error) return;
    setRows((prev) => prev.map((r) => (r.enrollment.user_id === userId ? { ...r, link: data } : r)));
    setEditingUserId(null);
  }

  if (loading) {
    return <p className="text-sm" style={{ color: "#888" }}>loading…</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs font-black uppercase tracking-wide" style={{ color: Y }}>
        individual mentorship ({rows.length})
      </p>

      {rows.length === 0 && (
        <p className="text-sm" style={{ color: "#666" }}>No paid enrollments yet.</p>
      )}

      {rows.map((row) => {
        const { enrollment, profile, intake, booking, skill, link } = row;
        const isEditing = editingUserId === enrollment.user_id;
        return (
          <div
            key={enrollment.id}
            className="rounded-xl p-4 space-y-3"
            style={{ backgroundColor: "#111", border: "1px solid #1f1f1f" }}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-bold text-white">
                  {profile?.name || "—"} <span style={{ color: "#666" }}>@{profile?.username || "—"}</span>
                </p>
                <p className="text-xs" style={{ color: "#888" }}>{profile?.email}</p>
              </div>
              <span
                className="text-[10px] font-black uppercase tracking-wide px-2.5 py-1 rounded-full"
                style={{ color: Y, border: `1px solid ${Y}55` }}
              >
                {enrollment.plan}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs" style={{ color: "#aaa" }}>
              <div>
                <p className="font-bold text-white mb-1">Before we begin</p>
                {intake ? (
                  <div className="space-y-0.5">
                    <p>portfolio: {intake.portfolio_value || "—"}</p>
                    <p>resume: {intake.resume_link || "—"}</p>
                    <p>walkthrough: {intake.walkthrough_link || "—"}</p>
                    {intake.expectations && <p className="mt-1" style={{ color: "#888" }}>"{intake.expectations}"</p>}
                  </div>
                ) : (
                  <p style={{ color: "#555" }}>not submitted</p>
                )}
              </div>

              <div>
                <p className="font-bold text-white mb-1">Book a slot</p>
                {booking ? (
                  <p>{booking.preferred_day} · {booking.preferred_time}</p>
                ) : (
                  <p style={{ color: "#555" }}>not booked</p>
                )}
              </div>

              <div>
                <p className="font-bold text-white mb-1">Skill tracker</p>
                {skill?.submitted_at ? (
                  <button
                    onClick={() => setExpandedSkills(expandedSkills === enrollment.user_id ? null : enrollment.user_id)}
                    className="underline"
                    style={{ color: Y }}
                  >
                    submitted — {expandedSkills === enrollment.user_id ? "hide" : "view"} ratings
                  </button>
                ) : (
                  <p style={{ color: "#555" }}>not submitted</p>
                )}
              </div>
            </div>

            {expandedSkills === enrollment.user_id && skill?.ratings && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 text-[11px] rounded-lg p-3" style={{ backgroundColor: "#0d0d0d" }}>
                {Object.entries(skill.ratings).map(([id, r]) => (
                  <p key={id} style={{ color: "#999" }}>
                    {id}: <span className="text-white">{r.current || 0}</span>/<span style={{ color: Y }}>{r.goal || 0}</span>
                  </p>
                ))}
              </div>
            )}

            <div className="border-t pt-3" style={{ borderColor: "#1f1f1f" }}>
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-white">Session 1 meeting</p>
                {!isEditing && (
                  <button
                    onClick={() => openEdit(row)}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg"
                    style={{ border: `1px solid ${Y}`, color: Y }}
                  >
                    {link ? "edit" : "set link"}
                  </button>
                )}
              </div>
              {!isEditing && (
                <p className="text-xs mt-1" style={{ color: "#888" }}>
                  {fmtDt(link?.session_datetime)} · {link?.join_link || "no link set"}
                </p>
              )}
              {isEditing && (
                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Field type="date" label="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
                  <Field type="time" label="time (IST)" value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} />
                  <div className="md:col-span-3">
                    <Field
                      label="calendly / meeting link"
                      value={form.join_link}
                      placeholder="https://calendly.com/..."
                      onChange={(e) => setForm((f) => ({ ...f, join_link: e.target.value }))}
                    />
                  </div>
                  <div className="md:col-span-3 flex gap-2">
                    <button
                      onClick={() => handleSave(enrollment.user_id)}
                      disabled={saving}
                      className="text-xs font-black px-4 py-2 rounded-lg"
                      style={{ background: Y, color: "#111" }}
                    >
                      {saving ? "saving…" : "save"}
                    </button>
                    <button
                      onClick={() => setEditingUserId(null)}
                      className="text-xs font-bold px-4 py-2 rounded-lg"
                      style={{ border: "1px solid #333", color: "#aaa" }}
                    >
                      cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
