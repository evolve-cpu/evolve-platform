import React from "react";
import {
  hand_with_thunder,
  hand_with_thunder_mobile
} from "../assets/images/Home";

const ContactUs = () => {
  return (
    <section className="relative w-full h-screen bg-evolve-yellow text-black overflow-hidden flex flex-col md:flex-row">
      {/* ================= LEFT SECTION (content) ================= */}
      <div
        className="relative z-20 w-full md:w-1/2 max-w-[600px] mx-auto md:mx-0 
                px-5 md:px-12 pt-16 md:pt-24 pb-10 md:pb-20 
                flex flex-col justify-start md:ml-20"
      >
        {/* headings (pushed down) */}
        <h1 className="font-extrabold lowercase mt-4 text-[2.5rem] md:text-[4rem] leading-tight">
          need to talk?
        </h1>
        <p className="  lowercase font-normal text-[1.25rem] md:text-[2rem] leading-snug">
          we&apos;re here for real questions.
        </p>

        {/* form */}
        <form
          className="mt-6 md:mt-12"
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          {/* email */}
          <label className="block w-full">
            <span className="sr-only">email</span>
            <input
              type="email"
              required
              placeholder="enter email"
              className="w-full md:w-[80%] rounded-2xl md:rounded-[16px] px-5 md:px-6 py-4 md:py-5
                         bg-[#BF9C05] placeholder-black placeholder:opacity-90
                         text-black outline-none focus:ring-2 ring-black
                         text-[1.25rem] md:text-[2rem]"
            />
          </label>

          {/* message + send (same width as email on desktop) */}
          <div className="mt-4 md:mt-6 md:grid md:grid-cols-[1fr_auto] md:gap-2">
            <label className="block">
              <span className="sr-only">message</span>
              <textarea
                required
                placeholder="your message"
                rows={4}
                className="w-full rounded-2xl md:rounded-[16px] px-5 md:px-6 py-4 md:py-5
                           md:min-h-[8rem]
                           bg-[#BF9C05] placeholder-black placeholder:opacity-90
                           text-black outline-none focus:ring-2 ring-black
                           text-[1.25rem] md:text-[2rem] resize-none"
              />
            </label>

            {/* circle enter button */}
            <div className="mt-4 md:mt-0 flex md:flex-col md:justify-end">
              <button
                type="submit"
                aria-label="send message"
                className="self-start md:self-auto grid place-items-center rounded-full bg-[#BF9C05]
                           w-16 h-16 md:w-24 md:h-24 transition-transform active:scale-95"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-7 h-7 md:w-10 md:h-10"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M4 12h14" stroke="black" strokeWidth="2" />
                  <path d="M12 6l6 6-6 6" stroke="black" strokeWidth="2" />
                </svg>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* ================= RIGHT SECTION (image) ================= */}
      <div className="relative w-full md:w-1/2 flex justify-end items-end">
        {/* desktop image bottom-right (hidden on mobile) */}
        <img
          src={hand_with_thunder}
          alt="hand with thunder"
          className="hidden md:block pointer-events-none select-none absolute right-[-20vh] bottom-[-20vh] w-[100%] z-10"
          style={{ transform: "translateY(-10%)" }}
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
