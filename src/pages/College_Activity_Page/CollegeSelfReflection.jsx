import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../../supabaseClient";

// ✅ your star svgs (put them in same folder exports like you did before)
import {
  hollow_star,
  filled_star,
  left_arrow_activity
} from "../../assets/images/College_Activity_Page";

const QUESTIONS = [
  {
    key: "interest",
    title: "level of interest?",
    sub: '(from “curious” to “very invested")'
  },
  {
    key: "skill",
    title: "how skilled do you currently feel?",
    sub: "Based on your experience so far"
  },
  {
    key: "natural",
    title: "does this come naturally to you?",
    sub: "how easily you pick it up"
  },
  {
    key: "finance",
    title: "do you see this becoming financially viable?",
    sub: "based on what you know today"
  }
];

export default function CollegeSelfReflection() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const [activeTab, setActiveTab] = useState("reflect"); // "reflect" | "review"

  // reflect form state
  const [area, setArea] = useState("");
  const [ratings, setRatings] = useState({
    interest: 0,
    skill: 0,
    natural: 0,
    finance: 0
  });

  const [hoverRating, setHoverRating] = useState({
    interest: 0,
    skill: 0,
    natural: 0,
    finance: 0
  });

  // review list state
  const [fields, setFields] = useState([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ✅ fetch saved progress if user comes back
  useEffect(() => {
    const fetchSaved = async () => {
      try {
        setLoading(true);

        if (!id) return;

        const { data, error } = await supabase
          .from("college_activations")
          .select("self_reflection_answers")
          .eq("id", id)
          .single();

        if (error) throw error;

        const saved = data?.self_reflection_answers;

        if (saved?.fields?.length) {
          setFields(saved.fields);
        }
      } catch (err) {
        console.log("fetch error:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSaved();
  }, [id]);

  const reviewCount = fields.length;

  // const canAddField = useMemo(() => {
  //   if (!area.trim()) return false;

  //   // ✅ all 4 questions must be answered
  //   return (
  //     ratings.interest > 0 &&
  //     ratings.skill > 0 &&
  //     ratings.natural > 0 &&
  //     ratings.finance > 0
  //   );
  // }, [area, ratings]);

  const canAddField = useMemo(() => {
    const cleanedArea = area.replace(/\s+/g, " ").trim();

    if (!cleanedArea) return false;

    return (
      ratings.interest > 0 &&
      ratings.skill > 0 &&
      ratings.natural > 0 &&
      ratings.finance > 0
    );
  }, [area, ratings]);

  const handleAddField = async () => {
    setError("");

    if (!id)
      return setError("Session not found. Please go back and start again.");
    if (!canAddField)
      return setError("Please fill the field + all ratings first.");

    // ✅ prevent duplicate area names
    const alreadyExists = fields.some(
      (f) => f.area.toLowerCase().trim() === area.toLowerCase().trim()
    );

    if (alreadyExists) {
      return setError("This area is already added. Try a different field.");
    }

    const newEntry = {
      area: area.trim(),
      ratings: { ...ratings }
    };

    const nextFields = [...fields, newEntry];
    setFields(nextFields);

    // ✅ reset reflect inputs
    setArea("");
    setRatings({
      interest: 0,
      skill: 0,
      natural: 0,
      finance: 0
    });
    setHoverRating({
      interest: 0,
      skill: 0,
      natural: 0,
      finance: 0
    });

    // ✅ Save immediately to Supabase
    try {
      setSaving(true);

      const payload = {
        fields: nextFields,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from("college_activations")
        .update({
          self_reflection_answers: payload
        })
        .eq("id", id);

      if (error) throw error;
    } catch (err) {
      console.log(err.message);
      setError("Saved locally, but failed to sync. Please try again.");
    } finally {
      setSaving(false);
    }

    // ✅ jump to review tab
    setActiveTab("review");
  };

  const handleSaveAndFinish = async () => {
    setError("");

    if (!id) return setError("Session not found.");
    if (!fields.length) return setError("Please add at least one field.");

    try {
      setSaving(true);

      const payload = {
        fields,
        completed: true,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from("college_activations")
        .update({
          self_reflection_answers: payload
        })
        .eq("id", id);

      if (error) throw error;

      // ✅ back to activities listing (activity 2 will unlock)
      navigate(`/college-activation/activities?id=${id}`);
    } catch (err) {
      setError(err.message || "Failed to save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const RatingStars = ({ qKey }) => {
    const current = ratings[qKey];

    // ✅ Detect if device supports hover (desktop/laptop)
    const isHoverDevice = window.matchMedia("(hover: hover)").matches;

    return (
      <div className="flex items-center gap-3">
        {[1, 2, 3, 4, 5].map((n) => {
          // ✅ Desktop: filled only based on FINAL click rating
          // ✅ Mobile: keep hover preview (already works fine)
          const filled = isHoverDevice
            ? n <= current
            : hoverRating[qKey]
            ? n <= hoverRating[qKey]
            : n <= current;

          return (
            <button
              key={n}
              type="button"
              // ✅ Hover effect ONLY for mobile devices (touch)
              onMouseEnter={() => {
                if (isHoverDevice) return; // ✅ disable hover preview in desktop
                setHoverRating((p) => ({ ...p, [qKey]: n }));
              }}
              onMouseLeave={() => {
                if (isHoverDevice) return; // ✅ disable hover preview in desktop
                setHoverRating((p) => ({ ...p, [qKey]: 0 }));
              }}
              onTouchStart={() => setRatings((p) => ({ ...p, [qKey]: n }))} // ✅ iOS fast response
              // ✅ Click always sets FINAL rating
              onClick={() => setRatings((p) => ({ ...p, [qKey]: n }))}
              className="transition-transform active:scale-[0.92]"
            >
              <img
                src={filled ? filled_star : hollow_star}
                alt={filled ? "filled star" : "hollow star"}
                className="
                w-[34px] h-[34px]
                md:w-[42px] md:h-[42px]
                object-contain
              "
              />
            </button>
          );
        })}
      </div>
    );
  };

  // const RatingStars = ({ qKey }) => {
  //   const current = ratings[qKey];
  //   const hover = hoverRating[qKey];

  //   return (
  //     <div className="flex items-center gap-3">
  //       {[1, 2, 3, 4, 5].map((n) => {
  //         const filled = hover ? n <= hover : n <= current;

  //         return (
  //           <button
  //             key={n}
  //             type="button"
  //             onMouseEnter={() => setHoverRating((p) => ({ ...p, [qKey]: n }))}
  //             onMouseLeave={() => setHoverRating((p) => ({ ...p, [qKey]: 0 }))}
  //             onClick={() => {
  //               setRatings((p) => ({ ...p, [qKey]: n })); // ✅ final rating
  //               setHoverRating((p) => ({ ...p, [qKey]: 0 })); // ✅ clear hover
  //             }}
  //             className="transition-transform active:scale-[0.92]"
  //           >
  //             <img
  //               src={filled ? filled_star : hollow_star}
  //               alt={filled ? "filled star" : "hollow star"}
  //               className="
  //               w-[34px] h-[34px]
  //               md:w-[42px] md:h-[42px]
  //               object-contain
  //             "
  //             />
  //           </button>
  //         );
  //       })}
  //     </div>
  //   );
  // };

  return (
    <div className="min-h-screen bg-evolve-yellow px-6 md:px-16 py-10">
      <div className="max-w-[1100px] mx-auto">
        {/* ✅ Top heading row */}
        {/* <div className="flex items-center gap-4"> */}
        <div className="flex items-center gap-4 mt-4 md:mt-6">
          {/* back arrow */}
          <button
            onClick={() => navigate(-1)}
            className="text-black text-3xl md:text-4xl"
            aria-label="back"
          >
            <img
              src={left_arrow_activity}
              alt="left"
              className="w-6 md:w-8 h-6 md:h-8"
            />
          </button>

          <h1
            className="
              text-evolve-pink font-extrabold
              text-[40px] md:text-[58px]
              tracking-[-0.03em]
            "
          >
            activity 1
          </h1>
        </div>

        {/* ✅ Tabs */}
        <div className="mt-8">
          {/* ================= MOBILE TABS (OLD UI) ================= */}
          <div className="md:hidden">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setActiveTab("reflect")}
                className={`
          w-1/2 text-center font-bold
          text-[22px]
          tracking-[-0.02em]
          transition-colors
          ${activeTab === "reflect" ? "text-evolve-pink" : "text-black"}
        `}
              >
                reflect
              </button>

              <button
                onClick={() => setActiveTab("review")}
                className={`
          w-1/2 text-center font-bold
          text-[22px]
          tracking-[-0.02em]
          transition-colors
          ${activeTab === "review" ? "text-evolve-pink" : "text-black"}
        `}
              >
                review ({reviewCount})
              </button>
            </div>

            {/* light grey line */}
            <div className="h-[2px] bg-black/20 mt-3 relative">
              {/* underline indicators */}
              <div
                className={`
          absolute top-0 left-0 h-[2px] w-1/2
          transition-all duration-300
          ${activeTab === "reflect" ? "bg-evolve-pink" : "bg-black"}
        `}
              />
              <div
                className={`
          absolute top-0 right-0 h-[2px] w-1/2
          transition-all duration-300
          ${activeTab === "review" ? "bg-evolve-pink" : "bg-black"}
        `}
              />
            </div>
          </div>

          {/* ================= DESKTOP TABS (NEW UI) ================= */}
          <div className="hidden md:block">
            <div className="flex md:items-start gap-10 md:gap-14">
              {/* TAB 1 */}
              <button
                onClick={() => setActiveTab("reflect")}
                className="flex flex-col items-center"
              >
                <span
                  className={`
          font-bold text-center
          text-[22px] md:text-[32px]
          tracking-[-0.02em]
          transition-colors
          ${activeTab === "reflect" ? "text-evolve-pink" : "text-black"}
        `}
                >
                  reflect
                </span>

                <span
                  className={`
          mt-2 h-[2px]
          w-[110px] md:w-[150px]
          transition-colors duration-300
          ${activeTab === "reflect" ? "bg-evolve-pink" : "bg-black"}
        `}
                />
              </button>

              {/* TAB 2 */}
              <button
                onClick={() => setActiveTab("review")}
                className="flex flex-col items-center"
              >
                <span
                  className={`
          font-bold text-center
          text-[22px] md:text-[32px]
          tracking-[-0.02em]
          transition-colors
          ${activeTab === "review" ? "text-evolve-pink" : "text-black"}
        `}
                >
                  review ({reviewCount})
                </span>

                <span
                  className={`
          mt-2 h-[2px]
          w-[110px] md:w-[150px]
          transition-colors duration-300
          ${activeTab === "review" ? "bg-evolve-pink" : "bg-black"}
        `}
                />
              </button>
            </div>

            {/* ✅ full width light grey separator line */}
            <div className="h-[2px] bg-black/20 -mt-[0.1rem] w-full" />
          </div>
        </div>

        {/* ✅ Content */}
        <div className="mt-10">
          {/* ------------------- REFLECT TAB ------------------- */}
          {activeTab === "reflect" && (
            <div>
              <p className="text-black font-normal text-[18px] md:text-[24px] leading-[1.25]">
                reflect on one field at a time. <br />
                there are no right or wrong answers.
              </p>

              {/* area of interest */}
              <div className="mt-10">
                <p className="text-black font-bold text-[20px] md:text-[24px] tracking-[-0.04em]">
                  area of interest
                </p>

                <input
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  onInput={(e) => setArea(e.target.value)} // ✅ iOS fix
                  placeholder="ex. industrial design, photography, ui, writing"
                  className="
                    mt-4 w-full md:w-[520px]
                    rounded-[16px]
                    border-[3px] border-black/50
                    bg-transparent
                    px-5 py-4
                    text-black
                     placeholder-black
                    text-[18px] md:text-[24px]
                    tracking-[-0.04em]
                    outline-none
                  "
                />
              </div>

              {/* rating questions */}
              <div className="mt-12 space-y-10">
                {QUESTIONS.map((q, idx) => (
                  <div key={q.key}>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                      <div>
                        <p className="text-black font-bold text-[22px] md:text-[26px] tracking-[-0.04em]">
                          {q.title}
                        </p>
                        <p className="text-black font-light text-[16px] md:text-[22px] mt-1">
                          {q.sub}
                        </p>
                      </div>

                      <RatingStars qKey={q.key} />
                    </div>

                    {/* line */}
                    {idx !== QUESTIONS.length - 1 && (
                      <div className="h-[2px] bg-black/20 mt-8" />
                    )}
                  </div>
                ))}
              </div>

              {/* error */}
              {error && (
                <p className="text-black font-semibold mt-8">{error}</p>
              )}

              {/* add this field button */}
              <div className="mt-12">
                <button
                  onClick={handleAddField}
                  disabled={!canAddField || saving}
                  className={`
                    bg-black text-white font-extrabold
                    text-[16px] md:text-[18px]
                    rounded-[37.11px]
                    px-10 py-3
                    shadow-[6px_6px_0px_rgba(0,0,0,0.25)]
                    transition-all duration-300
                    hover:translate-x-[2px] hover:translate-y-[2px]
                    hover:shadow-[2px_2px_0px_rgba(0,0,0,0.25)]
                    active:scale-[0.98]
                    ${
                      !canAddField || saving
                        ? "opacity-40 pointer-events-none"
                        : ""
                    }
                  `}
                >
                  {saving ? "saving..." : "add this field"}
                </button>
              </div>
            </div>
          )}

          {/* ------------------- REVIEW TAB ------------------- */}
          {activeTab === "review" && (
            <div>
              <p className="text-black font-normal text-[18px] md:text-[24px] leading-[1.25]">
                when you look at everything together, patterns start to appear.
              </p>

              {/* empty state */}
              {!reviewCount && (
                <p className="text-black font-semibold mt-10">
                  no fields added yet. go to reflect tab and add one ✅
                </p>
              )}

              {/* table */}
              {!!reviewCount && (
                <>
                  {/* ✅ DESKTOP TABLE (keep as is) */}
                  <div className="hidden md:block mt-10 overflow-x-auto">
                    <div
                      className="
          min-w-[900px]
          grid
          grid-cols-[220px_repeat(4,1fr)]
          gap-0
          rounded-2xl
          overflow-hidden
        "
                    >
                      {/* header row */}
                      <div className="p-6 bg-black/10 font-bold text-black">
                        area of interests
                      </div>
                      <div className="p-6 bg-black/10 font-bold text-black">
                        level of interest?
                      </div>
                      <div className="p-6 bg-black/10 font-bold text-black">
                        your current skill in this?
                      </div>
                      <div className="p-6 bg-black/10 font-bold text-black">
                        come naturally to you?
                      </div>
                      <div className="p-6 bg-black/10 font-bold text-black">
                        see this as financially viable?
                      </div>

                      {/* rows */}
                      {fields.map((f) => (
                        <React.Fragment key={f.area}>
                          <div className="p-6 border-t border-black/10 font-bold text-black">
                            {f.area}
                          </div>

                          {["interest", "skill", "natural", "finance"].map(
                            (k) => (
                              <div
                                key={k}
                                className="p-6 border-t border-black/10"
                              >
                                <div className="flex items-center gap-2">
                                  {[1, 2, 3, 4, 5].map((n) => (
                                    <img
                                      key={n}
                                      src={
                                        n <= f.ratings[k]
                                          ? filled_star
                                          : hollow_star
                                      }
                                      alt="star"
                                      className="w-6 h-6 object-contain"
                                    />
                                  ))}
                                </div>
                              </div>
                            )
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  {/* ✅ MOBILE REVIEW LIST (like Figma) */}
                  <div className="md:hidden mt-8">
                    <div className="space-y-10">
                      {fields.map((f) => (
                        <div
                          key={f.area}
                          className="border-b border-black pb-8"
                        >
                          {/* Topic Heading */}
                          <h2 className="text-black font-extrabold text-[22px] mb-6">
                            {f.area}
                          </h2>

                          {/* Row 1 */}
                          <div className="flex items-center justify-between gap-4 pb-4">
                            <p className="text-black font-normal text-[16px]">
                              level of interest?
                            </p>
                            <div className="flex items-center gap-2">
                              {[1, 2, 3, 4, 5].map((n) => (
                                <img
                                  key={n}
                                  src={
                                    n <= f.ratings.interest
                                      ? filled_star
                                      : hollow_star
                                  }
                                  alt="star"
                                  className="w-6 h-6 object-contain"
                                />
                              ))}
                            </div>
                          </div>
                          <div className="h-[1.5px] bg-black/30" />

                          {/* Row 2 */}
                          <div className="flex items-center justify-between gap-4 py-4">
                            <p className="text-black font-normal text-[16px]">
                              your current skill in this?
                            </p>
                            <div className="flex items-center gap-2">
                              {[1, 2, 3, 4, 5].map((n) => (
                                <img
                                  key={n}
                                  src={
                                    n <= f.ratings.skill
                                      ? filled_star
                                      : hollow_star
                                  }
                                  alt="star"
                                  className="w-6 h-6 object-contain"
                                />
                              ))}
                            </div>
                          </div>
                          <div className="h-[1.5px] bg-black/30" />

                          {/* Row 3 */}
                          <div className="flex items-center justify-between gap-4 py-4">
                            <p className="text-black font-normal text-[16px]">
                              come naturally to you?
                            </p>
                            <div className="flex items-center gap-2">
                              {[1, 2, 3, 4, 5].map((n) => (
                                <img
                                  key={n}
                                  src={
                                    n <= f.ratings.natural
                                      ? filled_star
                                      : hollow_star
                                  }
                                  alt="star"
                                  className="w-6 h-6 object-contain"
                                />
                              ))}
                            </div>
                          </div>
                          <div className="h-[1.5px] bg-black/30" />

                          {/* Row 4 */}
                          <div className="flex items-center justify-between gap-4 pt-4">
                            <p className="text-black font-normal text-[16px]">
                              see this becoming
                              <br /> financially viable?
                            </p>
                            <div className="flex items-center gap-2">
                              {[1, 2, 3, 4, 5].map((n) => (
                                <img
                                  key={n}
                                  src={
                                    n <= f.ratings.finance
                                      ? filled_star
                                      : hollow_star
                                  }
                                  alt="star"
                                  className="w-6 h-6 object-contain"
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* finish button */}
              {!!reviewCount && (
                <div className="mt-12 flex items-center gap-4">
                  <button
                    onClick={() => setActiveTab("reflect")}
                    className="
                      bg-transparent border-[3px] border-black/40
                      text-black font-extrabold
                      rounded-[37.11px]
                      px-8 py-3
                      text-[16px] md:text-[18px]
                    "
                  >
                    add more
                  </button>

                  <button
                    onClick={handleSaveAndFinish}
                    disabled={saving}
                    className="
                      bg-black text-white font-extrabold
                      rounded-[37.11px]
                      px-10 py-3
                      text-[16px] md:text-[18px]
                      shadow-[6px_6px_0px_rgba(0,0,0,0.25)]
                      transition-all duration-300
                      hover:translate-x-[2px] hover:translate-y-[2px]
                      hover:shadow-[2px_2px_0px_rgba(0,0,0,0.25)]
                      active:scale-[0.98]
                      disabled:opacity-60
                    "
                  >
                    {saving ? "saving..." : "save & finish"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {loading && (
          <p className="text-black font-semibold mt-10">loading...</p>
        )}
      </div>
    </div>
  );
}
