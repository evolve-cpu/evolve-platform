// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { supabase } from "../../supabaseClient";
// import {
//   college_activity_home,
//   college_activity_home_mobile,
//   dropdown_arrow,
//   dropdown_arrow_revert
// } from "../../assets/images/College_Activity_Page";

// const colleges = [
//   "MIT WPU",
//   "MIT ADTU",
//   "Symbiosis University",
//   "Flame University"
// ];

// export default function CollegeActivation() {
//   const navigate = useNavigate();

//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [college, setCollege] = useState("");

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleBegin = async () => {
//     setError("");

//     if (!name.trim()) return setError("Please enter your name");
//     if (!email.trim()) return setError("Please enter your email");
//     if (!college.trim()) return setError("Please select your college");

//     try {
//       setLoading(true);

//       const { data, error } = await supabase
//         .from("college_activations")
//         .insert([
//           {
//             name: name.trim(),
//             email: email.trim(),
//             college: college.trim()
//           }
//         ])
//         .select("id")
//         .single();

//       if (error) throw error;

//       navigate(`/college-activation/activities?id=${data.id}`);
//     } catch (err) {
//       setError(err.message || "Something went wrong!");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-evolve-yellow px-6 py-10 md:px-12 md:py-0 flex flex-col md:flex-row">
//       {/* LEFT SECTION */}
//       <div className="md:w-1/2 flex items-center justify-center md:justify-start md:min-h-screen">
//         <h1
//           className="
//             text-evolve-pink font-extrabold text-center md:text-left
//             text-[48px] leading-[48px] tracking-[-0.02em]
//             md:text-[140px] md:leading-[120px] md:tracking-[-0.03em]
//           "
//         >
//           think <br />
//           beyond <br />
//           design!
//         </h1>
//       </div>

//       {/* RIGHT SECTION */}
//       <div className="md:w-1/2 flex items-center justify-center md:min-h-screen mt-10 md:mt-0">
//         <div className="w-full max-w-[520px] border-2 border-evolve-pink bg-evolve-yellow p-6 md:p-10 rounded-2xl">
//           {/* NAME */}
//           <div className="mb-6">
//             <p
//               className="
//                 text-black font-bold
//                 text-[16px] tracking-[-0.02em]
//                 md:text-[24px] md:leading-[25px] md:tracking-[-0.04em]
//               "
//             >
//               what’s your name?
//             </p>

//             <input
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               placeholder="enter name"
//               className="
//                 mt-3 w-full rounded-full bg-transparent
//                 border-[3px] border-black
//                 px-5 py-3 outline-none text-black
//                 text-[16px] tracking-[-0.02em] font-normal
//                 md:text-[24px] md:leading-[25px] md:tracking-[-0.04em]
//               "
//             />
//           </div>

//           {/* EMAIL */}
//           <div className="mb-6">
//             <p
//               className="
//                 text-black font-bold
//                 text-[16px] tracking-[-0.02em]
//                 md:text-[24px] md:leading-[25px] md:tracking-[-0.04em]
//               "
//             >
//               email address
//             </p>

//             <input
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               placeholder="enter email"
//               className="
//                 mt-3 w-full rounded-full bg-transparent
//                 border-[3px] border-black
//                 px-5 py-3 outline-none text-black
//                 text-[16px] tracking-[-0.02em] font-normal
//                 md:text-[24px] md:leading-[25px] md:tracking-[-0.04em]
//               "
//             />
//           </div>

//           {/* COLLEGE */}
//           <div className="mb-8">
//             <p
//               className="
//                 text-black font-bold
//                 text-[16px] tracking-[-0.02em]
//                 md:text-[24px] md:leading-[25px] md:tracking-[-0.04em]
//               "
//             >
//               college
//             </p>

//             <select
//               value={college}
//               onChange={(e) => setCollege(e.target.value)}
//               className="
//                 mt-3 w-full rounded-full bg-transparent
//                 border-[3px] border-black
//                 px-5 py-3 outline-none text-black
//                 text-[16px] tracking-[-0.02em] font-normal
//                 md:text-[24px] md:leading-[25px] md:tracking-[-0.04em]
//               "
//             >
//               <option value="" disabled>
//                 select college
//               </option>

//               {colleges.map((c) => (
//                 <option key={c} value={c}>
//                   {c}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {error && (
//             <p className="text-black font-semibold text-sm mb-4">{error}</p>
//           )}

//           <button
//             onClick={handleBegin}
//             disabled={loading}
//             className="
//               w-full bg-black text-white font-extrabold
//               rounded-[37.11px]
//               py-4
//               text-[20px] md:text-[24px]
//               disabled:opacity-50
//             "
//           >
//             {loading ? "saving..." : "lets begin"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";

import {
  college_activity_home,
  college_activity_home_mobile,
  dropdown_arrow,
  dropdown_arrow_revert
} from "../../assets/images/College_Activity_Page";

const colleges = [
  "MIT WPU",
  "MIT ADTU",
  "Symbiosis International University",
  "FLAME University"
];

// ✅ set this to your navbar height on desktop
const NAV_H = 96;

export default function CollegeActivation() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [college, setCollege] = useState("");

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const dropdownRef = useRef(null);

  const selectedCollegeLabel = useMemo(() => {
    return college?.trim() ? college : "select college";
  }, [college]);

  React.useEffect(() => {
    const handleOutside = (e) => {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(e.target)) setDropdownOpen(false);
    };

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const handleBegin = async () => {
    setError("");

    if (!name.trim()) return setError("Please enter your name");
    if (!email.trim()) return setError("Please enter your email");
    if (!college.trim()) return setError("Please select your college");

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("college_activations")
        .insert([
          {
            name: name.trim(),
            email: email.trim(),
            college: college.trim()
          }
        ])
        .select("id")
        .single();

      if (error) throw error;

      navigate(`/college-activation/activities?id=${data.id}`);
    } catch (err) {
      setError(err.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-evolve-yellow relative overflow-hidden">
      {/* ✅ DESKTOP svg pinned to viewport, starts after navbar, sticks to right/bottom */}
      <img
        src={college_activity_home}
        alt="college bg"
        className="
          hidden md:block
          fixed right-0 bottom-0
          top-[96px]
          h-[calc(100vh-96px)] w-auto
          z-0
          pointer-events-none select-none
        "
      />

      {/* ✅ Mobile background image */}
      <img
        src={college_activity_home_mobile}
        alt="college bg mobile"
        className="md:hidden absolute right-0 bottom-0 w-full z-0 pointer-events-none select-none"
      />

      {/* ✅ content area is the remaining viewport after navbar */}
      <div
        className="
          relative z-10
          px-6 py-10
          md:px-12 md:py-0
          flex flex-col md:flex-row
          md:min-h-[calc(100vh-140px)]
          md:mt-[96px]
        "
      >
        {/* ================= LEFT SECTION ================= */}
        <div className="md:w-1/2 flex items-center justify-center md:justify-start">
          <h1
            className="
              text-evolve-pink font-extrabold
              text-center md:text-left
              text-[48px] leading-[52px] tracking-[-0.02em]
              md:ml-14
              md:text-[140px] md:leading-[120px] md:tracking-[-0.03em]
              md:mt-0 mt-24 mb-4
            "
          >
            think beyond <br />
            design!
          </h1>
        </div>

        {/* ================= RIGHT SECTION ================= */}
        <div className="md:w-1/2 flex items-center justify-center mt-4 md:mt-0 relative">
          {/* ✅ DESKTOP FORM BOX (vertically centered in remaining area) */}
          <div
            className="
              hidden md:flex md:flex-col
              w-full max-w-[620px]
              border-2 border-evolve-pink
              bg-evolve-yellow
              px-12 py-12
              rounded-[28px]
              relative z-10
              min-h-[560px]
              justify-between
            "
          >
            <div>
              {/* NAME */}
              <div className="mb-8">
                <p className="text-black font-bold text-[24px] leading-[25px] tracking-[-0.04em]">
                  what's your name?
                </p>

                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="enter name"
                  className="
                    mt-4 w-full
                    rounded-[16px]
                    bg-transparent
                    border-[3px] border-black/50
                    px-6 py-4
                    outline-none
                    text-black placeholder-black
                    text-[24px] leading-[25px]
                    tracking-[-0.04em]
                  "
                />
              </div>

              {/* EMAIL */}
              <div className="mb-8">
                <p className="text-black font-bold text-[24px] leading-[25px] tracking-[-0.04em]">
                  email address
                </p>

                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="enter email"
                  className="
                    mt-4 w-full
                    rounded-[16px]
                    bg-transparent
                    border-[3px] border-black/50
                    px-6 py-4
                    outline-none
                    text-black placeholder-black
                    text-[24px] leading-[25px]
                    tracking-[-0.04em]
                  "
                />
              </div>

              {/* COLLEGE */}
              <div className="mb-6" ref={dropdownRef}>
                <p className="text-black font-bold text-[24px] leading-[25px] tracking-[-0.04em]">
                  college
                </p>

                <button
                  type="button"
                  onClick={() => setDropdownOpen((p) => !p)}
                  className={`
                    mt-4 w-full
                    bg-transparent
                    border-[3px] border-black/50
                    px-6 py-4
                    flex items-center justify-between
                    text-black
                    text-[24px] leading-[25px]
                    tracking-[-0.04em]
                    ${
                      dropdownOpen
                        ? "rounded-t-[16px] rounded-b-none"
                        : "rounded-[16px]"
                    }
                  `}
                >
                  <span className={`${college ? "text-black" : "text-black"}`}>
                    {selectedCollegeLabel}
                  </span>

                  <img
                    src={dropdownOpen ? dropdown_arrow_revert : dropdown_arrow}
                    alt="dropdown"
                    className="w-6 h-6 object-contain"
                  />
                </button>

                {dropdownOpen && (
                  <div
                    className="
                      -mt-[3px] w-full
                      rounded-b-[16px] rounded-t-none
                      border-[3px] border-black/50 border-t-0
                      bg-evolve-yellow
                      overflow-hidden
                    "
                  >
                    {colleges.map((c, idx) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          setCollege(c);
                          setDropdownOpen(false);
                        }}
                        className="
                          w-full text-left
                          px-6 py-4
                          text-black
                          text-[24px] leading-[25px]
                          tracking-[-0.04em]
                          font-normal
                          hover:font-bold
                          transition-all
                        "
                      >
                        <div className="flex flex-col gap-4">
                          <span>{c}</span>
                          {idx !== colleges.length - 1 && (
                            <div className="h-[2px] bg-black/20" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {error && (
                <p className="text-black font-semibold text-[16px] mt-2">
                  {error}
                </p>
              )}
            </div>

            <div className="flex justify-center pt-2">
              <button
                onClick={handleBegin}
                disabled={loading}
                className="
                  bg-black text-white font-extrabold
                  rounded-[37.11px]
                  px-16 py-4
                  text-[24px]
                  shadow-[6px_6px_0px_rgba(0,0,0,0.25)]
                  transition-all duration-300
                  hover:translate-x-[2px] hover:translate-y-[2px]
                  hover:shadow-[2px_2px_0px_rgba(0,0,0,0.25)]
                  active:scale-[0.98]
                  disabled:opacity-50
                "
              >
                {loading ? "saving..." : "lets begin"}
              </button>
            </div>
          </div>

          {/* ✅ MOBILE */}
          <div className="md:hidden w-full flex flex-col justify-center items-center">
            <div className="w-full max-w-[360px]">
              {/* NAME */}
              <div className="mb-6">
                <p className="text-black font-bold text-[16px] tracking-[-0.02em]">
                  what's your name?
                </p>

                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="enter name"
                  className="
                    mt-3 w-full
                    rounded-[14px]
                    bg-transparent
                    border-[3px] border-black/50
                    px-5 py-3
                    outline-none
                    text-black placeholder-black
                    text-[16px] tracking-[-0.02em] font-normal
                  "
                />
              </div>

              {/* EMAIL */}
              <div className="mb-6">
                <p className="text-black font-bold text-[16px] tracking-[-0.02em]">
                  email address
                </p>

                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="enter email"
                  className="
                    mt-3 w-full
                    rounded-[14px]
                    bg-transparent
                    border-[3px] border-black/50
                    px-5 py-3
                    outline-none
                    text-black placeholder-black
                    text-[16px] tracking-[-0.02em] font-normal
                  "
                />
              </div>

              {/* COLLEGE */}
              <div className="mb-8" ref={dropdownRef}>
                <p className="text-black font-bold text-[16px] tracking-[-0.02em]">
                  college
                </p>

                <button
                  type="button"
                  onClick={() => setDropdownOpen((p) => !p)}
                  className={`
                    mt-3 w-full
                    bg-transparent
                    border-[3px] border-black/50
                    px-5 py-3
                    flex items-center justify-between
                    text-black
                    text-[16px] tracking-[-0.02em]
                    ${
                      dropdownOpen
                        ? "rounded-t-[14px] rounded-b-none"
                        : "rounded-[14px]"
                    }
                  `}
                >
                  <span>{selectedCollegeLabel}</span>

                  <img
                    src={dropdownOpen ? dropdown_arrow_revert : dropdown_arrow}
                    alt="dropdown"
                    className="w-5 h-5 object-contain"
                  />
                </button>

                {dropdownOpen && (
                  <div
                    className="
                      -mt-[3px] w-full
                      rounded-b-[14px] rounded-t-none
                      border-[3px] border-black/50 border-t-0
                      bg-evolve-yellow
                      overflow-hidden
                    "
                  >
                    {colleges.map((c, idx) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          setCollege(c);
                          setDropdownOpen(false);
                        }}
                        className="
                          w-full text-left
                          px-5 py-3
                          text-black
                          text-[16px] tracking-[-0.02em]
                          font-normal
                          hover:font-bold
                        "
                      >
                        <div className="flex flex-col gap-3">
                          <span>{c}</span>
                          {idx !== colleges.length - 1 && (
                            <div className="h-[2px] bg-black/20" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {error && (
                <p className="text-black font-semibold text-[14px] mb-4">
                  {error}
                </p>
              )}

              <div className="flex justify-center">
                <button
                  onClick={handleBegin}
                  disabled={loading}
                  className="
                    bg-black text-white font-extrabold
                    rounded-[37.11px]
                    px-14 py-4
                    text-[20px]
                    shadow-[6px_6px_0px_rgba(0,0,0,0.25)]
                    transition-all duration-300
                    hover:translate-x-[2px] hover:translate-y-[2px]
                    hover:shadow-[2px_2px_0px_rgba(0,0,0,0.25)]
                    active:scale-[0.98]
                    disabled:opacity-50
                  "
                >
                  {loading ? "saving..." : "lets begin"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 z-0 pointer-events-none" />
    </div>
  );
}
