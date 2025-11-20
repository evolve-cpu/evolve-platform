// import React from "react";
// import {
//   hand_with_thunder,
//   hand_with_thunder_mobile
// } from "../assets/images/Home";

// const ContactUs = () => {
//   return (
//     <section className="relative w-full h-screen bg-evolve-yellow text-black overflow-hidden flex flex-col md:flex-row">
//       {/* ================= LEFT SECTION (content) ================= */}
//       <div
//         className="relative z-20 w-full md:w-1/2 max-w-[600px] mx-auto md:mx-0
//                 px-5 md:px-12 pt-16 md:pt-24 pb-10 md:pb-20
//                 flex flex-col justify-start md:ml-20"
//       >
//         {/* headings (pushed down) */}
//         <h1 className="font-extrabold lowercase mt-4 text-[2.5rem] md:text-[4rem] leading-tight">
//           need to talk?
//         </h1>
//         <p className="  lowercase font-normal text-[1.25rem] md:text-[2rem] leading-snug">
//           we&apos;re here for real questions.
//         </p>

//         {/* form */}
//         <form
//           className="mt-6 md:mt-12"
//           onSubmit={(e) => {
//             e.preventDefault();
//           }}
//         >
//           {/* email */}
//           <label className="block w-full">
//             <span className="sr-only">email</span>
//             <input
//               type="email"
//               required
//               placeholder="enter email"
//               className="w-full md:w-[80%] rounded-2xl md:rounded-[16px] px-5 md:px-6 py-4 md:py-5
//                          bg-[#BF9C05] placeholder-black placeholder:opacity-90
//                          text-black outline-none focus:ring-2 ring-black
//                          text-[1.25rem] md:text-[2rem]"
//             />
//           </label>

//           {/* message + send (same width as email on desktop) */}
//           <div className="mt-4 md:mt-6 md:grid md:grid-cols-[1fr_auto] md:gap-2">
//             <label className="block">
//               <span className="sr-only">message</span>
//               <textarea
//                 required
//                 placeholder="your message"
//                 rows={4}
//                 className="w-full rounded-2xl md:rounded-[16px] px-5 md:px-6 py-4 md:py-5
//                            md:min-h-[8rem]
//                            bg-[#BF9C05] placeholder-black placeholder:opacity-90
//                            text-black outline-none focus:ring-2 ring-black
//                            text-[1.25rem] md:text-[2rem] resize-none"
//               />
//             </label>

//             {/* circle enter button */}
//             <div className="mt-4 md:mt-0 flex md:flex-col md:justify-end">
//               <button
//                 type="submit"
//                 aria-label="send message"
//                 className="self-start md:self-auto grid place-items-center rounded-full bg-[#BF9C05]
//                            w-16 h-16 md:w-24 md:h-24 transition-transform active:scale-95"
//               >
//                 <svg
//                   viewBox="0 0 24 24"
//                   className="w-7 h-7 md:w-10 md:h-10"
//                   fill="none"
//                   xmlns="http://www.w3.org/2000/svg"
//                 >
//                   <path d="M4 12h14" stroke="black" strokeWidth="2" />
//                   <path d="M12 6l6 6-6 6" stroke="black" strokeWidth="2" />
//                 </svg>
//               </button>
//             </div>
//           </div>
//         </form>
//       </div>

//       {/* ================= RIGHT SECTION (image) ================= */}
//       <div className="relative w-full md:w-1/2 flex justify-end items-end">
//         {/* desktop image bottom-right (hidden on mobile) */}
//         <img
//           src={hand_with_thunder}
//           alt="hand with thunder"
//           className="hidden md:block pointer-events-none select-none absolute right-[-20vh] bottom-[-20vh] w-[100%] z-10"
//           style={{ transform: "translateY(-10%)" }}
//         />
//         {/* mobile image bottom-left */}
//         <img
//           src={hand_with_thunder_mobile}
//           alt="hand with thunder"
//           className="md:hidden pointer-events-none select-none absolute right-0 top-[70%] w-[90vw] z-10"
//         />
//       </div>
//     </section>
//   );
// };

// export default ContactUs;

// import React from "react";
// import {
//   hand_with_thunder,
//   hand_with_thunder_mobile
// } from "../assets/images/Home";

// const ContactUs = () => {
//   return (
//     <section className="relative w-full h-screen bg-evolve-yellow text-black overflow-hidden flex flex-col md:flex-row">
//       {/* ================= LEFT SECTION (content) ================= */}
//       <div
//         className="relative z-20 w-full md:w-1/2 max-w-[80vw] mx-auto md:mx-0
//                 px-5 md:px-12 pt-16 md:pt-24 pb-10 md:pb-20
//                 flex flex-col justify-start md:ml-20"
//       >
//         {/* headings (pushed down) */}
//         <h1 className="font-extrabold lowercase mt-4 text-[2.5rem] md:text-[4rem] leading-tight">
//           need to talk?
//         </h1>
//         <p className="  lowercase font-normal text-[1.25rem] md:text-[2rem] leading-snug">
//           we&apos;re here for real questions.
//         </p>

//         {/* form */}
//         <form
//           className="mt-6 md:mt-12"
//           onSubmit={(e) => {
//             e.preventDefault();
//           }}
//         >
//           {/* email */}
//           <label className="block w-full">
//             <span className="sr-only">email</span>
//             <input
//               type="email"
//               required
//               placeholder="enter email"
//               className="w-full rounded-2xl md:rounded-[16px] px-5 md:px-6 py-4 md:py-5
//                          bg-[#BF9C05] placeholder-black placeholder:opacity-90
//                          text-black outline-none focus:ring-2 ring-black
//                          text-[1.25rem] md:text-[2rem]"
//             />
//           </label>

//           {/* message + send (same width as email on desktop) */}
//           <div className="mt-4 md:mt-6 md:grid md:grid-cols-[1fr_auto] md:gap-2">
//             <label className="block">
//               <span className="sr-only">message</span>
//               <textarea
//                 required
//                 placeholder="your message"
//                 rows={4}
//                 className="w-full rounded-2xl md:rounded-[16px] px-5 md:px-6 py-4 md:py-5
//                            md:min-h-[8rem]
//                            bg-[#BF9C05] placeholder-black placeholder:opacity-90
//                            text-black outline-none focus:ring-2 ring-black
//                            text-[1.25rem] md:text-[2rem] resize-none"
//               />
//             </label>

//             {/* circle enter button */}
//             <div className="mt-4 md:mt-0 flex md:flex-col md:justify-end">
//               <button
//                 type="submit"
//                 aria-label="send message"
//                 className="self-start md:self-auto grid place-items-center rounded-full bg-[#BF9C05]
//                            w-16 h-16 md:w-24 md:h-24 transition-transform active:scale-95"
//               >
//                 <svg
//                   viewBox="0 0 24 24"
//                   className="w-7 h-7 md:w-10 md:h-10"
//                   fill="none"
//                   xmlns="http://www.w3.org/2000/svg"
//                 >
//                   <path d="M4 12h14" stroke="black" strokeWidth="2" />
//                   <path d="M12 6l6 6-6 6" stroke="black" strokeWidth="2" />
//                 </svg>
//               </button>
//             </div>
//           </div>
//         </form>
//       </div>

//       {/* ================= RIGHT SECTION (image) ================= */}
//       <div className="relative w-full md:w-1/2 flex justify-end items-end">
//         {/* desktop image bottom-right (hidden on mobile) */}
//         <img
//           src={hand_with_thunder}
//           alt="hand with thunder"
//           className="hidden md:block pointer-events-none select-none fixed right-0 -bottom-32 w-[50vw] lg:w-[55vw] xl:w-[60vw] z-10"
//         />
//         {/* mobile image bottom-left */}
//         <img
//           src={hand_with_thunder_mobile}
//           alt="hand with thunder"
//           className="md:hidden pointer-events-none select-none absolute right-0 top-[70%] w-[90vw] z-10"
//         />
//       </div>
//     </section>
//   );
// };

// export default ContactUs;

// import React from "react";
// import {
//   hand_with_thunder,
//   hand_with_thunder_mobile
// } from "../assets/images/Home";

// const ContactUs = () => {
//   return (
//     <section className="relative w-full h-screen bg-evolve-yellow text-black overflow-hidden flex flex-col md:flex-row">
//       {/* ================= LEFT SECTION (content) ================= */}
//       <div
//         className="relative z-20 w-full md:w-1/2 max-w-[80vw] mx-auto md:mx-0
//                 px-5 md:px-12 pt-16 md:pt-24 pb-10 md:pb-20
//                 flex flex-col justify-start md:ml-20"
//       >
//         {/* headings (pushed down) */}
//         <h1 className="font-extrabold lowercase mt-4 text-[2.5rem] md:text-[4rem] leading-tight">
//           need to talk?
//         </h1>
//         <p className="  lowercase font-normal text-[1.25rem] md:text-[2rem] leading-snug">
//           we&apos;re here for real questions.
//         </p>

//         {/* form */}
//         <form
//           className="mt-6 md:mt-12"
//           onSubmit={(e) => {
//             e.preventDefault();
//           }}
//         >
//           {/* email */}
//           <label className="block w-full">
//             <span className="sr-only">email</span>
//             <input
//               type="email"
//               required
//               placeholder="enter email"
//               className="w-full rounded-2xl md:rounded-[16px] px-5 md:px-6 py-4 md:py-5
//                          bg-transparent border-2 border-black
//                          placeholder-black font-bold
//                          text-black outline-none focus:ring-2 ring-black
//                          text-[1.25rem] md:text-[1.5rem]
//                          placeholder:text-[1.25rem] md:placeholder:text-[1.5rem]"
//             />
//           </label>

//           {/* message */}
//           <div className="mt-4 md:mt-6">
//             <label className="block w-full">
//               <span className="sr-only">message</span>
//               <textarea
//                 required
//                 placeholder="your message"
//                 rows={4}
//                 className="w-full rounded-2xl md:rounded-[16px] px-5 md:px-6 py-4 md:py-5
//                            md:min-h-[8rem]
//                            bg-transparent border-2 border-black
//                            placeholder-black font-bold
//                            text-black outline-none focus:ring-2 ring-black
//                            text-[1.25rem] md:text-[1.5rem]
//                            placeholder:text-[1.25rem] md:placeholder:text-[1.5rem] resize-none"
//               />
//             </label>
//           </div>

//           {/* circle enter button (separate) */}
//           <div className="mt-4 md:mt-6 flex">
//             <button
//               type="submit"
//               aria-label="send message"
//               className="grid place-items-center rounded-full bg-black
//                          w-16 h-16 md:w-24 md:h-24 transition-transform active:scale-95"
//             >
//               <svg
//                 viewBox="0 0 24 24"
//                 className="w-7 h-7 md:w-10 md:h-10"
//                 fill="none"
//                 xmlns="http://www.w3.org/2000/svg"
//               >
//                 <path d="M4 12h14" stroke="#F2E205" strokeWidth="2" />
//                 <path d="M12 6l6 6-6 6" stroke="#F2E205" strokeWidth="2" />
//               </svg>
//             </button>
//           </div>
//         </form>
//       </div>

//       {/* ================= RIGHT SECTION (image) ================= */}
//       <div className="relative w-full md:w-1/2 flex justify-end items-end">
//         {/* desktop image bottom-right (hidden on mobile) */}
//         <img
//           src={hand_with_thunder}
//           alt="hand with thunder"
//           className="hidden md:block pointer-events-none select-none fixed right-0 -bottom-32 w-[50vw] lg:w-[55vw] xl:w-[60vw] z-10"
//         />
//         {/* mobile image bottom-left */}
//         <img
//           src={hand_with_thunder_mobile}
//           alt="hand with thunder"
//           className="md:hidden pointer-events-none select-none absolute right-0 top-[70%] w-[90vw] z-10"
//         />
//       </div>
//     </section>
//   );
// };

// export default ContactUs;

// import React, { useState } from "react";
// import {
//   hand_with_thunder,
//   hand_with_thunder_mobile
// } from "../assets/images/Home";

// const ContactUs = () => {
//   const [message, setMessage] = useState("");
//   const [showEmptyHint, setShowEmptyHint] = useState(false);

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     if (!message.trim()) {
//       setShowEmptyHint(true);
//       return;
//     }

//     setShowEmptyHint(false);
//     // later: handle send logic here
//   };

//   return (
//     <section className="relative w-full h-screen bg-evolve-yellow text-black overflow-hidden flex flex-col md:flex-row">
//       {/* ================= LEFT SECTION (content) ================= */}
//       <div
//         className="relative z-20 w-full md:w-1/2 max-w-[80vw] mx-auto md:mx-0
//                 px-5 md:px-12 pt-16 md:pt-24 pb-10 md:pb-20
//                 flex flex-col justify-start md:ml-20"
//       >
//         {/* headings */}
//         <h1 className="font-extrabold lowercase mt-4 text-[2.5rem] md:text-[4rem] leading-tight">
//           need to talk?
//         </h1>
//         <p className="lowercase font-normal text-[1.25rem] md:text-[2rem] leading-snug">
//           we&apos;re here for real questions.
//         </p>

//         {/* form */}
//         <form className="mt-6 md:mt-12" onSubmit={handleSubmit}>
//           {/* email */}
//           <label className="block w-full md:w-[39rem]">
//             <span className="sr-only">email</span>
//             <input
//               type="email"
//               required
//               placeholder="enter email"
//               className="w-full rounded-2xl md:rounded-[16px] px-5 md:px-6 py-4 md:py-5
//                          bg-transparent border-2 border-[#806804]
//                          placeholder-black font-bold
//                          text-black outline-none focus:ring-2 ring-[#806804]
//                          text-[1.25rem] md:text-[1.5rem]
//                          placeholder:text-[1.25rem] md:placeholder:text-[1.5rem]"
//             />
//           </label>

//           {/* message + button */}
//           <div className="mt-4 md:mt-6 md:flex md:items-stretch md:gap-4 md:w-[46rem]">
//             <label className="block w-full md:flex-1">
//               <span className="sr-only">message</span>
//               <textarea
//                 placeholder="what’s on your mind?"
//                 rows={5}
//                 value={message}
//                 onChange={(e) => {
//                   setMessage(e.target.value);
//                   if (e.target.value.trim()) setShowEmptyHint(false);
//                 }}
//                 className="w-full rounded-2xl md:rounded-[16px] px-5 md:px-6 py-4 md:py-5
//                            min-h-[9rem] md:min-h-[11rem]
//                            bg-transparent border-2 border-[#806804]
//                            placeholder-black font-bold
//                            text-black outline-none focus:ring-2 ring-[#806804]
//                            text-[1.25rem] md:text-[1.5rem]
//                            placeholder:text-[1.25rem] md:placeholder:text-[1.5rem] resize-none"
//               />
//               {showEmptyHint && (
//                 <p className="mt-2 text-sm md:text-base font-semibold text-[#806804] lowercase">
//                   tell us what you want to talk about.
//                 </p>
//               )}
//             </label>

//             {/* circle enter button */}
//             <div className="mt-4 md:mt-0 md:flex md:items-end">
//               <button
//                 type="submit"
//                 aria-label="send message"
//                 className="grid place-items-center rounded-full bg-black
//                          w-16 h-16 md:w-24 md:h-24 transition-transform active:scale-95"
//               >
//                 <svg
//                   viewBox="0 0 24 24"
//                   className="w-7 h-7 md:w-10 md:h-10"
//                   fill="none"
//                   xmlns="http://www.w3.org/2000/svg"
//                 >
//                   <path d="M4 12h14" stroke="#F2E205" strokeWidth="2" />
//                   <path d="M12 6l6 6-6 6" stroke="#F2E205" strokeWidth="2" />
//                 </svg>
//               </button>
//             </div>
//           </div>
//         </form>
//       </div>

//       {/* ================= RIGHT SECTION (image) ================= */}
//       <div className="relative w-full md:w-1/2 flex justify-end items-end">
//         {/* desktop image bottom-right (hidden on mobile) */}
//         <img
//           src={hand_with_thunder}
//           alt="hand with thunder"
//           className="hidden md:block pointer-events-none select-none fixed right-0 -bottom-32 w-[50vw] lg:w-[55vw] xl:w-[60vw] z-10"
//         />
//         {/* mobile image bottom-left */}
//         <img
//           src={hand_with_thunder_mobile}
//           alt="hand with thunder"
//           className="md:hidden pointer-events-none select-none absolute right-0 top-[70%] w-[90vw] z-10"
//         />
//       </div>
//     </section>
//   );
// };

// export default ContactUs;

// import React, { useState } from "react";
// import {
//   hand_with_thunder,
//   hand_with_thunder_mobile
// } from "../assets/images/Home";

// const ContactUs = () => {
//   const [email, setEmail] = useState("");
//   const [message, setMessage] = useState("");
//   const [showEmptyHint, setShowEmptyHint] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [status, setStatus] = useState(null); // "success" | "error" | null

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!message.trim()) {
//       setShowEmptyHint(true);
//       return;
//     }

//     setShowEmptyHint(false);
//     setIsSubmitting(true);
//     setStatus(null);

//     try {
//       const res = await fetch("/api/contact", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify({ email, message })
//       });

//       if (!res.ok) throw new Error("failed");

//       setStatus("success");
//       setMessage("");
//       setEmail("");
//     } catch (err) {
//       console.error(err);
//       setStatus("error");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <section className="relative w-full h-screen bg-evolve-yellow text-black overflow-hidden flex flex-col md:flex-row">
//       {/* ================= LEFT SECTION (content) ================= */}
//       <div
//         className="relative z-20 w-full md:w-1/2 max-w-[80vw] mx-auto md:mx-0
//                 px-5 md:px-12 pt-16 md:pt-24 pb-10 md:pb-20
//                 flex flex-col justify-start md:ml-20"
//       >
//         {/* headings */}
//         <h1 className="font-extrabold lowercase mt-4 text-[2.5rem] md:text-[4rem] leading-tight">
//           need to talk?
//         </h1>
//         <p className="lowercase font-normal text-[1.25rem] md:text-[2rem] leading-snug">
//           we&apos;re here for real questions.
//         </p>

//         {/* form */}
//         <form className="mt-6 md:mt-12" onSubmit={handleSubmit}>
//           {/* email */}
//           <label className="block w-full md:w-[39rem]">
//             <span className="sr-only">email</span>
//             <input
//               type="email"
//               required
//               placeholder="enter email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="w-full rounded-2xl md:rounded-[16px] px-5 md:px-6 py-4 md:py-5
//                          bg-transparent border-2 border-[#806804]
//                          placeholder-black font-bold
//                          text-black outline-none focus:ring-2 ring-[#806804]
//                          text-[1.25rem] md:text-[1.5rem]
//                          placeholder:text-[1.25rem] md:placeholder:text-[1.5rem]"
//             />
//           </label>

//           {/* message + button */}
//           <div className="mt-4 md:mt-6 md:flex md:items-stretch md:gap-4 md:w-[46rem]">
//             <label className="block w-full md:flex-1">
//               <span className="sr-only">message</span>
//               <textarea
//                 placeholder="what’s on your mind?"
//                 rows={5}
//                 value={message}
//                 onChange={(e) => {
//                   setMessage(e.target.value);
//                   if (e.target.value.trim()) setShowEmptyHint(false);
//                 }}
//                 className="w-full rounded-2xl md:rounded-[16px] px-5 md:px-6 py-4 md:py-5
//                            min-h-[9rem] md:min-h-[11rem]
//                            bg-transparent border-2 border-[#806804]
//                            placeholder-black font-bold
//                            text-black outline-none focus:ring-2 ring-[#806804]
//                            text-[1.25rem] md:text-[1.5rem]
//                            placeholder:text-[1.25rem] md:placeholder:text-[1.5rem] resize-none"
//               />
//               {showEmptyHint && (
//                 <p className="mt-2 text-sm md:text-base font-semibold text-[#806804] lowercase">
//                   tell us what you want to talk about.
//                 </p>
//               )}
//               {status === "success" && (
//                 <p className="mt-2 text-sm md:text-base font-semibold text-green-800 lowercase">
//                   got it, we&apos;ll reach out soon.
//                 </p>
//               )}
//               {status === "error" && (
//                 <p className="mt-2 text-sm md:text-base font-semibold text-red-700 lowercase">
//                   something went wrong, please try again.
//                 </p>
//               )}
//             </label>

//             {/* circle enter button */}
//             <div className="mt-4 md:mt-0 md:flex md:items-end">
//               <button
//                 type="submit"
//                 aria-label="send message"
//                 disabled={isSubmitting}
//                 className="group grid place-items-center rounded-full bg-black
//                          w-16 h-16 md:w-24 md:h-24 transition-transform active:scale-95
//                          disabled:opacity-70 disabled:cursor-not-allowed"
//               >
//                 <svg
//                   viewBox="0 0 24 24"
//                   className="w-7 h-7 md:w-10 md:h-10 group-hover:animate-arrow-wiggle"
//                   fill="none"
//                   xmlns="http://www.w3.org/2000/svg"
//                 >
//                   <path d="M4 12h14" stroke="#F2E205" strokeWidth="2" />
//                   <path d="M12 6l6 6-6 6" stroke="#F2E205" strokeWidth="2" />
//                 </svg>
//               </button>
//             </div>
//           </div>
//         </form>
//       </div>

//       {/* ================= RIGHT SECTION (image) ================= */}
//       <div className="relative w-full md:w-1/2 flex justify-end items-end">
//         {/* desktop image bottom-right (hidden on mobile) */}
//         <img
//           src={hand_with_thunder}
//           alt="hand with thunder"
//           className="hidden md:block pointer-events-none select-none fixed right-0 -bottom-32 w-[50vw] lg:w-[55vw] xl:w-[60vw] z-10"
//         />
//         {/* mobile image bottom-left */}
//         <img
//           src={hand_with_thunder_mobile}
//           alt="hand with thunder"
//           className="md:hidden pointer-events-none select-none absolute right-0 top-[70%] w-[90vw] z-10"
//         />
//       </div>
//     </section>
//   );
// };

// export default ContactUs;

import React, { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import {
  hand_with_thunder,
  hand_with_thunder_mobile
} from "../assets/images/Home";

const ContactUs = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [showEmptyHint, setShowEmptyHint] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(null);
  const [emailValid, setEmailValid] = useState(null);
  const [isHovering, setIsHovering] = useState(false);

  const arrowRef = useRef(null);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);

    if (value.trim() === "") {
      setEmailValid(null);
    } else if (validateEmail(value)) {
      setEmailValid(true);
    } else {
      setEmailValid(false);
    }
  };

  // GSAP arrow pulse animation on hover
  useEffect(() => {
    if (!arrowRef.current) return;

    if (isHovering) {
      gsap.to(arrowRef.current, {
        x: 3,
        duration: 0.3,
        ease: "power1.inOut",
        yoyo: true,
        repeat: -1,
        repeatDelay: 0
      });
    } else {
      gsap.killTweensOf(arrowRef.current);
      gsap.to(arrowRef.current, {
        x: 0,
        duration: 0.2,
        ease: "power1.out"
      });
    }

    return () => gsap.killTweensOf(arrowRef.current);
  }, [isHovering]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message.trim()) {
      setShowEmptyHint(true);
      return;
    }

    if (!emailValid) {
      return;
    }

    setShowEmptyHint(false);
    setIsSubmitting(true);
    setStatus(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, message })
      });

      if (!res.ok) throw new Error("failed");

      setStatus("success");
      setMessage("");
      setEmail("");
      setEmailValid(null);
    } catch (err) {
      console.error(err);
      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative w-full h-screen bg-evolve-yellow text-black overflow-hidden flex flex-col md:flex-row">
      {/* ================= LEFT SECTION (content) ================= */}
      <div
        className="relative z-20 w-full md:w-1/2 max-w-[80vw] mx-auto md:mx-0 
                px-5 md:px-12 pt-16 md:pt-24 pb-10 md:pb-20 
                flex flex-col justify-start md:ml-20"
      >
        {/* headings */}
        <h1 className="font-extrabold lowercase mt-4 text-[2.5rem] md:text-[4rem] leading-tight">
          need to talk?
        </h1>
        <p className="lowercase font-normal text-[1.25rem] md:text-[2rem] leading-snug">
          we&apos;re here for real questions.
        </p>

        {/* form */}
        <form className="mt-6 md:mt-12" onSubmit={handleSubmit}>
          {/* email */}
          <label className="block w-full md:w-[39rem] relative">
            <span className="sr-only">email</span>
            {/* <input
              type="email"
              required
              placeholder="enter email"
              value={email}
              onChange={handleEmailChange}
              className={`w-full rounded-2xl md:rounded-[16px] px-5 md:px-6 py-4 md:py-5
                         bg-transparent border-2
                         ${
                           emailValid === false
                             ? "border-red-600 text-red-600"
                             : emailValid === true
                             ? "border-black text-black"
                             : "border-[#806804]"
                         }
                         placeholder-black font-bold
                         outline-none focus:ring-2 
                         ${
                           emailValid === false
                             ? "ring-red-600 focus:border-red-600 focus:text-red-600"
                             : "ring-[#806804] focus:border-black focus:text-black"
                         }
                         text-[1.25rem] md:text-[1.5rem]
                         placeholder:text-[1.25rem] md:placeholder:text-[1.5rem]
                         pr-14`}
            /> */}
            <input
              type="email"
              required
              placeholder="enter email"
              value={email}
              onChange={handleEmailChange}
              autoComplete="email"
              className={`w-full rounded-2xl md:rounded-[16px] px-5 md:px-6 py-4 md:py-5
             bg-transparent border-2
             ${
               emailValid === false
                 ? "border-red-600 text-red-600"
                 : emailValid === true
                 ? "border-black text-black"
                 : "border-[#806804]"
             }
             placeholder-black font-bold
             outline-none focus:ring-2 
             ${
               emailValid === false
                 ? "ring-red-600 focus:border-red-600 focus:text-red-600"
                 : "ring-[#806804] focus:border-black focus:text-black"
             }
             text-[1.25rem] md:text-[1.5rem]
             placeholder:text-[1.25rem] md:placeholder:text-[1.5rem]
             pr-14
             [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_1000px_rgb(255,208,7)_inset]
             [&:-webkit-autofill]:[-webkit-text-fill-color:#000000]
             [&:-webkit-autofill:hover]:[-webkit-box-shadow:0_0_0_1000px_rgb(255,208,7)_inset]
             [&:-webkit-autofill:focus]:[-webkit-box-shadow:0_0_0_1000px_rgb(255,208,7)_inset]`}
            />

            {/* Error icon */}
            {emailValid === false && (
              <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 md:w-7 md:h-7 rounded-full border-2 border-red-600 bg-transparent">
                <span className="text-red-600 font-bold text-sm md:text-base">
                  i
                </span>
              </div>
            )}

            {/* Success checkmark */}
            {emailValid === true && (
              <svg
                className="absolute right-5 top-1/2 -translate-y-1/2 w-6 h-6 md:w-7 md:h-7"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M5 13l4 4L19 7"
                  stroke="#22c55e"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </label>

          {/* message + button */}
          <div className="mt-4 md:mt-6 md:flex md:items-stretch md:gap-4 md:w-[46rem]">
            <label className="block w-full md:flex-1">
              <span className="sr-only">message</span>
              <textarea
                placeholder="what's on your mind?"
                rows={5}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  if (e.target.value.trim()) setShowEmptyHint(false);
                }}
                className="w-full rounded-2xl md:rounded-[16px] px-5 md:px-6 py-4 md:py-5
                           min-h-[9rem] md:min-h-[11rem]
                           bg-transparent border-2 border-[#806804]
                           placeholder-black font-bold
                           text-black outline-none focus:ring-2 ring-[#806804] focus:border-black focus:text-black
                           text-[1.25rem] md:text-[1.5rem]
                           placeholder:text-[1.25rem] md:placeholder:text-[1.5rem] resize-none"
              />
              {showEmptyHint && (
                <p className="mt-2 text-sm md:text-base font-semibold text-[#806804] lowercase">
                  tell us what you want to talk about.
                </p>
              )}
              {status === "error" && (
                <p className="mt-2 text-sm md:text-base font-semibold text-red-700 lowercase">
                  something went wrong, please try again.
                </p>
              )}
            </label>

            {/* circle enter button */}
            {/* circle enter button */}
            <div className="mt-4 md:mt-0 md:flex md:items-end md:self-end relative">
              <button
                type="submit"
                aria-label="send message"
                disabled={isSubmitting}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                className="group grid place-items-center rounded-full bg-black
             w-16 h-16 md:w-24 md:h-24 transition-transform active:scale-95
             disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <svg
                  ref={arrowRef}
                  viewBox="0 0 24 24"
                  className="w-7 h-7 md:w-10 md:h-10"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M4 12h14" stroke="#F2E205" strokeWidth="2" />
                  <path d="M12 6l6 6-6 6" stroke="#F2E205" strokeWidth="2" />
                </svg>
              </button>

              {/* Success message - mobile: right of button */}
              {status === "success" && (
                <div className="md:hidden absolute left-20 top-1/2 -translate-y-1/2 flex items-center gap-2 bg-evolve-yellow">
                  <svg
                    className="w-5 h-5 flex-shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle cx="12" cy="12" r="10" fill="black" />
                    <path
                      d="M8 12l3 3 5-6"
                      stroke="#F2E205"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="text-black font-bold text-sm whitespace-nowrap lowercase">
                    your submission was successful
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Success message - desktop: below textarea */}
          {status === "success" && (
            <div className="hidden md:flex items-center gap-2 mt-4">
              <svg
                className="w-6 h-6 flex-shrink-0"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle cx="12" cy="12" r="10" fill="black" />
                <path
                  d="M8 12l3 3 5-6"
                  stroke="#F2E205"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-black font-bold text-base lowercase">
                your submission was successful
              </span>
            </div>
          )}
        </form>
      </div>

      {/* ================= RIGHT SECTION (image) ================= */}
      <div className="relative w-full md:w-1/2 flex justify-end items-end">
        {/* desktop image bottom-right (hidden on mobile) */}
        <img
          src={hand_with_thunder}
          alt="hand with thunder"
          className="hidden md:block pointer-events-none select-none fixed right-0 -bottom-32 w-[50vw] lg:w-[55vw] xl:w-[60vw] z-10"
        />
        {/* mobile image bottom-left */}
        <img
          src={hand_with_thunder_mobile}
          alt="hand with thunder"
          className="md:hidden pointer-events-none select-none absolute right-0 top-[70%] w-[90vw] z-10"
        />
      </div>
    </section>
  );
};

export default ContactUs;
