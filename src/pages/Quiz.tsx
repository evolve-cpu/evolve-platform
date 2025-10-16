// const Quiz = () => {
//   return (
//     <div className="min-h-screen lowercase bg-black">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
//         <div className="text-center mb-16">
//           <h1 className="text-5xl md:text-6xl font-bold text-gradient mb-6 animate-text-reveal">
//             Think you know design? Prove it.
//           </h1>
//           <p className="text-xl text-evolve-gray max-w-4xl mx-auto leading-relaxed">
//             Real problems. Quick answers.{" "}
//             <span className="text-evolve-bright-turquoise font-medium">
//               Instant feedback that shows you exactly where your thinking breaks
//               down.
//             </span>
//           </p>
//         </div>

//         <div className="bento-grid mb-16">
//           <div className="bento-item card-evolve lg:col-span-3">
//             <h2 className="text-2xl font-bold text-evolve-white mb-6">
//               Grid of Quizzes
//             </h2>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//               {[
//                 {
//                   title: "Design Fundamentals",
//                   difficulty: "Beginner",
//                   questions: 15,
//                   time: "10 min",
//                   color: "evolve-lavender-indigo",
//                   description: "Test your knowledge of basic design principles"
//                 },
//                 {
//                   title: "Color Theory Mastery",
//                   difficulty: "Intermediate",
//                   questions: 12,
//                   time: "8 min",
//                   color: "evolve-bright-turquoise",
//                   description: "How well do you understand color relationships?"
//                 },
//                 {
//                   title: "Typography Challenge",
//                   difficulty: "Advanced",
//                   questions: 20,
//                   time: "15 min",
//                   color: "evolve-flame",
//                   description: "Put your typography knowledge to the test"
//                 },
//                 {
//                   title: "UX Research Basics",
//                   difficulty: "Beginner",
//                   questions: 10,
//                   time: "7 min",
//                   color: "evolve-inchworm",
//                   description: "Understanding user research fundamentals"
//                 },
//                 {
//                   title: "Design Systems",
//                   difficulty: "Advanced",
//                   questions: 18,
//                   time: "12 min",
//                   color: "evolve-yellow",
//                   description: "How scalable design systems really work"
//                 },
//                 {
//                   title: "Accessibility Standards",
//                   difficulty: "Intermediate",
//                   questions: 14,
//                   time: "9 min",
//                   color: "evolve-heliotrope",
//                   description: "Inclusive design principles and practices"
//                 }
//               ].map((quiz, index) =>
//                 <div
//                   key={index}
//                   className="p-4 bg-evolve-arsenic rounded-18px hover:scale-105 transition-transform cursor-pointer"
//                 >
//                   <div
//                     className={`w-4 h-4 bg-${quiz.color} rounded-full mb-3`}
//                   />
//                   <h3 className="font-bold text-evolve-white mb-2">
//                     {quiz.title}
//                   </h3>
//                   <p className="text-xs text-evolve-gray mb-2">
//                     {quiz.description}
//                   </p>

//                   <div className="flex justify-between items-center text-xs text-evolve-gray mb-3">
//                     <span
//                       className={`px-2 py-1 rounded-md bg-${quiz.color} text-evolve-black font-medium`}
//                     >
//                       {quiz.difficulty}
//                     </span>
//                     <span>
//                       {quiz.time}
//                     </span>
//                   </div>

//                   <div className="flex justify-between items-center text-xs text-evolve-gray">
//                     <span>
//                       {quiz.questions} questions
//                     </span>
//                     <button className="btn-secondary text-xs px-3 py-1">
//                       Start Quiz
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>

//           <div className="bento-item card-evolve">
//             <h3 className="text-xl font-semibold text-evolve-flame mb-4">
//               Your Progress
//             </h3>
//             <div className="space-y-4">
//               <div>
//                 <div className="flex justify-between text-sm text-evolve-gray mb-1">
//                   <span>Quizzes Completed</span>
//                   <span>4/6</span>
//                 </div>
//                 <div className="w-full bg-evolve-arsenic rounded-full h-3">
//                   <div
//                     className="bg-evolve-lavender-indigo h-3 rounded-full"
//                     style={{ width: "67%" }}
//                   />
//                 </div>
//               </div>

//               <div>
//                 <div className="flex justify-between text-sm text-evolve-gray mb-1">
//                   <span>Average Score</span>
//                   <span>82%</span>
//                 </div>
//                 <div className="w-full bg-evolve-arsenic rounded-full h-3">
//                   <div
//                     className="bg-evolve-bright-turquoise h-3 rounded-full"
//                     style={{ width: "82%" }}
//                   />
//                 </div>
//               </div>

//               <div className="pt-4 border-t border-evolve-arsenic">
//                 <h4 className="text-evolve-white font-semibold mb-2">
//                   Recent Achievements
//                 </h4>
//                 <div className="space-y-2 text-xs text-evolve-gray">
//                   <p>🏆 Color Theory Master</p>
//                   <p>⭐ Perfect Score: UX Research</p>
//                   <p>🔥 3-Day Streak</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="text-center">
//           <button className="btn-accent text-lg px-10 py-4">
//             Take Random Quiz
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Quiz;

import React from "react";
import { ArrowRight } from "lucide-react";

const Quiz = () => {
  return (
    <div className="min-h-screen lowercase bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Intro */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gradient mb-6 animate-text-reveal">
            Think you know design? Prove it.
          </h1>
          <p className="text-xl text-evolve-gray max-w-4xl mx-auto leading-relaxed">
            Real problems. Quick answers.{" "}
            <span className="text-evolve-bright-turquoise font-medium">
              Instant feedback that shows you exactly where your thinking breaks
              down.
            </span>
          </p>
        </div>

        {/* Quiz Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-16">
          {/* Seen/unseen quiz */}
          <div className="p-6 rounded-2xl shadow-md hover:scale-[1.02] transition-transform bg-evolve-inchworm flex flex-col justify-between">
            <div>
              <h3 className="font-extrabold text-evolve-black mb-2 text-2xl">
                Seen/unseen
              </h3>
              <p className="text-base text-evolve-black/80 mb-4">
                Discover the logic behind the ordinary.
              </p>

              {/* Tags */}
              <div className="flex justify-between items-center text-sm text-evolve-black mb-4">
                <span className="px-3 py-1 rounded-md bg-evolve-black text-white font-semibold">
                  Intermediate
                </span>
                <span>10 min</span>
              </div>

              <div className="flex justify-between items-center text-sm text-evolve-black mb-6">
                <span>15 questions</span>
              </div>
            </div>

            {/* CTA button */}
            <a
              href="https://story-quiz.netlify.app/quiz/story"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 text-base font-semibold px-5 py-3 rounded-lg bg-evolve-black text-white hover:bg-opacity-90 transition-colors"
            >
              Start Quiz <ArrowRight size={18} />
            </a>
          </div>

          {/* Print it right quiz */}
          <div className="p-6 rounded-2xl shadow-md hover:scale-[1.02] transition-transform bg-evolve-bright-turquoise flex flex-col justify-between">
            <div>
              <h3 className="font-extrabold text-evolve-black mb-2 text-2xl">
                print it right!
              </h3>
              <p className="text-base text-evolve-black/80 mb-4">
                A design mission to fix your final sample before the client sees
                it.
              </p>

              {/* Tags */}
              <div className="flex justify-between items-center text-sm text-evolve-black mb-4">
                <span className="px-3 py-1 rounded-md bg-evolve-black text-white font-semibold">
                  Intermediate
                </span>
                <span>8 min</span>
              </div>

              <div className="flex justify-between items-center text-sm text-evolve-black mb-6">
                <span>12 questions</span>
              </div>
            </div>

            {/* CTA button */}
            <a
              href="https://evolve-printing-challange.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 text-base font-semibold px-5 py-3 rounded-lg bg-evolve-black text-white hover:bg-opacity-90 transition-colors"
            >
              Start Quiz <ArrowRight size={18} />
            </a>
          </div>
        </div>

        {/* Random Quiz CTA */}
        <div className="text-center">
          <button className="btn-secondary inline-flex items-center gap-2 text-base font-semibold px-8 py-3 rounded-lg hover:scale-[1.02] transition-transform mx-auto">
            Take Random Quiz <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
