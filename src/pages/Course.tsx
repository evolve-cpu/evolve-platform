import { Link } from "react-router-dom"; // if using React Router
const Course = () => {
  return (
    <div className="min-h-screen lowercase bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gradient mb-6 animate-text-reveal">
            Time to Get Your Hands Dirty
          </h1>
          <p className="text-xl text-evolve-gray max-w-4xl mx-auto leading-relaxed">
            This isn't a course you rush through. It's a journey you grow into.
          </p>
        </div>

        {/* Journey in 4 Acts */}
        {/* Journey in 4 Acts */}
        <div className="mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-evolve-white mb-12">
            How It Works: Your Journey in{" "}
            <span className="text-gradient">4 Acts</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {/* Act 1 */}
            <div className="bento-item bg-evolve-lavender-indigo rounded-lg p-8 flex flex-col">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-evolve-white rounded-full flex items-center justify-center text-evolve-lavender-indigo font-bold text-lg mr-4">
                  1
                </div>
                <h3 className="text-xl font-bold text-evolve-white">
                  Act 1: Beginner
                </h3>
              </div>
              <p className="text-evolve-yellow mb-3">3 months</p>
              <p className="text-evolve-white text-sm">
                Find your creative voice. Learn to see like a designer.
              </p>
            </div>

            {/* Act 2 */}
            <div className="bento-item bg-evolve-bright-turquoise rounded-lg p-8 flex flex-col">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-evolve-black rounded-full flex items-center justify-center text-evolve-bright-turquoise font-bold text-lg mr-4">
                  2
                </div>
                <h3 className="text-xl font-bold text-evolve-black">
                  Act 2: Intermediate
                </h3>
              </div>
              <p className="text-evolve-black mb-3">3 months</p>
              <p className="text-evolve-black text-sm">
                Build your toolkit. Start solving real problems.
              </p>
            </div>

            {/* Act 3 */}
            <div className="bento-item bg-evolve-inchworm rounded-lg p-8 flex flex-col">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-evolve-black rounded-full flex items-center justify-center text-evolve-inchworm font-bold text-lg mr-4">
                  3
                </div>
                <h3 className="text-xl font-bold text-evolve-black">
                  Act 3: Advanced
                </h3>
              </div>
              <p className="text-evolve-black mb-3">3 months</p>
              <p className="text-evolve-black text-sm">
                Master your craft. Design like it matters.
              </p>
            </div>

            {/* Act 4 */}
            <div className="bento-item bg-evolve-bollywood-pink rounded-lg p-8 flex flex-col">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-evolve-white rounded-full flex items-center justify-center text-evolve-bollywood-pink font-bold text-lg mr-4">
                  4
                </div>
                <h3 className="text-xl font-bold text-evolve-white">
                  Act 4: Paid Internship
                </h3>
              </div>
              <p className="text-evolve-yellow mb-3">6 months</p>
              <p className="text-evolve-white text-sm">
                Work with us. Get paid. Ship real work to real clients.
              </p>
            </div>
          </div>

          {/* 🔥 Full-width "What is Design?" course */}
          <div className="w-full bg-gradient-to-r from-evolve-lavender-indigo via-evolve-bright-turquoise to-evolve-bollywood-pink rounded-2xl p-12 text-center shadow-lg">
            <h3 className="text-3xl md:text-4xl font-bold text-black mb-4">
              What is Design?
            </h3>
            <p className="text-lg text-black/90 mb-8 max-w-3xl mx-auto">
              Discover the essence of design through an interactive Genially
              experience that goes beyond theory — it’s hands-on, engaging, and
              crafted for you.
            </p>
            <Link
              to="/what-is-design"
              className="inline-block bg-white text-evolve-lavender-indigo font-semibold text-lg px-10 py-4 rounded-xl shadow hover:scale-105 transition-transform"
            >
              🚀 Open Course
            </Link>
          </div>
        </div>

        {/* Built for Real Life */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
          <div className="bento-item bg-evolve-charleston-green rounded-lg p-8 flex flex-col">
            <h2 className="text-2xl font-bold text-evolve-bright-turquoise mb-6">
              Built for Real Life, Not Perfect Schedules
            </h2>
            <div className="text-evolve-white leading-relaxed space-y-4">
              <p>Life happens. Dreams shift. Readiness comes in waves.</p>
              <p>
                <strong className="text-evolve-yellow">
                  Pause when you need to. Resume when you're ready.
                </strong>{" "}
                Each level stands on its own… pay as you progress, grow at your
                pace.
              </p>
              <p className="text-evolve-bright-turquoise font-medium">
                The only rule? Complete all three study levels to unlock your
                paid internship with Paperclip Design.
              </p>
              <p className="text-sm italic text-evolve-white">
                Because the best learning happens when you're truly ready for
                it.
              </p>
            </div>
          </div>

          <div className="bento-item bg-evolve-polished-pine rounded-lg p-8 flex flex-col">
            <h3 className="text-2xl font-bold text-evolve-black mb-6">
              Your Creative Family: Cohorts of 10
            </h3>
            <div className="text-evolve-black leading-relaxed space-y-4">
              <p>
                You won't do this alone. You'll join a tight-knit cohort of 10
                fellow creators, each with their own spark, their own story,
                their own way of seeing the world.
              </p>

              <div className="bg-evolve-arsenic p-4 rounded-18px">
                <h4 className="text-evolve-bright-turquoise font-semibold mb-2">
                  Your dedicated mentor becomes your creative compass:
                </h4>
                <ul className="text-sm space-y-2 text-evolve-white">
                  <li>
                    <strong>Two group calls every month:</strong> where you get
                    unstuck, push harder, and see what you're actually capable
                    of
                  </li>
                  <li>
                    <strong>Always-on chat support:</strong> because inspiration
                    doesn't keep business hours, and neither do creative blocks
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* The Internship */}
        <div className="card-evolve p-8 lg:p-12 bg-evolve-lavender-indigo mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-evolve-white mb-6 text-center">
            The Internship: Earn Your Seat at the Table
          </h2>
          <div className="text-evolve-white text-lg leading-relaxed space-y-4 max-w-4xl mx-auto">
            <p>
              <strong>
                Six months. Real clients. Real deadlines. Real pay.
              </strong>{" "}
              You'll design alongside our team at Paperclip Design, contributing
              to mission-critical projects, solving problems that matter,
              creating work that ships.
            </p>
            <p className="text-center text-xl font-semibold text-evolve-yellow">
              But here's the catch: You have to earn it. Complete all three
              levels. Show us you're ready.
            </p>
            <p className="text-center text-evolve-bright-turquoise">
              Because when you walk into that internship, you won't just be
              another student looking for experience. You'll be a designer ready
              to make their mark.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-evolve-white mb-8">
            Here's What Happens Next
          </h2>
          <p className="text-xl text-evolve-gray mb-12 max-w-3xl mx-auto">
            You pick your starting level. You join your cohort. You get to work.
          </p>
          <p className="text-lg text-evolve-gray mb-8">
            No more "someday." No more "...when I'm ready."
          </p>
          <button className="btn-accent text-xl px-12 py-5">Start Now</button>
        </div>
      </div>
    </div>
  );
};

export default Course;
