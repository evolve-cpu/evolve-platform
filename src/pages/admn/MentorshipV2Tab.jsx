import { useEffect, useState } from "react";
import { supabaseAdmin } from "../../supabaseAdminClient";

const Y = "#FFD007";
const inputStyle = { backgroundColor: "#0d0d0d", border: "1px solid #262626" };
const labelStyle = { color: "#666" };
const SESSION_NUMBERS = [1, 2, 3, 4, 5];
const JOB_APPLICATION_SLOTS = [6, 7, 8, 9, 10, 11];

function slotLabel(n) {
  if (n <= 5) return `Session ${n}`;
  const idx = n - 6;
  return `Job application ${Math.floor(idx / 2) + 1} · Call ${(idx % 2) + 1}`;
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

function SkillTrackerCell({ label, tracker, expanded, onToggle }) {
  return (
    <div>
      <p className="font-bold text-white mb-1">{label}</p>
      {tracker?.submitted_at ? (
        <button onClick={onToggle} className="underline" style={{ color: Y }}>
          submitted — {expanded ? "hide" : "view"} ratings
        </button>
      ) : (
        <p style={{ color: "#555" }}>not submitted</p>
      )}
    </div>
  );
}

/**
 * Admin view for the new individual-mentorship flow — entirely separate
 * from the old batch flow's tabs in this same dashboard. Self-contained,
 * own supabaseAdmin fetches — same pattern as EvolveReviewsPanel.jsx.
 *
 * Per slot (1-5 sessions, plus 6-11 job-application calls for the
 * application_support plan): datetime + join link (set before the call,
 * mirrors AcceleratorTab's booking_link pattern) and recording_url +
 * session_notes (set after the call happens) all live on the same
 * mentorship_session_links row and are edited together here. Feedback
 * (mentorship_session_feedback_v2) is read-only — that's the learner's own
 * submission. For slots 6-11, the learner's own day/time preference
 * (mentorship_call_bookings) is shown too, so the admin knows what to
 * schedule before pasting the real link.
 */
export default function MentorshipV2Tab() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [editingKey, setEditingKey] = useState(null); // `${userId}:${sessionNumber}`
  const [form, setForm] = useState({ date: "", time: "21:00", join_link: "", recording_url: "", session_notes: "" });
  const [saving, setSaving] = useState(false);
  const [expandedSkills, setExpandedSkills] = useState(null); // `${userId}:foundation` | `${userId}:stream`
  const [expandedUserId, setExpandedUserId] = useState(null);

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
    const [
      { data: profiles },
      { data: intake },
      { data: bookings },
      { data: skillsFoundation },
      { data: skillsStream },
      { data: links },
      { data: feedbacks },
      { data: callBookings }
    ] = userIds.length
      ? await Promise.all([
          supabaseAdmin.from("profiles").select("id, name, username, email").in("id", userIds),
          supabaseAdmin.from("mentorship_intake").select("*").in("user_id", userIds),
          supabaseAdmin.from("mentorship_bookings").select("*").in("user_id", userIds),
          supabaseAdmin.from("mentorship_skill_tracker").select("*").in("user_id", userIds),
          supabaseAdmin.from("mentorship_stream_skill_tracker").select("*").in("user_id", userIds),
          supabaseAdmin.from("mentorship_session_links").select("*").in("user_id", userIds),
          supabaseAdmin.from("mentorship_session_feedback_v2").select("*").in("user_id", userIds),
          supabaseAdmin.from("mentorship_call_bookings").select("*").in("user_id", userIds)
        ])
      : [{ data: [] }, { data: [] }, { data: [] }, { data: [] }, { data: [] }, { data: [] }, { data: [] }, { data: [] }];

    const byUser = (list) => Object.fromEntries((list || []).map((r) => [r.user_id, r]));
    const byUserThenSession = (list) => {
      const out = {};
      (list || []).forEach((r) => {
        out[r.user_id] = out[r.user_id] || {};
        out[r.user_id][r.session_number] = r;
      });
      return out;
    };
    const profileById = Object.fromEntries((profiles || []).map((p) => [p.id, p]));
    const intakeByUser = byUser(intake);
    const bookingByUser = byUser(bookings);
    const foundationByUser = byUser(skillsFoundation);
    const streamByUser = byUser(skillsStream);
    const linksByUser = byUserThenSession(links);
    const feedbackByUser = byUserThenSession(feedbacks);
    const callBookingByUser = byUserThenSession(callBookings);

    setRows(
      (enrollments || []).map((e) => ({
        enrollment: e,
        profile: profileById[e.user_id],
        intake: intakeByUser[e.user_id],
        booking: bookingByUser[e.user_id],
        skillFoundation: foundationByUser[e.user_id],
        skillStream: streamByUser[e.user_id],
        links: linksByUser[e.user_id] || {},
        feedbacks: feedbackByUser[e.user_id] || {},
        callBookings: callBookingByUser[e.user_id] || {}
      }))
    );
    setLoading(false);
  }

  function openEdit(userId, sessionNumber, link) {
    const { date, time } = utcToIst(link?.session_datetime);
    setForm({
      date,
      time,
      join_link: link?.join_link || "",
      recording_url: link?.recording_url || "",
      session_notes: link?.session_notes || ""
    });
    setEditingKey(`${userId}:${sessionNumber}`);
  }

  async function handleSave(userId, sessionNumber) {
    setSaving(true);
    const payload = {
      user_id: userId,
      session_number: sessionNumber,
      session_datetime: istToUtc(form.date, form.time),
      join_link: form.join_link.trim() || null,
      recording_url: form.recording_url.trim() || null,
      session_notes: form.session_notes.trim() || null
    };
    const { data, error } = await supabaseAdmin
      .from("mentorship_session_links")
      .upsert(payload, { onConflict: "user_id,session_number" })
      .select()
      .single();
    setSaving(false);
    if (error) return;
    setRows((prev) =>
      prev.map((r) =>
        r.enrollment.user_id === userId ? { ...r, links: { ...r.links, [sessionNumber]: data } } : r
      )
    );
    setEditingKey(null);
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
        const { enrollment, profile, intake, booking, skillFoundation, skillStream, links, feedbacks, callBookings } = row;
        const uid = enrollment.user_id;
        const slotNumbers = enrollment.plan === "application_support" ? [...SESSION_NUMBERS, ...JOB_APPLICATION_SLOTS] : SESSION_NUMBERS;
        const isExpanded = expandedUserId === uid;
        const completedCount = slotNumbers.filter((n) => feedbacks[n]).length;
        return (
          <div
            key={enrollment.id}
            className="rounded-xl overflow-hidden"
            style={{ backgroundColor: "#111", border: "1px solid #1f1f1f" }}
          >
            <button
              type="button"
              onClick={() => setExpandedUserId(isExpanded ? null : uid)}
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
                  <p className="text-sm font-bold text-white truncate">
                    {profile?.name || "—"} <span style={{ color: "#666" }}>@{profile?.username || "—"}</span>
                  </p>
                  <p className="text-xs truncate" style={{ color: "#888" }}>
                    {profile?.email}
                    {enrollment.phone ? ` · ${enrollment.phone}` : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-xs" style={{ color: "#666" }}>
                  {completedCount}/{slotNumbers.length} done
                </span>
                <span
                  className="text-[10px] font-black uppercase tracking-wide px-2.5 py-1 rounded-full"
                  style={{ color: Y, border: `1px solid ${Y}55` }}
                >
                  {enrollment.plan}
                </span>
              </div>
            </button>

            {isExpanded && (
              <div className="p-4 pt-0 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs" style={{ color: "#aaa" }}>
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

              <SkillTrackerCell
                label="Foundation skill tracker"
                tracker={skillFoundation}
                expanded={expandedSkills === `${uid}:foundation`}
                onToggle={() => setExpandedSkills(expandedSkills === `${uid}:foundation` ? null : `${uid}:foundation`)}
              />
              <SkillTrackerCell
                label="Stream skill tracker"
                tracker={skillStream}
                expanded={expandedSkills === `${uid}:stream`}
                onToggle={() => setExpandedSkills(expandedSkills === `${uid}:stream` ? null : `${uid}:stream`)}
              />
            </div>

            {expandedSkills === `${uid}:foundation` && skillFoundation?.ratings && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 text-[11px] rounded-lg p-3" style={{ backgroundColor: "#0d0d0d" }}>
                {Object.entries(skillFoundation.ratings).map(([id, r]) => (
                  <p key={id} style={{ color: "#999" }}>
                    {id}: <span className="text-white">{r.current || 0}</span>/<span style={{ color: Y }}>{r.goal || 0}</span>
                  </p>
                ))}
              </div>
            )}
            {expandedSkills === `${uid}:stream` && skillStream?.ratings && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 text-[11px] rounded-lg p-3" style={{ backgroundColor: "#0d0d0d" }}>
                {Object.entries(skillStream.ratings).map(([id, r]) => (
                  <p key={id} style={{ color: "#999" }}>
                    {id}: <span className="text-white">{r.current || 0}</span>/<span style={{ color: Y }}>{r.goal || 0}</span>
                  </p>
                ))}
              </div>
            )}

            <div className="border-t pt-3 space-y-3" style={{ borderColor: "#1f1f1f" }}>
              <p className="text-xs font-bold text-white">Sessions</p>
              {slotNumbers.map((n) => {
                const link = links[n];
                const feedback = feedbacks[n];
                const callBooking = callBookings[n];
                const isEditing = editingKey === `${uid}:${n}`;
                return (
                  <div key={n} className="rounded-lg p-3" style={{ backgroundColor: "#0d0d0d", border: "1px solid #1a1a1a" }}>
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <p className="text-xs font-bold" style={{ color: Y }}>{slotLabel(n)}</p>
                      {!isEditing && (
                        <button
                          onClick={() => openEdit(uid, n, link)}
                          className="text-xs font-bold px-3 py-1.5 rounded-lg"
                          style={{ border: `1px solid ${Y}`, color: Y }}
                        >
                          {link ? "edit" : "set up"}
                        </button>
                      )}
                    </div>
                    {!isEditing && (
                      <div className="text-xs mt-1.5 space-y-0.5" style={{ color: "#888" }}>
                        {n > 5 && (
                          <p>learner picked: {callBooking ? `${callBooking.preferred_day} · ${callBooking.preferred_time}` : "not booked yet"}</p>
                        )}
                        <p>{fmtDt(link?.session_datetime)} · {link?.join_link || "no join link set"}</p>
                        <p>recording: {link?.recording_url || "not uploaded"}</p>
                        <p>
                          feedback:{" "}
                          {feedback
                            ? feedback.attended
                              ? `${feedback.rating}/5 — "${feedback.feedback_text}"`
                              : "did not attend"
                            : "not submitted yet"}
                        </p>
                      </div>
                    )}
                    {isEditing && (
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Field type="date" label="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
                        <Field type="time" label="time (IST)" value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} />
                        <div className="md:col-span-2">
                          <Field
                            label="calendly / meeting link"
                            value={form.join_link}
                            placeholder="https://calendly.com/..."
                            onChange={(e) => setForm((f) => ({ ...f, join_link: e.target.value }))}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Field
                            label="recording link (after the call)"
                            value={form.recording_url}
                            placeholder="https://drive.google.com/..."
                            onChange={(e) => setForm((f) => ({ ...f, recording_url: e.target.value }))}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <TextAreaField
                            label="session notes (shown to the learner)"
                            rows={2}
                            value={form.session_notes}
                            placeholder="Good progress this session — ..."
                            onChange={(e) => setForm((f) => ({ ...f, session_notes: e.target.value }))}
                          />
                        </div>
                        <div className="md:col-span-2 flex gap-2">
                          <button
                            onClick={() => handleSave(uid, n)}
                            disabled={saving}
                            className="text-xs font-black px-4 py-2 rounded-lg"
                            style={{ background: Y, color: "#111" }}
                          >
                            {saving ? "saving…" : "save"}
                          </button>
                          <button
                            onClick={() => setEditingKey(null)}
                            className="text-xs font-bold px-4 py-2 rounded-lg"
                            style={{ border: "1px solid #333", color: "#aaa" }}
                          >
                            cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
