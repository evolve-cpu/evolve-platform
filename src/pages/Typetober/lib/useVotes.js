import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";

const MESSAGES = {
  own_submission: "You can't vote for your own submission.",
  voting_closed: "Voting is closed.",
  not_found: "That submission isn't available.",
  unauthorized: "Sign in to vote."
};

/**
 * Community-favourite voting (see supabase/migrations/typetober_voting.sql).
 * Loads the window, the vote limit, every submission's count and which ones
 * this person voted for, and casts / takes back votes. All the rules (own
 * work, limit, window) are checked on the server; this only mirrors them.
 */
export function useVotes(user) {
  const [config, setConfig] = useState(null); // { opensAt, closesAt, limit }
  const [counts, setCounts] = useState({}); // submission id -> votes
  const [mine, setMine] = useState(() => new Set());
  const [busy, setBusy] = useState(() => new Set());

  const userId = user?.id;
  const refresh = useCallback(async () => {
    const { data, error } = await supabase.rpc("typetober_vote_state");
    if (error) {
      console.error("typetober vote state error:", error);
      return;
    }
    if (!data) return;
    setConfig({ opensAt: data.opens_at, closesAt: data.closes_at, limit: data.vote_limit });
    setCounts(data.counts || {});
    setMine(new Set(data.mine || []));
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  /** Toggles a vote. Resolves to an error message, or "" on success. */
  async function toggle(item) {
    const id = item.id;
    if (busy.has(id)) return "";
    if (!userId) return MESSAGES.unauthorized;
    const voting = !mine.has(id);
    if (voting && item.user_id === userId) {
      // Still sent so the attempt shows up in the admin report.
      supabase.rpc("typetober_cast_vote", { sub_id: id, cast_it: true }).then(() => {});
      return MESSAGES.own_submission;
    }
    if (voting && config && mine.size >= config.limit) {
      return `You've used all ${config.limit} votes. Take one back to vote for this.`;
    }

    setBusy((s) => new Set(s).add(id));
    const { data, error } = await supabase.rpc("typetober_cast_vote", { sub_id: id, cast_it: voting });
    setBusy((s) => {
      const n = new Set(s);
      n.delete(id);
      return n;
    });
    if (error || !data) {
      console.error("typetober vote error:", error);
      return "Couldn't save your vote. Try again.";
    }
    setCounts((c) => ({ ...c, [id]: data.votes }));
    if (!data.ok) {
      if (data.error === "limit_reached")
        return `You've used all ${data.limit} votes. Take one back to vote for this.`;
      return MESSAGES[data.error] || "Couldn't save your vote. Try again.";
    }
    setMine((m) => {
      const n = new Set(m);
      if (voting) n.add(id);
      else n.delete(id);
      return n;
    });
    return "";
  }

  return { config, counts, mine, busy, toggle, refresh };
}
