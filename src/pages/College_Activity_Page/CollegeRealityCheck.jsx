// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { useNavigate, useSearchParams } from "react-router-dom";
// import { supabase } from "../../supabaseClient";
// import {
//   left_arrow,
//   left_arrow_activity,
//   right_arrow
// } from "../../assets/images/College_Activity_Page";

// const QUESTIONS = [
//   {
//     id: 1,
//     text: "question 1: what is your biggest fear after passing out from college?",
//     placeholder: "should i look for work or start my own studio?",
//     durationSec: 120 // ✅ 2 mins
//   }
//   // ✅ later you will add Question 2,3,4,5
// ];

// function formatTime(sec) {
//   const m = Math.floor(sec / 60);
//   const s = sec % 60;
//   return `${m}:${String(s).padStart(2, "0")} s`;
// }

// export default function CollegeRealityCheck() {
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();
//   const id = searchParams.get("id");

//   // ✅ steps: instructions -> question -> results
//   const [step, setStep] = useState("instructions");

//   // ✅ question flow
//   const [qIndex, setQIndex] = useState(0);
//   const currentQ = QUESTIONS[qIndex];

//   // ✅ timer
//   const [timeLeft, setTimeLeft] = useState(currentQ ? currentQ.durationSec : 0);
//   const timerRef = useRef(null);

//   // ✅ input + responses
//   const [input, setInput] = useState("");
//   const [responsesByQ, setResponsesByQ] = useState({});

//   // ✅ modal + auto-next countdown
//   const [showTimeUpModal, setShowTimeUpModal] = useState(false);
//   const [nextCountdown, setNextCountdown] = useState(5);

//   // ✅ db state
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState("");

//   const currentResponses = responsesByQ[currentQ?.id] || [];

//   // ✅ reset timer when question changes
//   useEffect(() => {
//     if (!currentQ) return;
//     setTimeLeft(currentQ.durationSec);
//     setInput("");
//     setShowTimeUpModal(false);
//     setNextCountdown(5);

//     // clear existing timer
//     if (timerRef.current) clearInterval(timerRef.current);
//     timerRef.current = null;
//   }, [qIndex]);

//   // ✅ start timer only when step = question
//   useEffect(() => {
//     if (step !== "question") return;
//     if (!currentQ) return;

//     if (timerRef.current) clearInterval(timerRef.current);

//     timerRef.current = setInterval(() => {
//       setTimeLeft((prev) => {
//         if (prev <= 1) {
//           clearInterval(timerRef.current);
//           timerRef.current = null;
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);

//     return () => {
//       if (timerRef.current) clearInterval(timerRef.current);
//     };
//   }, [step, qIndex]);

//   // ✅ when timer hits 0 -> open modal and start countdown
//   useEffect(() => {
//     if (step !== "question") return;
//     if (timeLeft > 0) return;

//     setShowTimeUpModal(true);

//     let cd = 5;
//     setNextCountdown(cd);

//     const interval = setInterval(() => {
//       cd -= 1;
//       setNextCountdown(cd);

//       if (cd <= 0) {
//         clearInterval(interval);

//         // ✅ next question OR results
//         if (qIndex < QUESTIONS.length - 1) {
//           setQIndex((p) => p + 1);
//         } else {
//           setStep("results");
//           saveRealityCheck(true);
//         }
//       }
//     }, 1000);

//     return () => clearInterval(interval);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [timeLeft]);

//   const saveRealityCheck = async (markCompleted = false) => {
//     setError("");

//     if (!id) {
//       setError("Session not found. Please go back and start again.");
//       return;
//     }

//     try {
//       setSaving(true);

//       const payload = {
//         answers: responsesByQ,
//         completed: markCompleted,
//         updated_at: new Date().toISOString()
//       };

//       const { error } = await supabase
//         .from("college_activations")
//         .update({
//           reality_check_answers: payload
//         })
//         .eq("id", id);

//       if (error) throw error;
//     } catch (err) {
//       console.log(err.message);
//       setError("Could not save. Please try again.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleBegin = () => {
//     setStep("question");
//     setQIndex(0);
//   };

//   const handleAddAnswer = () => {
//     setError("");
//     const trimmed = input.trim();

//     if (!trimmed) return;

//     setResponsesByQ((prev) => {
//       const prevArr = prev[currentQ.id] || [];
//       return {
//         ...prev,
//         [currentQ.id]: [...prevArr, trimmed]
//       };
//     });

//     setInput("");
//   };

//   // ✅ results carousel (for question 1)
//   const allResultCards = useMemo(() => {
//     if (!QUESTIONS.length) return [];

//     return QUESTIONS.map((q) => {
//       const res = responsesByQ[q.id] || [];
//       return {
//         qId: q.id,
//         title: q.text,
//         responses: res
//       };
//     });
//   }, [responsesByQ]);

//   const [activeAnswerIndex, setActiveAnswerIndex] = useState(0);

//   useEffect(() => {
//     setActiveAnswerIndex(0);
//   }, [step, qIndex, responsesByQ]);

//   const resultsForQ1 = allResultCards[0];
//   const q1Responses = resultsForQ1?.responses || [];
//   const currentAnswer = q1Responses[activeAnswerIndex] || "";

//   const goPrev = () => {
//     setActiveAnswerIndex((p) => Math.max(0, p - 1));
//   };

//   const goNext = () => {
//     setActiveAnswerIndex((p) => Math.min(q1Responses.length - 1, p + 1));
//   };

//   return (
//     <div className="min-h-screen bg-evolve-yellow px-6 md:px-16 py-10">
//       <div className="max-w-[1200px] mx-auto">
//         {/* ✅ Top heading row */}
//         <div className="flex items-center gap-4 mt-8 md:mt-6">
//           <button
//             onClick={() => navigate(-1)}
//             className="text-black text-3xl md:text-4xl"
//             aria-label="back"
//           >
//             <img
//               src={left_arrow_activity}
//               alt="left"
//               className="w-6 md:w-8 h-6 md:h-8"
//             />
//           </button>

//           {/* ✅ Desktop: single line, Mobile: two line centered */}
//           <h1
//             className="
//               hidden md:block
//               text-evolve-pink font-extrabold
//               text-[64px]
//               tracking-[-0.03em]
//             "
//           >
//             activity 2 - reality check
//           </h1>

//           <h1
//             className="
//               md:hidden
//               flex-1 text-center
//               text-evolve-pink font-extrabold
//               text-[40px]
//               tracking-[-0.03em]
//               leading-[1.05]
//             "
//           >
//             activity 2 - <br /> reality check
//           </h1>
//         </div>

//         {/* ✅ Horizontal line */}
//         <div className="h-[2px] bg-black/30 mt-6" />

//         {/* ======================================================= */}
//         {/* ✅ INSTRUCTIONS */}
//         {/* ======================================================= */}
//         {step === "instructions" && (
//           <div className="mt-10">
//             <h2
//               className="
//                 text-black font-bold
//                 text-[32px] md:text-[40px]
//                 leading-[1.1]
//                 md:leading-[25px]
//                 text-center md:text-left
//               "
//             >
//               instructions
//             </h2>

//             <p
//               className="
//                 mt-6 text-black font-normal
//                 text-[18px] md:text-[32px]
//                 leading-[1.3]
//                 text-center md:text-left
//                 whitespace-pre-line
//               "
//             >
//               {`You’ll see 5 questions, one at a time.
// Each question is timed.
// Write the first honest thought that comes to mind—don’t overthink it.

// You can add multiple responses within the given time for each question.

// There are no right or wrong answers.`}
//             </p>

//             <p
//               className="
//                 mt-6 text-black font-normal
//                 text-[16px] md:text-[20px]
//                 text-center md:text-left
//               "
//             >
//               note: this activity is time-bound. leaving midway may reset your
//               progress
//             </p>

//             <div className="mt-10 flex justify-center md:justify-start">
//               <button
//                 onClick={handleBegin}
//                 className="
//                   bg-black text-white font-extrabold
//                   text-[20px] md:text-[24px]
//                   rounded-[37.11px]
//                   px-12 py-3
//                   shadow-[6px_6px_0px_rgba(0,0,0,0.25)]
//                   transition-all duration-300
//                   hover:translate-x-[2px] hover:translate-y-[2px]
//                   hover:shadow-[2px_2px_0px_rgba(0,0,0,0.25)]
//                   active:scale-[0.98]
//                 "
//               >
//                 begin
//               </button>
//             </div>
//           </div>
//         )}

//         {/* ======================================================= */}
//         {/* ✅ QUESTION SCREEN */}
//         {/* ======================================================= */}
//         {step === "question" && currentQ && (
//           <div className="mt-10">
//             {/* Desktop question row with timer circle */}
//             <div className="hidden md:flex items-start justify-between gap-8">
//               <div className="flex-1">
//                 <h2 className="text-black font-bold text-[40px] tracking-[-0.04em]">
//                   {currentQ.text}
//                 </h2>

//                 <p className="mt-2 text-black font-normal tracking-[-0.04em] text-[22px]">
//                   you can add multiple responses
//                 </p>
//               </div>

//               <div className="flex items-center justify-center">
//                 <div
//                   className="
//                     w-[130px] h-[130px]
//                     rounded-full
//                     border-2 border-evolve-pink
//                     bg-evolve-yellow
//                     flex items-center justify-center
//                   "
//                 >
//                   <p className="text-black font-extrabold text-[32px]">
//                     {formatTime(timeLeft)}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* Mobile timer box + question */}
//             <div className="md:hidden">
//               <div
//                 className="
//                   w-full max-w-[320px]
//                   mx-auto
//                   border-2 border-evolve-pink
//                   rounded-2xl
//                   py-3
//                   flex items-center justify-center
//                 "
//               >
//                 <p className="text-black font-extrabold text-[28px]">
//                   {formatTime(timeLeft)}
//                 </p>
//               </div>

//               <h2 className="mt-8 text-black font-bold text-[22px] text-center tracking-[-0.04em]">
//                 {currentQ.text}
//               </h2>

//               <p className="mt-2 text-black font-normal text-center tracking-[-0.04em] text-[16px]">
//                 you can add multiple responses
//               </p>
//             </div>

//             {/* Input box */}
//             <div className="mt-10">
//               <textarea
//                 value={input}
//                 onChange={(e) => setInput(e.target.value)}
//                 placeholder={currentQ.placeholder}
//                 className="
//                   w-full
//                   rounded-2xl
//                   border-[3px] border-black/30
//                   bg-transparent
//                   px-6 py-5
//                   outline-none
//                   text-black
//                   text-[18px] md:text-[32px]
//                   tracking-[-0.04em]
//                   placeholder-black/60
//                   min-h-[160px]
//                 "
//               />
//             </div>

//             {/* add answer button */}
//             <div className="mt-8 flex justify-center md:justify-start">
//               <button
//                 onClick={handleAddAnswer}
//                 className="
//                   bg-black text-white font-extrabold
//                   text-[18px] md:text-[22px]
//                   rounded-[37.11px]
//                   px-10 py-3
//                   shadow-[6px_6px_0px_rgba(0,0,0,0.25)]
//                   transition-all duration-300
//                   hover:translate-x-[2px] hover:translate-y-[2px]
//                   hover:shadow-[2px_2px_0px_rgba(0,0,0,0.25)]
//                   active:scale-[0.98]
//                 "
//               >
//                 add answer
//               </button>
//             </div>

//             {/* small debug count */}
//             <p className="mt-6 text-black font-semibold text-center md:text-left">
//               {currentResponses.length} responses added
//             </p>

//             {error && <p className="mt-4 text-black font-semibold">{error}</p>}
//           </div>
//         )}

//         {/* ======================================================= */}
//         {/* ✅ RESULTS */}
//         {/* ======================================================= */}
//         {step === "results" && (
//           <div className="mt-12">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start">
//               {/* Left */}
//               <div>
//                 <h2 className="text-black font-extrabold text-[32px] md:text-[40px]">
//                   that’s it for now
//                 </h2>

//                 <p className="mt-4 text-black font-normal text-[18px] md:text-[24px] leading-[1.35] whitespace-pre-line">
//                   {`these are the thoughts you shared across the questions.

// it’s okay if some of them feel unfinished or messy.

// we’ll look at patterns and talk through them together.`}
//                 </p>
//               </div>

//               {/* Right */}
//               {/* Right */}
//               <div>
//                 {/* ✅ BOX */}
//                 <div
//                   className="
//       relative
//       w-full
//       rounded-2xl
//       bg-black/10
//       p-6
//       min-h-[240px]
//       md:min-h-[260px]
//     "
//                 >
//                   {/* ✅ DESKTOP arrows (inside, near edges like Figma) */}
//                   <button
//                     onClick={goPrev}
//                     disabled={activeAnswerIndex === 0}
//                     className="
//         hidden md:flex
//         absolute left-[-55px] top-1/2 -translate-y-1/2
//         text-evolve-pink text-4xl
//         disabled:opacity-30
//       "
//                   >
//                     <img src={left_arrow} alt="left" className="w-8 h-8" />
//                   </button>

//                   <button
//                     onClick={goNext}
//                     disabled={activeAnswerIndex >= q1Responses.length - 1}
//                     className="
//         hidden md:flex
//         absolute right-[-55px] top-1/2 -translate-y-1/2
//         text-evolve-pink text-4xl
//         disabled:opacity-30
//       "
//                   >
//                     <img src={right_arrow} alt="right" className="w-8 h-8" />
//                   </button>

//                   {/* ✅ CONTENT */}
//                   <h3 className="text-evolve-pink font-bold text-[20px] md:text-[32px] tracking-[-0.04em]">
//                     {resultsForQ1?.title}
//                   </h3>

//                   <div className="h-[2px] bg-black/20 my-4" />

//                   <p className="text-black font-normal text-[16px] md:text-[24px] leading-[1.3]">
//                     {currentAnswer || "no responses added."}
//                   </p>
//                 </div>

//                 {/* ✅ BELOW BOX CONTROLS */}
//                 <div className="mt-6">
//                   {/* ✅ Mobile: arrows + dots in one row */}
//                   <div className="flex items-center justify-between md:hidden w-full">
//                     <button
//                       onClick={goPrev}
//                       disabled={activeAnswerIndex === 0}
//                       className="text-evolve-pink text-4xl disabled:opacity-30"
//                     >
//                       <img src={left_arrow} alt="left" className="w-5 h-5" />
//                     </button>

//                     {/* dots center */}
//                     <div className="flex items-center justify-center gap-2">
//                       {q1Responses.map((_, idx) => (
//                         <button
//                           key={idx}
//                           onClick={() => setActiveAnswerIndex(idx)}
//                           className={`
//               h-2.5 w-2.5 rounded-full transition-all duration-200
//               ${
//                 idx === activeAnswerIndex
//                   ? "bg-evolve-pink"
//                   : "bg-evolve-pink/40"
//               }
//             `}
//                         />
//                       ))}
//                     </div>

//                     <button
//                       onClick={goNext}
//                       disabled={activeAnswerIndex >= q1Responses.length - 1}
//                       className="text-evolve-pink text-4xl disabled:opacity-30"
//                     >
//                       <img src={right_arrow} alt="right" className="w-5 h-5" />
//                     </button>
//                   </div>

//                   {/* ✅ Desktop: dots only centered below the box */}
//                   <div className="hidden md:flex items-center justify-center gap-3">
//                     {q1Responses.map((_, idx) => (
//                       <button
//                         key={idx}
//                         onClick={() => setActiveAnswerIndex(idx)}
//                         className={`
//             h-3 w-3 rounded-full transition-all duration-200
//             ${
//               idx === activeAnswerIndex ? "bg-evolve-pink" : "bg-evolve-pink/40"
//             }
//           `}
//                       />
//                     ))}
//                   </div>
//                 </div>

//                 {/* ✅ Back button */}
//                 <div className="mt-10 flex justify-center md:justify-start">
//                   <button
//                     onClick={() =>
//                       navigate(`/college-activation/activities?id=${id}`)
//                     }
//                     className="
//         bg-black text-white font-extrabold
//         text-[18px] md:text-[22px]
//         rounded-[37.11px]
//         px-10 py-3
//         shadow-[6px_6px_0px_rgba(0,0,0,0.25)]
//         transition-all duration-300
//         hover:translate-x-[2px] hover:translate-y-[2px]
//         hover:shadow-[2px_2px_0px_rgba(0,0,0,0.25)]
//         active:scale-[0.98]
//       "
//                   >
//                     back to activities
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

// {/* ======================================================= */}
// {/* ✅ TIME UP MODAL */}
// {/* ======================================================= */}
// {showTimeUpModal && step === "question" && (
//   <div className="fixed inset-0 bg-black/30 flex items-center justify-center px-6 z-50">
//     <div
//       className="
//         w-full max-w-[520px]
//         rounded-3xl
//         border-2 border-black
//         bg-evolve-yellow
//         p-8
//         shadow-[10px_10px_0px_rgba(0,0,0,0.25)]
//         text-center
//       "
//     >
//       <div className="flex justify-center">
//         <div
//           className="
//             w-[160px] h-[160px]
//             rounded-full
//             border-2 border-evolve-pink
//             bg-evolve-yellow
//             flex items-center justify-center
//           "
//         >
//           <p className="text-evolve-pink font-extrabold text-[44px] tracking-[-0.04em] leading-[1]">
//             time&apos;s <br />
//             up!
//           </p>
//         </div>
//       </div>

//       <p className="mt-6 text-evolve-pink font-normal text-[22px] md:text-[24px]">
//         {currentResponses.length} responses added.
//       </p>

//       <p className="mt-2 text-black font-normal text-[20px] md:text-[24px]">
//         moving on to the results in {nextCountdown}…
//       </p>
//     </div>
//   </div>
// )}

//         {saving && <p className="mt-8 text-black font-semibold">saving...</p>}
//       </div>
//     </div>
//   );
// }

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../../supabaseClient";

import {
  left_arrow,
  left_arrow_activity,
  right_arrow
} from "../../assets/images/College_Activity_Page";

const QUESTIONS = [
  {
    id: 1,
    text: "1. what are the things you enjoy about the field you’ve chosen?",
    placeholder: "type whatever comes to mind…",
    durationSec: 120
  },
  {
    id: 2,
    text: "2. what feels different from what you expected?",
    placeholder: "type whatever comes to mind…",
    durationSec: 120
  },
  {
    id: 3,
    text: "3. what parts of this journey have been frustrating or difficult?",
    placeholder: "type whatever comes to mind…",
    durationSec: 120
  },
  {
    id: 4,
    text: "4. what worries or fears come up when you think about your future?",
    placeholder: "type whatever comes to mind…",
    durationSec: 120
  },
  {
    id: 5,
    text: "5. what things feel unclear or hard to figure out right now?",
    placeholder: "type whatever comes to mind…",
    durationSec: 120
  }
];

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")} s`;
}

// ✅ helper: checks if ANY question has ANY answer (new structure supported)
function hasAnySavedAnswer(answersObj) {
  if (!answersObj || typeof answersObj !== "object") return false;

  return Object.values(answersObj).some((val) => {
    // new structure: { question, responses: [] }
    if (val && typeof val === "object" && Array.isArray(val.responses)) {
      return val.responses.length > 0;
    }

    // old structure: { 1: ["a","b"] }
    if (Array.isArray(val)) return val.length > 0;

    return false;
  });
}

// ✅ normalize DB answers into new format
function normalizeAnswers(existingAnswers) {
  if (!existingAnswers || typeof existingAnswers !== "object") return {};

  const normalized = {};

  Object.entries(existingAnswers).forEach(([key, val]) => {
    // already new format
    if (val && typeof val === "object" && Array.isArray(val.responses)) {
      normalized[key] = {
        question: val.question || "",
        responses: val.responses || []
      };
      return;
    }

    // old format: array only
    if (Array.isArray(val)) {
      const qId = Number(key);
      const q = QUESTIONS.find((x) => x.id === qId);
      normalized[key] = {
        question: q?.text || `question ${key}`,
        responses: val
      };
    }
  });

  return normalized;
}

export default function CollegeRealityCheck() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  // ✅ steps: instructions -> question -> results
  const [step, setStep] = useState("instructions");

  // ✅ question flow
  const [qIndex, setQIndex] = useState(0);
  const currentQ = QUESTIONS[qIndex];

  // ✅ timer
  const [timeLeft, setTimeLeft] = useState(currentQ ? currentQ.durationSec : 0);
  const timerRef = useRef(null);

  // ✅ input + responses (NEW STRUCTURE)
  // responsesByQ = { "1": { question: "...", responses: ["a"] }, "2": {...} }
  const [input, setInput] = useState("");
  const [responsesByQ, setResponsesByQ] = useState({});

  // ✅ modal + auto-next countdown
  const [showTimeUpModal, setShowTimeUpModal] = useState(false);
  const [nextCountdown, setNextCountdown] = useState(5);

  // ✅ db state
  const [saving, setSaving] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(true);
  const [error, setError] = useState("");

  // ✅ strict lock if any answer exists
  const [isLocked, setIsLocked] = useState(false);

  // ✅ RESULTS slider index (question-wise)
  const [activeResultIndex, setActiveResultIndex] = useState(0);

  const resultsSliderRef = useRef(null);

  const isLastQuestion = qIndex === QUESTIONS.length - 1;
  const isLastQuestionInModal = qIndex === QUESTIONS.length - 1;

  const canAddAnswer = useMemo(() => {
    return input.trim().length > 0;
  }, [input]);

  const currentResponses = useMemo(() => {
    const key = String(currentQ?.id);
    return responsesByQ[key]?.responses || [];
  }, [responsesByQ, currentQ]);

  const autoSubmitCurrentInput = () => {
    const trimmed = input.trim();
    if (!trimmed || !currentQ) return;

    setResponsesByQ((prev) => {
      const key = String(currentQ.id);

      const prevEntry = prev[key] || {
        question: currentQ.text,
        responses: []
      };

      return {
        ...prev,
        [key]: {
          question: currentQ.text,
          responses: [...(prevEntry.responses || []), trimmed]
        }
      };
    });

    setInput("");
  };

  // =========================================================
  // ✅ FETCH EXISTING ANSWERS (STRICT)
  // =========================================================
  useEffect(() => {
    const fetchExisting = async () => {
      try {
        setLoadingExisting(true);
        setError("");

        if (!id) {
          setError("Session not found. Please go back and start again.");
          setLoadingExisting(false);
          return;
        }

        const { data, error } = await supabase
          .from("college_activations")
          .select("reality_check_answers")
          .eq("id", id)
          .single();

        if (error) throw error;

        const existing = data?.reality_check_answers;
        const existingAnswersRaw = existing?.answers || {};
        const existingAnswers = normalizeAnswers(existingAnswersRaw);

        // ✅ If ANY answer exists -> LOCK + show results
        if (hasAnySavedAnswer(existingAnswers)) {
          setResponsesByQ(existingAnswers);
          setIsLocked(true);
          setStep("results");
          setActiveResultIndex(0);
        } else {
          setIsLocked(false);
          setStep("instructions");
        }
      } catch (err) {
        console.log("fetch existing reality check error:", err.message);
      } finally {
        setLoadingExisting(false);
      }
    };

    fetchExisting();
  }, [id]);

  // ✅ reset timer when question changes
  useEffect(() => {
    if (!currentQ) return;

    setTimeLeft(currentQ.durationSec);
    setInput("");
    setShowTimeUpModal(false);
    setNextCountdown(5);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  }, [qIndex]);

  // ✅ start timer only when step=question AND not locked
  useEffect(() => {
    if (step !== "question") return;
    if (!currentQ) return;
    if (isLocked) return;

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step, qIndex, isLocked]);

  // ✅ when timer hits 0 -> show modal + move next
  // useEffect(() => {
  //   if (step !== "question") return;
  //   if (isLocked) return;
  //   if (timeLeft > 0) return;

  //   setShowTimeUpModal(true);

  //   let cd = 5;
  //   setNextCountdown(cd);

  //   const interval = setInterval(() => {
  //     cd -= 1;
  //     setNextCountdown(cd);

  //     if (cd <= 0) {
  //       clearInterval(interval);

  //       // ✅ next question OR results
  //       if (qIndex < QUESTIONS.length - 1) {
  //         setShowTimeUpModal(false);
  //         setQIndex((p) => p + 1);
  //       } else {
  //         setShowTimeUpModal(false);
  //         setStep("results");
  //         saveRealityCheck(true);
  //       }
  //     }
  //   }, 1000);

  //   return () => clearInterval(interval);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [timeLeft]);

  useEffect(() => {
    if (step !== "question") return;
    if (isLocked) return;
    if (timeLeft > 0) return;

    // ✅ auto-submit typed input (even if user didn’t click add answer)
    autoSubmitCurrentInput();

    // ✅ if it is LAST question → go directly to results (NO MODAL)
    if (qIndex === QUESTIONS.length - 1) {
      setStep("results");
      saveRealityCheck(true);
      return;
    }

    // ✅ show modal ONLY between questions (not after last question)
    setShowTimeUpModal(true);

    let cd = 5;
    setNextCountdown(cd);

    const interval = setInterval(() => {
      cd -= 1;
      setNextCountdown(cd);

      if (cd <= 0) {
        clearInterval(interval);
        setShowTimeUpModal(false);
        setQIndex((p) => p + 1);
      }
    }, 1000);

    return () => clearInterval(interval);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  const saveRealityCheck = async (markCompleted = false) => {
    setError("");

    if (!id) {
      setError("Session not found. Please go back and start again.");
      return;
    }

    // ✅ never overwrite if locked
    if (isLocked) return;

    try {
      setSaving(true);

      const payload = {
        answers: responsesByQ, // ✅ stores full question + responses
        completed: markCompleted,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from("college_activations")
        .update({
          reality_check_answers: payload
        })
        .eq("id", id);

      if (error) throw error;

      if (markCompleted) setIsLocked(true);
    } catch (err) {
      console.log(err.message);
      setError("Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleBegin = () => {
    if (isLocked) return;

    setStep("question");
    setQIndex(0);
  };

  const handleAddAnswer = () => {
    if (isLocked) return;

    setError("");
    const trimmed = input.trim();
    if (!trimmed) return;

    setResponsesByQ((prev) => {
      const key = String(currentQ.id);

      const prevEntry = prev[key] || {
        question: currentQ.text,
        responses: []
      };

      return {
        ...prev,
        [key]: {
          question: currentQ.text,
          responses: [...(prevEntry.responses || []), trimmed]
        }
      };
    });

    setInput("");
  };

  // ✅ RESULTS CARDS (question-wise)
  const allResultCards = useMemo(() => {
    return QUESTIONS.map((q) => {
      const key = String(q.id);
      const entry = responsesByQ[key];

      return {
        qId: q.id,
        title: entry?.question || q.text,
        responses: entry?.responses || []
      };
    });
  }, [responsesByQ]);

  const totalResults = allResultCards.length;

  // ✅ Desktop arrows (question wise)
  const goPrevQuestion = () => {
    setActiveResultIndex((p) => Math.max(0, p - 1));
  };

  const goNextQuestion = () => {
    setActiveResultIndex((p) => Math.min(totalResults - 1, p + 1));
  };

  // ✅ Mobile swipe listener
  const handleResultsScroll = () => {
    const el = resultsSliderRef.current;
    if (!el) return;

    const cardWidth = el.clientWidth;
    const idx = Math.round(el.scrollLeft / cardWidth);
    setActiveResultIndex(idx);
  };

  const goToResult = (idx) => {
    const el = resultsSliderRef.current;
    if (!el) return;

    el.scrollTo({
      left: el.clientWidth * idx,
      behavior: "smooth"
    });
  };

  // ✅ loader
  if (loadingExisting) {
    return (
      <div className="min-h-screen bg-evolve-yellow px-6 md:px-16 py-10 flex items-center justify-center">
        <p className="text-black font-semibold text-[18px]">loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-evolve-yellow px-6 md:px-16 py-10">
      <div className="max-w-[1200px] mx-auto">
        {/* TOP */}
        <div className="flex items-center gap-4 mt-8 md:mt-6">
          <button onClick={() => navigate(-1)} aria-label="back">
            <img
              src={left_arrow_activity}
              alt="left"
              className="w-6 md:w-8 h-6 md:h-8"
            />
          </button>

          <h1
            className="
              hidden md:block
              text-evolve-pink font-extrabold
              text-[58px]
              tracking-[-0.03em]
            "
          >
            {/* activity 2 - reality check */}
            reality check
          </h1>

          <h1
            className="
              md:hidden
              flex-1 text-center
              text-evolve-pink font-extrabold 
              text-[32px]
              tracking-[-0.03em]
              leading-[1.05]
            "
          >
            reality check
          </h1>
        </div>

        <div className="h-[2px] bg-black/30 mt-6" />

        {/* ✅ INSTRUCTIONS */}
        {step === "instructions" && !isLocked && (
          <div className="mt-10">
            <h2 className="text-black font-bold text-[32px] md:text-[40px] text-center md:text-left">
              instructions
            </h2>

            <p className="mt-6 text-black font-normal text-[18px] md:text-[32px] leading-[1.3] text-center md:text-left whitespace-pre-line">
              {`You’ll see ${QUESTIONS.length} questions, one at a time.
Each question is timed.
Write the first honest thought that comes to mind, don’t overthink it.

You can add multiple responses within the given time for each question.

There are no right or wrong answers.`}
            </p>

            <p className="mt-6 text-black font-normal text-[16px] md:text-[20px] text-center md:text-left">
              note: this activity is time-bound. leaving midway may reset your
              progress
            </p>

            <div className="mt-10 flex justify-center md:justify-start">
              <button
                onClick={handleBegin}
                className="
                  bg-black text-white font-extrabold
                  text-[20px] md:text-[24px]
                  rounded-[37.11px]
                  px-12 py-3
                  shadow-[6px_6px_0px_rgba(0,0,0,0.25)]
                  transition-all duration-300
                  active:scale-[0.98]
                "
              >
                begin
              </button>
            </div>
          </div>
        )}

        {/* ✅ QUESTION SCREEN */}
        {step === "question" && currentQ && !isLocked && (
          <div className="mt-10">
            {/* Desktop question row */}
            <div className="hidden md:flex items-start justify-between gap-8">
              <div className="flex-1">
                <h2 className="text-black font-bold text-[40px] tracking-[-0.04em] leading-[115%]">
                  {currentQ.text}
                </h2>

                <p className="mt-2 text-black font-normal tracking-[-0.04em] text-[22px]">
                  you can add multiple responses, one at a time
                </p>
              </div>

              <div className="flex items-center justify-center">
                <div className="w-[130px] h-[130px] rounded-full border-2 border-evolve-pink bg-evolve-yellow flex items-center justify-center">
                  <p className="text-black font-extrabold text-[32px]">
                    {formatTime(timeLeft)}
                  </p>
                </div>
              </div>
            </div>

            {/* Mobile timer box */}
            <div className="md:hidden">
              <div className="w-full max-w-[320px] mx-auto border-2 border-evolve-pink rounded-2xl py-3 flex items-center justify-center">
                <p className="text-black font-extrabold text-[28px]">
                  {formatTime(timeLeft)}
                </p>
              </div>

              <h2 className="mt-8 text-black font-bold text-[22px] text-center leading-tight tracking-[-0.04em]">
                {currentQ.text}
              </h2>

              <p className="mt-2 text-black font-normal text-center tracking-[-0.04em] text-[16px]">
                you can add multiple responses, one at a time
              </p>
            </div>

            {/* Input */}
            <div className="mt-10">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={currentQ.placeholder}
                className="
                  w-full rounded-2xl
                  border-[3px] border-black/30
                  bg-transparent
                  px-6 py-5
                  outline-none
                  text-black
                  text-[18px] md:text-[32px]
                  tracking-[-0.04em]
                  placeholder-black/60
                  min-h-[160px]
                "
              />
            </div>

            {/* add answer */}
            <div className="mt-8 flex justify-center md:justify-start">
              <button
                onClick={handleAddAnswer}
                className={`
                  bg-black text-white font-extrabold
                  text-[18px] md:text-[22px]
                  rounded-[37.11px]
                  px-10 py-3
                  shadow-[6px_6px_0px_rgba(0,0,0,0.25)]
                  transition-all duration-300
                  active:scale-[0.98]
                   ${
                     !canAddAnswer || saving || isLocked
                       ? "opacity-40 cursor-not-allowed"
                       : ""
                   }
        `}
              >
                add answer
              </button>
            </div>

            <p className="mt-6 text-black font-semibold text-center md:text-left">
              {currentResponses.length} responses added
            </p>
          </div>
        )}

        {/* ✅ RESULTS */}
        {step === "results" && (
          <div className="mt-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start">
              {/* Left */}
              <div>
                <h2 className="text-black font-extrabold text-[32px] md:text-[40px]">
                  that’s it for now
                </h2>

                <p className="mt-4 text-black font-normal text-[18px] md:text-[24px] leading-[1.35] whitespace-pre-line">
                  {`these are the thoughts you shared across the questions.

it’s okay if some of them feel unfinished or messy. 

we’ll look at patterns and talk through them together.`}
                </p>

                {/* {isLocked && (
                  <p className="mt-6 text-black font-semibold">
                    ✅ already submitted. you can only view your answers.
                  </p>
                )} */}
              </div>

              {/* Right */}
              <div>
                {/* ✅ DESKTOP (one box + arrows + dots) */}
                <div className="hidden md:block">
                  <div className="relative w-full rounded-2xl bg-black/10 p-6 min-h-[260px]">
                    {/* arrows */}
                    <button
                      onClick={goPrevQuestion}
                      disabled={activeResultIndex === 0}
                      className="absolute left-[-55px] top-1/2 -translate-y-1/2 disabled:opacity-30"
                    >
                      <img src={left_arrow} alt="left" className="w-8 h-8" />
                    </button>

                    <button
                      onClick={goNextQuestion}
                      disabled={activeResultIndex >= totalResults - 1}
                      className="absolute right-[-55px] top-1/2 -translate-y-1/2 disabled:opacity-30"
                    >
                      <img src={right_arrow} alt="right" className="w-8 h-8" />
                    </button>

                    {/* content */}
                    <h3 className="text-black font-bold text-[32px] tracking-[-0.04em] leading-tight">
                      {allResultCards[activeResultIndex]?.title}
                    </h3>

                    <div className="h-[2px] bg-black/20 my-4" />

                    {allResultCards[activeResultIndex]?.responses?.length ? (
                      <div className="space-y-3">
                        {allResultCards[activeResultIndex].responses.map(
                          (r, idx) => (
                            <p
                              key={idx}
                              className="text-black font-normal text-[22px] leading-[1.3]"
                            >
                              • {r}
                            </p>
                          )
                        )}
                      </div>
                    ) : (
                      <p className="text-black font-normal text-[22px] leading-[1.3]">
                        no responses added.
                      </p>
                    )}
                  </div>

                  {/* dots */}
                  <div className="mt-6 flex items-center justify-center gap-3">
                    {allResultCards.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveResultIndex(idx)}
                        className={`
                          h-3 w-3 rounded-full transition-all duration-200
                          ${
                            idx === activeResultIndex
                              ? "bg-evolve-pink"
                              : "bg-evolve-pink/40"
                          }
                        `}
                      />
                    ))}
                  </div>
                </div>

                {/* ✅ MOBILE (swipe cards, NO ARROWS) */}
                {/* ✅ MOBILE (swipe cards, fixed height, NO ARROWS) */}
                <div className="md:hidden">
                  <div
                    ref={resultsSliderRef}
                    onScroll={handleResultsScroll}
                    className="
      w-full flex overflow-x-auto snap-x snap-mandatory
      scroll-smooth no-scrollbar
      justify-start
    "
                  >
                    {allResultCards.map((card) => (
                      <div
                        key={card.qId}
                        className="
          w-full flex-shrink-0 snap-center
          px-2
          flex justify-center
        "
                      >
                        {/* ✅ FIXED HEIGHT BOX */}
                        <div
                          className="
            w-full max-w-[520px]
            rounded-2xl
            bg-black/10
            p-6
            h-[380px]
            flex flex-col
          "
                        >
                          {/* ✅ QUESTION TITLE (fixed area) */}
                          <h3 className="text-black font-bold text-[22px] tracking-[-0.04em] leading-tight flex-shrink-0">
                            {card.title}
                          </h3>

                          <div className="h-[2px] bg-black/20 my-4 flex-shrink-0" />

                          {/* ✅ ANSWERS (scroll inside, does not change card height) */}
                          <div className="flex-1 overflow-y-auto pr-1">
                            {card.responses?.length ? (
                              <div className="space-y-3">
                                {card.responses.map((r, idx) => (
                                  <p
                                    key={idx}
                                    className="text-black font-normal text-[16px] leading-[1.35]"
                                  >
                                    • {r}
                                  </p>
                                ))}
                              </div>
                            ) : (
                              <p className="text-black font-normal text-[16px] leading-[1.35]">
                                no responses added.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* ✅ dots */}
                  <div className="mt-6 flex items-center justify-center gap-3">
                    {allResultCards.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => goToResult(idx)}
                        className={`
          h-3 w-3 rounded-full transition-all duration-200
          ${idx === activeResultIndex ? "bg-evolve-pink" : "bg-evolve-pink/40"}
        `}
                      />
                    ))}
                  </div>
                </div>

                {/* back */}
                <div className="mt-10 flex justify-center md:justify-start">
                  <button
                    onClick={() =>
                      navigate(`/evolve-in-person/activities?id=${id}`)
                    }
                    className="
                      bg-black text-white font-extrabold
                      text-[18px] md:text-[22px]
                      rounded-[37.11px]
                      px-10 py-3
                      shadow-[6px_6px_0px_rgba(0,0,0,0.25)]
                      transition-all duration-300
                      active:scale-[0.98]
                    "
                  >
                    back to activities
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================= */}
        {/* ✅ TIME UP MODAL */}
        {/* ======================================================= */}
        {showTimeUpModal && step === "question" && !isLocked && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center px-6 z-50">
            <div
              className="
                w-full max-w-[520px]
                rounded-3xl
                border-2 border-black
                bg-evolve-yellow
                p-8
                shadow-[10px_10px_0px_rgba(0,0,0,0.25)]
                text-center
              "
            >
              <div className="flex justify-center">
                <div
                  className="
                    w-[160px] h-[160px]
                    rounded-full
                    border-2 border-evolve-pink
                    bg-evolve-yellow
                    flex items-center justify-center
                  "
                >
                  <p className="text-evolve-pink font-extrabold text-[44px] tracking-[-0.04em] leading-[1]">
                    time&apos;s <br />
                    up!
                  </p>
                </div>
              </div>

              <p className="mt-6 text-evolve-pink font-normal text-[22px] md:text-[24px]">
                {currentResponses.length} responses added.
              </p>

              <p className="mt-2 text-black font-normal text-[20px] md:text-[24px]">
                {isLastQuestionInModal
                  ? `moving on to the results in ${nextCountdown}…`
                  : `moving on to the questions in ${nextCountdown}…`}
              </p>
            </div>
          </div>
        )}

        {error && <p className="mt-8 text-black font-semibold">{error}</p>}
        {saving && <p className="mt-8 text-black font-semibold">saving...</p>}
      </div>
    </div>
  );
}
