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
    text: "question 1: what is your biggest fear after passing out from college?",
    placeholder: "should i look for work or start my own studio?",
    durationSec: 120 // ✅ 2 mins
  }
  // ✅ later you will add Question 2,3,4,5
];

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")} s`;
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

  // ✅ input + responses
  const [input, setInput] = useState("");
  const [responsesByQ, setResponsesByQ] = useState({});

  // ✅ modal + auto-next countdown
  const [showTimeUpModal, setShowTimeUpModal] = useState(false);
  const [nextCountdown, setNextCountdown] = useState(5);

  // ✅ db state
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const currentResponses = responsesByQ[currentQ?.id] || [];

  // ✅ reset timer when question changes
  useEffect(() => {
    if (!currentQ) return;
    setTimeLeft(currentQ.durationSec);
    setInput("");
    setShowTimeUpModal(false);
    setNextCountdown(5);

    // clear existing timer
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  }, [qIndex]);

  // ✅ start timer only when step = question
  useEffect(() => {
    if (step !== "question") return;
    if (!currentQ) return;

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
  }, [step, qIndex]);

  // ✅ when timer hits 0 -> open modal and start countdown
  useEffect(() => {
    if (step !== "question") return;
    if (timeLeft > 0) return;

    setShowTimeUpModal(true);

    let cd = 5;
    setNextCountdown(cd);

    const interval = setInterval(() => {
      cd -= 1;
      setNextCountdown(cd);

      if (cd <= 0) {
        clearInterval(interval);

        // ✅ next question OR results
        if (qIndex < QUESTIONS.length - 1) {
          setQIndex((p) => p + 1);
        } else {
          setStep("results");
          saveRealityCheck(true);
        }
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

    try {
      setSaving(true);

      const payload = {
        answers: responsesByQ,
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
    } catch (err) {
      console.log(err.message);
      setError("Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleBegin = () => {
    setStep("question");
    setQIndex(0);
  };

  const handleAddAnswer = () => {
    setError("");
    const trimmed = input.trim();

    if (!trimmed) return;

    setResponsesByQ((prev) => {
      const prevArr = prev[currentQ.id] || [];
      return {
        ...prev,
        [currentQ.id]: [...prevArr, trimmed]
      };
    });

    setInput("");
  };

  // ✅ results carousel (for question 1)
  const allResultCards = useMemo(() => {
    if (!QUESTIONS.length) return [];

    return QUESTIONS.map((q) => {
      const res = responsesByQ[q.id] || [];
      return {
        qId: q.id,
        title: q.text,
        responses: res
      };
    });
  }, [responsesByQ]);

  const [activeAnswerIndex, setActiveAnswerIndex] = useState(0);

  useEffect(() => {
    setActiveAnswerIndex(0);
  }, [step, qIndex, responsesByQ]);

  const resultsForQ1 = allResultCards[0];
  const q1Responses = resultsForQ1?.responses || [];
  const currentAnswer = q1Responses[activeAnswerIndex] || "";

  const goPrev = () => {
    setActiveAnswerIndex((p) => Math.max(0, p - 1));
  };

  const goNext = () => {
    setActiveAnswerIndex((p) => Math.min(q1Responses.length - 1, p + 1));
  };

  return (
    <div className="min-h-screen bg-evolve-yellow px-6 md:px-16 py-10">
      <div className="max-w-[1200px] mx-auto">
        {/* ✅ Top heading row */}
        <div className="flex items-center gap-4 mt-8 md:mt-6">
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

          {/* ✅ Desktop: single line, Mobile: two line centered */}
          <h1
            className="
              hidden md:block
              text-evolve-pink font-extrabold
              text-[64px]
              tracking-[-0.03em]
            "
          >
            activity 2 - reality check
          </h1>

          <h1
            className="
              md:hidden
              flex-1 text-center
              text-evolve-pink font-extrabold 
              text-[40px]
              tracking-[-0.03em]
              leading-[1.05]
            "
          >
            activity 2 - <br /> reality check
          </h1>
        </div>

        {/* ✅ Horizontal line */}
        <div className="h-[2px] bg-black/30 mt-6" />

        {/* ======================================================= */}
        {/* ✅ INSTRUCTIONS */}
        {/* ======================================================= */}
        {step === "instructions" && (
          <div className="mt-10">
            <h2
              className="
                text-black font-bold
                text-[32px] md:text-[40px]
                leading-[1.1]
                md:leading-[25px]
                text-center md:text-left
              "
            >
              instructions
            </h2>

            <p
              className="
                mt-6 text-black font-normal
                text-[18px] md:text-[32px]
                leading-[1.3]
                text-center md:text-left
                whitespace-pre-line
              "
            >
              {`You’ll see 5 questions, one at a time.
Each question is timed.
Write the first honest thought that comes to mind—don’t overthink it.

You can add multiple responses within the given time for each question.

There are no right or wrong answers.`}
            </p>

            <p
              className="
                mt-6 text-black font-normal
                text-[16px] md:text-[20px]
                text-center md:text-left
              "
            >
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
                  hover:translate-x-[2px] hover:translate-y-[2px]
                  hover:shadow-[2px_2px_0px_rgba(0,0,0,0.25)]
                  active:scale-[0.98]
                "
              >
                begin
              </button>
            </div>
          </div>
        )}

        {/* ======================================================= */}
        {/* ✅ QUESTION SCREEN */}
        {/* ======================================================= */}
        {step === "question" && currentQ && (
          <div className="mt-10">
            {/* Desktop question row with timer circle */}
            <div className="hidden md:flex items-start justify-between gap-8">
              <div className="flex-1">
                <h2 className="text-black font-bold text-[40px] tracking-[-0.04em]">
                  {currentQ.text}
                </h2>

                <p className="mt-2 text-black font-normal tracking-[-0.04em] text-[22px]">
                  you can add multiple responses
                </p>
              </div>

              <div className="flex items-center justify-center">
                <div
                  className="
                    w-[130px] h-[130px]
                    rounded-full
                    border-2 border-evolve-pink
                    bg-evolve-yellow
                    flex items-center justify-center
                  "
                >
                  <p className="text-black font-extrabold text-[32px]">
                    {formatTime(timeLeft)}
                  </p>
                </div>
              </div>
            </div>

            {/* Mobile timer box + question */}
            <div className="md:hidden">
              <div
                className="
                  w-full max-w-[320px]
                  mx-auto
                  border-2 border-evolve-pink
                  rounded-2xl
                  py-3
                  flex items-center justify-center
                "
              >
                <p className="text-black font-extrabold text-[28px]">
                  {formatTime(timeLeft)}
                </p>
              </div>

              <h2 className="mt-8 text-black font-bold text-[22px] text-center tracking-[-0.04em]">
                {currentQ.text}
              </h2>

              <p className="mt-2 text-black font-normal text-center tracking-[-0.04em] text-[16px]">
                you can add multiple responses
              </p>
            </div>

            {/* Input box */}
            <div className="mt-10">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={currentQ.placeholder}
                className="
                  w-full
                  rounded-2xl
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

            {/* add answer button */}
            <div className="mt-8 flex justify-center md:justify-start">
              <button
                onClick={handleAddAnswer}
                className="
                  bg-black text-white font-extrabold
                  text-[18px] md:text-[22px]
                  rounded-[37.11px]
                  px-10 py-3
                  shadow-[6px_6px_0px_rgba(0,0,0,0.25)]
                  transition-all duration-300
                  hover:translate-x-[2px] hover:translate-y-[2px]
                  hover:shadow-[2px_2px_0px_rgba(0,0,0,0.25)]
                  active:scale-[0.98]
                "
              >
                add answer
              </button>
            </div>

            {/* small debug count */}
            <p className="mt-6 text-black font-semibold text-center md:text-left">
              {currentResponses.length} responses added
            </p>

            {error && <p className="mt-4 text-black font-semibold">{error}</p>}
          </div>
        )}

        {/* ======================================================= */}
        {/* ✅ RESULTS */}
        {/* ======================================================= */}
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
              </div>

              {/* Right */}
              {/* Right */}
              <div>
                {/* ✅ BOX */}
                <div
                  className="
      relative
      w-full
      rounded-2xl
      bg-black/10
      p-6
      min-h-[240px]
      md:min-h-[260px]
    "
                >
                  {/* ✅ DESKTOP arrows (inside, near edges like Figma) */}
                  <button
                    onClick={goPrev}
                    disabled={activeAnswerIndex === 0}
                    className="
        hidden md:flex
        absolute left-[-55px] top-1/2 -translate-y-1/2
        text-evolve-pink text-4xl
        disabled:opacity-30
      "
                  >
                    <img src={left_arrow} alt="left" className="w-8 h-8" />
                  </button>

                  <button
                    onClick={goNext}
                    disabled={activeAnswerIndex >= q1Responses.length - 1}
                    className="
        hidden md:flex
        absolute right-[-55px] top-1/2 -translate-y-1/2
        text-evolve-pink text-4xl
        disabled:opacity-30
      "
                  >
                    <img src={right_arrow} alt="right" className="w-8 h-8" />
                  </button>

                  {/* ✅ CONTENT */}
                  <h3 className="text-evolve-pink font-bold text-[20px] md:text-[32px] tracking-[-0.04em]">
                    {resultsForQ1?.title}
                  </h3>

                  <div className="h-[2px] bg-black/20 my-4" />

                  <p className="text-black font-normal text-[16px] md:text-[24px] leading-[1.3]">
                    {currentAnswer || "no responses added."}
                  </p>
                </div>

                {/* ✅ BELOW BOX CONTROLS */}
                <div className="mt-6">
                  {/* ✅ Mobile: arrows + dots in one row */}
                  <div className="flex items-center justify-between md:hidden w-full">
                    <button
                      onClick={goPrev}
                      disabled={activeAnswerIndex === 0}
                      className="text-evolve-pink text-4xl disabled:opacity-30"
                    >
                      <img src={left_arrow} alt="left" className="w-5 h-5" />
                    </button>

                    {/* dots center */}
                    <div className="flex items-center justify-center gap-2">
                      {q1Responses.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveAnswerIndex(idx)}
                          className={`
              h-2.5 w-2.5 rounded-full transition-all duration-200
              ${
                idx === activeAnswerIndex
                  ? "bg-evolve-pink"
                  : "bg-evolve-pink/40"
              }
            `}
                        />
                      ))}
                    </div>

                    <button
                      onClick={goNext}
                      disabled={activeAnswerIndex >= q1Responses.length - 1}
                      className="text-evolve-pink text-4xl disabled:opacity-30"
                    >
                      <img src={right_arrow} alt="right" className="w-5 h-5" />
                    </button>
                  </div>

                  {/* ✅ Desktop: dots only centered below the box */}
                  <div className="hidden md:flex items-center justify-center gap-3">
                    {q1Responses.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveAnswerIndex(idx)}
                        className={`
            h-3 w-3 rounded-full transition-all duration-200
            ${
              idx === activeAnswerIndex ? "bg-evolve-pink" : "bg-evolve-pink/40"
            }
          `}
                      />
                    ))}
                  </div>
                </div>

                {/* ✅ Back button */}
                <div className="mt-10 flex justify-center md:justify-start">
                  <button
                    onClick={() =>
                      navigate(`/college-activation/activities?id=${id}`)
                    }
                    className="
        bg-black text-white font-extrabold
        text-[18px] md:text-[22px]
        rounded-[37.11px]
        px-10 py-3
        shadow-[6px_6px_0px_rgba(0,0,0,0.25)]
        transition-all duration-300
        hover:translate-x-[2px] hover:translate-y-[2px]
        hover:shadow-[2px_2px_0px_rgba(0,0,0,0.25)]
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
        {showTimeUpModal && step === "question" && (
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
                moving on to the results in {nextCountdown}…
              </p>
            </div>
          </div>
        )}

        {saving && <p className="mt-8 text-black font-semibold">saving...</p>}
      </div>
    </div>
  );
}
