import React from "react";

const Community = () => {
  return (
    <div className="min-h-screen lowercase bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Intro */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gradient mb-6 animate-text-reveal">
            Not a Forum. Not a Feed!
          </h1>
          <h2 className="text-2xl md:text-3xl font-bold text-evolve-white mb-6">
            An Inner Circle Built for Creators.
          </h2>
          <p className="text-lg text-evolve-gray max-w-4xl mx-auto leading-relaxed">
            The 'Evolve' community is not a place where ideas sit pretty. It's{" "}
            <strong className="text-evolve-bright-turquoise">YOUR</strong> space
            to ask bold questions, trade war stories, learn from real people,
            and build the kind of skills that stick for life. Over time, the
            community will stay selective — so that what you get here is
            quality, not noise.
          </p>
        </div>

        {/* Grid */}
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-evolve-white mb-12">
            Inside <span className="text-gradient">The Circle</span>
          </h2>

          <div className="flex flex-col sm:flex-row justify-center gap-6 mb-8 animate-fade-in">
            <a
              href="https://discord.gg/RnFAuwrmSt"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-evolve-lavender-indigo/20 border border-evolve-lavender-indigo text-white font-bold text-lg shadow-lg hover:scale-105 transition-transform w-full sm:w-auto justify-center"
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 28 28"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M23.5 6.5a23.9 23.9 0 0 0-5.9-2.1c-.3-.1-.6.1-.7.4a16.7 16.7 0 0 0-.5 1.2c-2.1-.3-4.2-.3-6.3 0-.1-.4-.3-.8-.5-1.2a.6.6 0 0 0-.7-.4A23.9 23.9 0 0 0 4.5 6.5a.6.6 0 0 0-.3.2C1.7 10.2.6 13.7.7 17.3c0 .1.1.2.2.3a24.2 24.2 0 0 0 7.2 3.7c.3.1.6-.1.7-.4l.6-1.7c.1-.3 0-.6-.2-.8l-1.2-1.2c.2-.2.4-.4.6-.6.1-.1.3-.1.4 0 2.5 1.8 5.8 1.8 8.3 0 .1-.1.3-.1.4 0 .2.2.4.4.6.6l-1.2 1.2c-.2.2-.3.5-.2.8l.6 1.7c.1.3.4.5.7.4a24.2 24.2 0 0 0 7.2-3.7c.1-.1.2-.2.2-.3.1-3.6-1-7.1-3.5-10.6a.6.6 0 0 0-.3-.2ZM10.5 15.5c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5Zm7 0c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5Z"
                  fill="#5865F2"
                />
              </svg>
              Join Discord
            </a>
            <a
              href="https://chat.whatsapp.com/HwTYDlQ7xB0HqsaC3IXBcJ"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-evolve-bright-turquoise/20 border border-evolve-bright-turquoise text-white font-bold text-lg shadow-lg hover:scale-105 transition-transform w-full sm:w-auto justify-center mt-4 sm:mt-0"
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 28 28"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M14 2.5A11.5 11.5 0 0 0 2.5 14c0 2 .5 3.9 1.4 5.6L2 26l6.6-1.9A11.5 11.5 0 1 0 14 2.5Zm0 21a9.5 9.5 0 0 1-4.8-1.3l-.3-.2-3.9 1.1 1.1-3.7-.2-.3A9.5 9.5 0 1 1 14 23.5Zm5.2-7.1c-.3-.2-1.7-.8-2-.9-.3-.1-.5-.2-.7.2-.2.3-.8.9-1 .9-.2 0-.5-.1-1-.4-.5-.3-1.7-1.5-2-2.7-.2-.5 0-.7.2-.9.2-.2.3-.4.5-.6.2-.2.2-.3.3-.5.1-.2 0-.4 0-.6 0-.2-.7-1.7-1-2.3-.2-.5-.5-.5-.7-.5h-.6c-.2 0-.5.1-.7.3-.2.2-.9.9-.9 2.2 0 1.3.9 2.5 1 2.7.1.2 1.7 2.7 4.1 3.7.6.2 1.1.3 1.5.2.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2-.1-.1-.3-.2-.6-.3Z"
                  fill="#25D366"
                />
              </svg>
              Join WhatsApp
            </a>
          </div>

          <div className="grid grid-cols-1 gap-6 mb-6 animate-fade-in">
            <div className="p-6 rounded-2xl bg-evolve-lavender-indigo hover:scale-105 transition-transform animate-pop-in">
              <h3 className="text-lg font-bold text-black mb-3">
                Ask Anything. Really!
              </h3>
              <p className="text-sm text-black leading-relaxed">
                From 'How do I start?' to 'Am I doing this right?', get real
                answers from designers who've lived it.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 animate-fade-in">
            <div className="p-6 rounded-2xl bg-evolve-bright-turquoise hover:scale-105 transition-transform animate-pop-in">
              <h3 className="text-lg font-bold text-black mb-3">
                Feedback that stings (and sticks)
              </h3>
              <p className="text-sm text-black leading-relaxed">
                Drop your work in. Paperclip/Evolve's designers will break it
                down with you 1:1, then share the lessons (with your nod) so the
                whole crew learns.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-evolve-inchworm hover:scale-105 transition-transform animate-pop-in">
              <h3 className="text-lg font-bold text-black mb-3">
                Find Your Crew
              </h3>
              <p className="text-sm text-black leading-relaxed">
                Connect with peers, mentors, and the Paperclip/Evolve team.
                Whether it's sharing ideas, swapping stories, or just hanging
                out in the chill zone.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-evolve-flame hover:scale-105 transition-transform animate-pop-in">
              <h3 className="text-lg font-bold text-black mb-3">
                Push yourself in challenges
              </h3>
              <p className="text-sm text-black leading-relaxed">
                Take part in short sprints or long design challenges. Test your
                skills, stretch your creativity, and see how others tackle the
                same brief.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
            <div className="p-6 rounded-2xl bg-evolve-yellow hover:scale-105 transition-transform animate-pop-in">
              <h3 className="text-lg font-bold text-black mb-3">
                Get the good stuff, hand-picked
              </h3>
              <p className="text-sm text-black leading-relaxed">
                Access curated resources — the tools, articles, and
                recommendations that actually help you sharpen your craft.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-evolve-lavender-indigo-2 hover:scale-105 transition-transform animate-pop-in">
              <h3 className="text-lg font-bold text-black mb-3">
                Read. Learn. Repeat.
              </h3>
              <p className="text-sm text-black leading-relaxed">
                Join the Book Club to dive into design classics and other
                must-reads. Weekly virtual meets keep it lively — expect
                spirited discussions, fresh takes, and a deeper grip on the
                ideas that shape design.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-evolve-pink hover:scale-105 transition-transform animate-pop-in">
              <h3 className="text-lg font-bold text-black mb-3">
                Play a little
              </h3>
              <p className="text-sm text-black leading-relaxed">
                Jump into design-inspired game nights. They're light-hearted,
                fun, and a great way to bond while keeping your creativity
                flowing.
              </p>
            </div>
          </div>
        </div>

        {/* Call to action */}
        <div className="p-8 lg:p-12 text-center bg-purple-gradient rounded-2xl mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Be the First to know. Always.
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Get updates, releases, and opportunities, straight from the source.
          </p>
          <button className="bg-white text-evolve-lavender-indigo px-8 py-4 rounded-20px font-bold text-lg hover:scale-105 transition-transform">
            Join the Inner Circle
          </button>
        </div>

        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-evolve-white mb-8">
            Step In. <span className="text-gradient">Be Remarkable.</span>
          </h2>
          <button className="btn-accent text-xl px-12 py-5">
            Apply for Access
          </button>
        </div>
      </div>
    </div>
  );
};

export default Community;
