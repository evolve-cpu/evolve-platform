import { Link } from "react-router-dom";
const AboutUs = () => {
  return (
    <div className="min-h-screen lowercase bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gradient mb-6 animate-text-reveal">
            More Than Learning. Less Than School.
          </h1>
          <p className="text-xl text-evolve-gray max-w-4xl mx-auto leading-relaxed">
            Evolve comes from the people of Paperclip Design: hardworking folks
            who've stumbled, hacked, failed, learned, nailed it, broken it,
            rebuilt it — and we keep at it to this day unabashedly,
            unapologetically, and unrelentingly.
          </p>
        </div>

        <div className="bento-grid mb-16">
          <div className="bento-item bg-evolve-charleston-green border border-evolve-charleston-green rounded-lg p-8 lg:col-span-3">
            <h2 className="text-2xl font-bold text-evolve-bright-turquoise mb-6">
              What Evolve Really Is
            </h2>
            <div className="text-evolve-white leading-relaxed space-y-4">
              <p>
                We've learned the hard lessons, spotted the blind spots, and
                found the thrill in turning creativity into craft.
              </p>
              <p>
                <strong className="text-evolve-bright-turquoise">
                  evolve is not a school.
                </strong>{" "}
                It's a living, breathing space for community, mentorship,
                late-night challenges, and the kind of learning that sticks. A
                place where you don't just study design; you practice it,
                question it, and master it.
              </p>
              <p className="text-evolve-yellow">
                Here, you'll explore, grow, and thrive.
              </p>
              <p className="text-evolve-pink">
                Here, design stops being just a skill and starts becoming a lens
                for seeing the world.
              </p>
              <p className="text-evolve-white font-semibold text-lg">
                Here, you learn what it means to Be Remarkable!
              </p>
            </div>
          </div>

          <div className="bento-item bg-evolve-lavender-indigo/10 border border-evolve-lavender-indigo rounded-lg p-6">
            <h3 className="text-xl font-semibold text-evolve-lavender-indigo mb-4">
              Our Design DNA
            </h3>
            <div className="space-y-3 text-white text-sm">
              <p>
                <strong className="text-evolve-white">
                  We blend styles:
                </strong>{" "}
                the structure of tradition with the freedom of self-taught
                hustle.
              </p>
              <p>
                <strong className="text-evolve-white">
                  We stay hands-on:
                </strong>{" "}
                building products, mentoring learners, and shaping evolve as we
                go.
              </p>
            </div>
          </div>
        </div>

        <div className="bento-grid mb-16">
          <div className="bento-item bg-evolve-bright-turquoise/10 border border-evolve-bright-turquoise rounded-lg p-6">
            <h4 className="text-lg font-semibold text-evolve-bright-turquoise mb-3">
              Keep the Core Strong
            </h4>
            <p className="text-white text-sm">
              Research, design, test, iterate. Repeat!
            </p>
          </div>

          <div className="bento-item bg-evolve-inchworm/10 border border-evolve-inchworm rounded-lg p-6">
            <h4 className="text-lg font-semibold text-evolve-inchworm mb-3">
              Real World Focus
            </h4>
            <p className="text-white text-sm">
              Tools, methods, and messy challenges straight from our projects.
            </p>
          </div>

          <div className="bento-item bg-evolve-flame/10 border border-evolve-flame rounded-lg p-6 lg:col-span-2">
            <h4 className="text-lg font-semibold text-evolve-flame mb-3">
              Both Sides of the Craft
            </h4>
            <p className="text-white text-sm">
              We train deep thinking and fast delivery as equal partners.
            </p>
          </div>
        </div>

        <div className="card-evolve p-8 lg:p-12 text-center bg-evolve-lavender-indigo mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-evolve-white mb-6">
            About Paperclip Design
          </h2>
          <p className="text-evolve-white text-lg max-w-3xl mx-auto leading-relaxed">
            evolve is where the next generation of designers finds their start.
            Created by the team at Paperclip Design, it's built by people who've
            been where you are now — some self-taught, some formally trained —
            all of us having learned the hard lessons, spotted the gaps, and
            found the magic in turning creativity into a career.
          </p>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-evolve-white mb-8">
            Ready to Be Remarkable?
          </h2>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link to="/community">
              <button className="btn-accent text-lg px-8 py-4">
                Join Our Community
              </button>
            </Link>
            <Link to="/course">
              <button className="btn-secondary text-lg px-8 py-4">
                View Our Courses
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
