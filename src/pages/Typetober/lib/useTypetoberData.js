import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../../../supabaseClient";
import { CERT_TIERS } from "./constants";

export function publicImageUrl(path) {
  if (!path) return null;
  const { data } = supabase.storage.from("typetober-submissions").getPublicUrl(path);
  return data?.publicUrl || null;
}

/**
 * Loads every "live" (paid + successful) submission plus the signed-in
 * user's own rows (so a still-pending payment can still show as "yours").
 * Client only ever reads this table — every write (pending insert, then
 * success flip) happens server-side in api/razorpay-create-order.js with
 * the service-role key, see supabase/migrations/typetober_submissions.sql.
 */
export function useTypetoberData(user) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [examples, setExamples] = useState([]);
  const [streakRow, setStreakRow] = useState(null);

  // Admin-uploaded sample illustrations (max two per letter) are public, so
  // they load for signed-out visitors too.
  useEffect(() => {
    supabase
      .from("typetober_examples")
      .select("id,letter_index,slot,image_path,credit")
      .order("slot", { ascending: true })
      .then(({ data, error }) => {
        if (error) console.error("typetober examples load error:", error);
        setExamples(data || []);
      });
  }, []);

  const refresh = useCallback(async () => {
    if (!user) {
      setRows([]);
      setStreakRow(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from("typetober_streaks")
      .select("current_streak,best_streak,last_day")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => setStreakRow(data || null));
    const { data, error } = await supabase
      .from("typetober_submissions")
      .select(
        "id,user_id,letter_index,image_path,caption,status,created_at,profiles(name,avatar_url,username)"
      )
      .or(`status.eq.success,user_id.eq.${user.id}`)
      .order("created_at", { ascending: true });
    if (error) console.error("typetober load error:", error);
    setRows(data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // letter_index (0-25) -> array of { ...row, imageUrl, isMine }
  const wallByLetter = useMemo(() => {
    const map = new Map();
    rows.forEach((r) => {
      if (r.status !== "success") return;
      const arr = map.get(r.letter_index) || [];
      arr.push({ ...r, imageUrl: publicImageUrl(r.image_path), isMine: r.user_id === user?.id });
      map.set(r.letter_index, arr);
    });
    return map;
  }, [rows, user]);

  // letter_index -> array of the user's own rows (any status), oldest first.
  // A letter can hold several submissions — each one is paid separately.
  const mySubmissions = useMemo(() => {
    const map = new Map();
    rows
      .filter((r) => r.user_id === user?.id)
      .forEach((r) => {
        const arr = map.get(r.letter_index) || [];
        arr.push({ ...r, imageUrl: publicImageUrl(r.image_path) });
        map.set(r.letter_index, arr);
      });
    return map;
  }, [rows, user]);

  // Certificates count paid submissions, not distinct letters: two A's = 2.
  const stats = useMemo(() => {
    let total = 0;
    let letters = 0;
    mySubmissions.forEach((arr) => {
      const paid = arr.filter((r) => r.status === "success").length;
      total += paid;
      if (paid) letters++;
    });
    const tiers = {};
    CERT_TIERS.forEach((t) => {
      tiers[t.key] = total >= t.need;
    });
    return { total, letters, ...tiers };
  }, [mySubmissions]);

  // letter_index -> up to two example items, in slot order
  const examplesByLetter = useMemo(() => {
    const map = new Map();
    examples.forEach((e) => {
      const arr = map.get(e.letter_index) || [];
      if (arr.length < 2) arr.push({ ...e, imageUrl: publicImageUrl(e.image_path), isExample: true });
      map.set(e.letter_index, arr);
    });
    return map;
  }, [examples]);

  // The server keeps the streak (see typetober_bump_streak in the migration);
  // it only goes stale when a day is missed, which we detect here.
  const streak = useMemo(() => {
    if (!streakRow?.last_day) return { current: 0, best: streakRow?.best_streak || 0, today: false };
    const todayIst = new Date(Date.now() + 5.5 * 3600000).toISOString().slice(0, 10);
    const yIst = new Date(Date.now() + 5.5 * 3600000 - 86400000).toISOString().slice(0, 10);
    const alive = streakRow.last_day === todayIst || streakRow.last_day === yIst;
    return {
      current: alive ? streakRow.current_streak : 0,
      best: streakRow.best_streak,
      today: streakRow.last_day === todayIst
    };
  }, [streakRow]);

  return { rows, examplesByLetter, streak, wallByLetter, mySubmissions, stats, loading, refresh };
}
