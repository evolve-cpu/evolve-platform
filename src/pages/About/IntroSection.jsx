const IntroSection = () => (
  <section className="w-full min-h-[100svh] md:min-h-0 bg-evolve-pink flex items-center justify-center px-6 py-24 md:py-[8vw]">
    <div
      className="flex flex-col gap-8 text-center text-white font-medium max-w-[340px] md:max-w-[min(50vw,900px)]"
      style={{
        fontSize: "clamp(22px, 2vw, 32px)",
        lineHeight: 1.3
      }}
    >
      <p>
        Started by Paperclip Design, evolve brings real-world industry
        experience into design education.
      </p>
      <p>
        We’re here to help learners build the skills, confidence, and clarity
        they need to move from learning to doing.
      </p>
    </div>
  </section>
);

export default IntroSection;
