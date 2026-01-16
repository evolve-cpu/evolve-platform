// import React from "react";
// import { useSearchParams } from "react-router-dom";

// export default function CollegeActivities() {
//   const [searchParams] = useSearchParams();
//   const id = searchParams.get("id");

//   return (
//     <div className="min-h-screen bg-evolve-yellow flex items-center justify-center px-6 py-12">
//       <div className="w-full max-w-[900px]">
//         <h1 className="text-center text-black font-extrabold text-3xl md:text-5xl mb-10">
//           activities
//         </h1>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//           {/* Activity 1 */}
//           <div className="border-2 border-evolve-pink rounded-2xl p-8 bg-evolve-yellow">
//             <h2 className="text-black font-extrabold text-2xl mb-3">
//               activity 1
//             </h2>
//             <p className="text-black font-medium mb-6">self reflection</p>

//             <button
//               onClick={() => alert(`Go to Activity 1 (id: ${id})`)}
//               className="w-full bg-black text-white font-extrabold rounded-full py-3"
//             >
//               start
//             </button>
//           </div>

//           {/* Activity 2 */}
//           <div className="border-2 border-evolve-pink rounded-2xl p-8 bg-evolve-yellow">
//             <h2 className="text-black font-extrabold text-2xl mb-3">
//               activity 2
//             </h2>
//             <p className="text-black font-medium mb-6">reality check</p>

//             <button
//               onClick={() => alert(`Go to Activity 2 (id: ${id})`)}
//               className="w-full bg-black text-white font-extrabold rounded-full py-3"
//             >
//               start
//             </button>
//           </div>
//         </div>

//         <p className="text-center text-black mt-10 text-sm opacity-70">
//           session id: {id || "not found"}
//         </p>
//       </div>
//     </div>
//   );
// }

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../../supabaseClient";

// ✅ your svgs
import {
  self_reflection,
  reality_check
} from "../../assets/images/College_Activity_Page";
// import reality_check from "../../assets/images/College_Activity_Page/reality_check.svg";

export default function CollegeActivities() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const [loading, setLoading] = useState(true);
  const [selfDone, setSelfDone] = useState(false);

  const [activeIndex, setActiveIndex] = useState(0);
  const sliderRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setLoading(true);

        if (!id) {
          setSelfDone(false);
          return;
        }

        const { data, error } = await supabase
          .from("college_activations")
          .select("id, self_reflection_answers")
          .eq("id", id)
          .single();

        if (error) throw error;

        setSelfDone(!!data?.self_reflection_answers);
      } catch (err) {
        console.log("status fetch error:", err.message);
        setSelfDone(false);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [id]);

  const activities = useMemo(() => {
    return [
      {
        key: "self_reflection",
        title: "self reflection",
        desc: "Take a moment to reflect on where you currently stand across your interests, skills, and inclinations.",
        btnText: "start reflection",
        image: self_reflection,
        isLocked: false
      },
      {
        key: "reality_check",
        title: "reality check",
        desc: "Share the pressing concerns in your design journey. We’ll look at them together.",
        btnText: "start activity",
        image: reality_check,
        isLocked: !selfDone
      }
    ];
  }, [selfDone]);

  const handleScroll = () => {
    const el = sliderRef.current;
    if (!el) return;

    const cardWidth = el.clientWidth;
    const idx = Math.round(el.scrollLeft / cardWidth);
    setActiveIndex(idx);
  };

  const goToSlide = (idx) => {
    const el = sliderRef.current;
    if (!el) return;

    el.scrollTo({
      left: el.clientWidth * idx,
      behavior: "smooth"
    });
  };

  const handleStart = (key) => {
    if (!id) return alert("Session not found. Please go back and start again.");

    if (key === "self_reflection") {
      navigate(`/college-activation/self-reflection?id=${id}`);
      // navigate(`/college-activation/self-reflection?id=${id}`)
    }

    if (key === "reality_check") {
      if (!selfDone) return;
      // alert(`Go to Activity 2 (id: ${id})`);
      navigate(`/college-activation/reality-check?id=${id}`);

      // navigate(`/college-activation/reality-check?id=${id}`)
    }
  };

  return (
    <div className="min-h-screen bg-evolve-yellow flex items-center justify-center px-6 md:px-16">
      {/* ✅ This is the centered container */}
      <div className="w-full max-w-[1200px]">
        {/* ✅ Heading */}
        <h1
          className="
          text-center font-extrabold text-black
          text-[34px] sm:text-[38px] md:text-[56px] lg:text-[56px]
          leading-[1]
          mb-8 md:mb-6
        "
        >
          activities
        </h1>

        {/* ✅ Desktop Grid */}
        <div className="hidden md:grid grid-cols-2 gap-10 justify-items-center">
          {activities.map((item) => (
            <div
              key={item.key}
              className="
              w-full max-w-[600px]
              rounded-[52px] overflow-hidden
              border-evolve-pink border-2
            "
            >
              {/* TOP */}
              <div className="bg-black h-[230px] flex items-center overflow-hidden justify-center p-8">
                <img
                  src={item.image}
                  alt={item.title}
                  className="max-w-[150%] object-contain"
                />
              </div>

              {/* Stroke */}
              <div className="h-[2px] bg-evolve-yellow" />

              {/* BOTTOM */}
              <div className="bg-evolve-pink h-[250px] px-8 py-7 text-center flex flex-col items-center">
                <h2
                  className="
                  text-white font-extrabold
                  text-[34px] lg:text-[42px] xl:text-[42px]
                  leading-[1.05]
                  mb-4
                "
                >
                  {item.title}
                </h2>

                <p
                  className="
                  text-white font-normal
                  text-[16px] lg:text-[18px] xl:text-[18px]
                  leading-[1.2]
                  mb-6
                  max-w-[450px]
                "
                >
                  {item.desc}
                </p>

                {!item.isLocked ? (
                  <button
                    onClick={() => handleStart(item.key)}
                    disabled={loading}
                    className="
                    bg-black text-white font-extrabold
                    text-[18px] lg:text-[20px] xl:text-[20px]
                    rounded-[37.11px]
                    px-6 lg:px-10 py-3
                    transition-all duration-300
                    disabled:opacity-60
                    shadow-[6px_6px_0px_rgba(0,0,0,0.25)]
                    hover:translate-x-[2px] hover:translate-y-[2px]
                    hover:shadow-[2px_2px_0px_rgba(0,0,0,0.25)]
                    active:scale-[0.98]
                  "
                  >
                    {item.btnText}
                  </button>
                ) : (
                  <div className="h-[56px]" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ✅ Mobile Carousel */}
        <div className="md:hidden">
          <div
            ref={sliderRef}
            onScroll={handleScroll}
            className="
            w-full flex overflow-x-auto snap-x snap-mandatory
            scroll-smooth no-scrollbar
          "
          >
            {activities.map((item) => (
              <div
                key={item.key}
                className="w-full flex-shrink-0 snap-start pr-4"
              >
                <div
                  className="
                  w-full max-w-[520px] mx-auto
                  rounded-[32px] overflow-hidden
                  border-[2px] border-black
                "
                >
                  <div className="bg-black h-[260px] flex items-center overflow-hidden justify-center p-7">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="max-w-[130%] object-contain"
                    />
                  </div>

                  <div className="h-[2px] bg-evolve-yellow" />

                  <div className="bg-evolve-pink px-6 py-6 text-center flex flex-col items-center">
                    <h2
                      className="
                      text-white font-extrabold
                      text-[40px]
                      leading-[49.3px]
                      mb-3
                    "
                    >
                      {item.title}
                    </h2>

                    <p className="text-white font-normal text-[20px] leading-[1.2] mb-5">
                      {item.desc}
                    </p>

                    {!item.isLocked ? (
                      <button
                        onClick={() => handleStart(item.key)}
                        disabled={loading}
                        className="
                        bg-black text-white font-extrabold
                        text-[20px]
                        rounded-[37.11px]
                        py-3 px-6
                        transition-all duration-300
                        shadow-[6px_6px_0px_rgba(0,0,0,0.25)]
                        disabled:opacity-60
                        hover:translate-x-[2px] hover:translate-y-[2px]
                        hover:shadow-[2px_2px_0px_rgba(0,0,0,0.25)]
                        active:scale-[0.98]
                      "
                      >
                        {item.btnText}
                      </button>
                    ) : (
                      <div className="h-[52px]" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ✅ Dots */}
          <div className="flex items-center justify-center gap-3 mt-6">
            {activities.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                className={`
                h-3 w-3 rounded-full transition-all duration-300
                ${activeIndex === idx ? "bg-evolve-pink" : "bg-evolve-pink/40"}
              `}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
