// const Webinars = () => {
//   return (
//     <div className="min-h-screen lowercase bg-black">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
//         <div className="text-center mb-16">
//           <h1 className="text-5xl md:text-6xl font-bold text-gradient mb-6 animate-text-reveal">
//             Free. Forever. Worth Your Time.
//           </h1>
//           <p className="text-xl text-evolve-gray max-w-4xl mx-auto leading-relaxed">
//             Learn from people who've been there, done that, and have the work to
//             prove it.<br />
//             <span className="text-evolve-bright-turquoise font-medium">
//               Real talk from working professionals. Practical takeaways you can
//               use immediately.
//             </span>
//             <br />
//             <span className="text-evolve-yellow font-medium">
//               Every session is recorded, so you never miss out.
//             </span>
//           </p>
//         </div>

//         <div className="text-center mb-12">
//           <button className="btn-accent text-lg px-10 py-4">
//             Join the Next One
//           </button>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
//           <div className="bento-item bg-evolve-lavender-indigo/20 border border-evolve-lavender-indigo rounded-lg p-8 lg:col-span-2">
//             <h2 className="text-2xl font-bold text-evolve-bright-turquoise mb-6">
//               Past Webinar Grid
//             </h2>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               {[
//                 {
//                   title: "Design Systems That Scale",
//                   speaker: "Sarah Chen, Lead Designer at Airbnb",
//                   date: "Nov 15, 2024",
//                   duration: "45 min",
//                   color: "evolve-lavender-indigo"
//                 },
//                 {
//                   title: "From Sketch to Prototype",
//                   speaker: "Marcus Rodriguez, Creative Director",
//                   date: "Nov 8, 2024",
//                   duration: "38 min",
//                   color: "evolve-bright-turquoise"
//                 },
//                 {
//                   title: "Color Psychology in UX",
//                   speaker: "Dr. Emma Wilson, Behavioral Designer",
//                   date: "Nov 1, 2024",
//                   duration: "42 min",
//                   color: "evolve-inchworm"
//                 },
//                 {
//                   title: "Typography That Converts",
//                   speaker: "Alex Park, Brand Strategist",
//                   date: "Oct 25, 2024",
//                   duration: "36 min",
//                   color: "evolve-flame"
//                 },
//                 {
//                   title: "Mobile-First Design Principles",
//                   speaker: "Jordan Kim, Product Designer",
//                   date: "Oct 18, 2024",
//                   duration: "44 min",
//                   color: "evolve-yellow"
//                 },
//                 {
//                   title: "Accessibility in Modern Design",
//                   speaker: "Taylor Johnson, UX Researcher",
//                   date: "Oct 11, 2024",
//                   duration: "50 min",
//                   color: "evolve-lavender-indigo"
//                 }
//               ].map((webinar, index) =>
//                 <div
//                   key={index}
//                   className={`p-4 bg-${webinar.color} rounded-18px hover:scale-105 transition-transform cursor-pointer`}
//                 >
//                   <div
//                     className={`w-3 h-3 bg-evolve-black rounded-full mb-3`}
//                   />
//                   <h3 className="font-semibold text-evolve-black mb-2">
//                     {webinar.title}
//                   </h3>
//                   <p className="text-sm text-evolve-black mb-2">
//                     {webinar.speaker}
//                   </p>
//                   <div className="flex justify-between items-center text-xs text-evolve-black">
//                     <span>
//                       {webinar.date}
//                     </span>
//                     <span>
//                       {webinar.duration}
//                     </span>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>

//           <div className="bento-item bg-evolve-bright-turquoise/20 border border-evolve-bright-turquoise rounded-lg p-8">
//             <h3 className="text-xl font-semibold text-evolve-bollywood-pink mb-4">
//               Upcoming Sessions
//             </h3>
//             <div className="space-y-4">
//               <div className="p-4 bg-evolve-yellow rounded-18px">
//                 <h4 className="font-semibold text-evolve-black mb-2">
//                   Design Leadership Fundamentals
//                 </h4>
//                 <p className="text-sm text-evolve-black mb-2">
//                   With Jessica Martinez, Design Director
//                 </p>
//                 <p className="text-xs text-evolve-flame">
//                   Dec 5, 2024 • 3:00 PM EST
//                 </p>
//               </div>

//               <div className="p-4 bg-evolve-pink rounded-18px">
//                 <h4 className="font-semibold text-evolve-black mb-2">
//                   AI Tools for Designers
//                 </h4>
//                 <p className="text-sm text-evolve-black mb-2">
//                   With Ryan Thompson, Tech Lead
//                 </p>
//                 <p className="text-xs text-evolve-flame">
//                   Dec 12, 2024 • 2:00 PM EST
//                 </p>
//               </div>
//             </div>

//             <button className="btn-secondary w-full mt-6">Get Notified</button>
//           </div>
//         </div>

//         <div className="card-evolve p-8 text-center bg-evolve-lavender-indigo/20 border border-evolve-lavender-indigo-2">
//           <h2 className="text-2xl font-bold text-evolve-white mb-4">
//             Want to Host a Session?
//           </h2>
//           <p className="text-evolve-white mb-6 max-w-2xl mx-auto">
//             Have expertise to share with the design community? We're always
//             looking for passionate professionals to lead sessions and share
//             their knowledge.
//           </p>
//           <button className="bg-evolve-white text-evolve-lavender-indigo px-8 py-3 rounded-20px font-semibold hover:scale-105 transition-transform">
//             Propose a Topic
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Webinars;

import React from "react";
import { Play } from "lucide-react"; // play button icon

const Webinars = () => {
  const youtubeVideos = [
    {
      url: "https://youtu.be/IyObZSI6tQo?si=1s8RrZdLPw9AcqbO",
      title:
        "product design 101: fundamentals & real journey | evolve webinar 🎨 | ft. aman gupta",
    },
    {
      url: "https://youtu.be/9zO9fiC8DVQ?si=PYP_1JV4Ovmmyboj",
      title:
        "printing 101: essentials for designers | evolve webinar 🖨️ | ft. dwipal patel",
    },
    {
      url: "https://youtu.be/VdOmgWZCHJQ?si=FKSiHN0xnLFHb-CX",
      title:
        "steps to land your dream design job | evolve webinar 🎙️ | ft. yagnesh ahir ‪@Paperclip.Design‬",
    },
    {
      url: "https://youtu.be/IX6peOgV1M4?si=qIMecT51bUnTR7HL",
      title: "the medium is the message | paramdeep singh",
    },
  ];

  // Extract thumbnail URL from video id
  const getThumbnail = (url) => {
    const match = url.match(/(?:youtu\.be\/|v=)([a-zA-Z0-9_-]{11})/);
    return match
      ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`
      : "";
  };

  return (
    <div className="min-h-screen lowercase bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gradient mb-6 animate-text-reveal">
            Free. Forever. Worth Your Time.
          </h1>
          <p className="text-xl text-evolve-gray max-w-4xl mx-auto leading-relaxed">
            Learn from people who've been there, done that, and have the work to
            prove it. <br />
            <span className="text-evolve-bright-turquoise font-medium">
              Real talk from working professionals. Practical takeaways you can
              use immediately.
            </span>
            <br />
            <span className="text-evolve-yellow font-medium">
              Every session is recorded, so you never miss out.
            </span>
          </p>
        </div>

        {/* CTA */}
        <div className="text-center mb-12">
          <button className="btn-accent text-lg px-10 py-4">
            Join the Next One
          </button>
        </div>

        {/* YouTube Thumbnails with only title captions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-16">
          {youtubeVideos.map((video, idx) => (
            <div key={idx} className="flex flex-col">
              {/* Thumbnail */}
              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="relative group rounded-xl overflow-hidden shadow-lg hover:scale-[1.03] transition-transform"
              >
                <img
                  src={getThumbnail(video.url)}
                  alt={video.title}
                  className="w-full h-56 object-cover"
                />
                {/* Play button overlay */}
                <div
                  className="
                  absolute inset-0 bg-black/40 flex items-center justify-center 
                  opacity-100 md:opacity-0 md:group-hover:opacity-100 
                  transition-opacity
                "
                >
                  <Play className="w-16 h-16 text-white fill-white drop-shadow-lg" />
                </div>
              </a>

              {/* Caption block */}
              <div className="mt-0 sm:mt-3 text-white">
                <h3 className="font-semibold text-sm sm:text-base line-clamp-2">
                  {video.title}
                </h3>
              </div>
            </div>
          ))}
        </div>

        {/* Host CTA */}
        <div className="card-evolve p-8 text-center bg-evolve-lavender-indigo/20 border border-evolve-lavender-indigo-2">
          <h2 className="text-2xl font-bold text-evolve-white mb-4">
            Want to Host a Session?
          </h2>
          <p className="text-evolve-white mb-6 max-w-2xl mx-auto">
            Have expertise to share with the design community? We're always
            looking for passionate professionals to lead sessions and share
            their knowledge.
          </p>
          <button className="bg-evolve-white text-evolve-lavender-indigo px-8 py-3 rounded-20px font-semibold hover:scale-105 transition-transform">
            Propose a Topic
          </button>
        </div>
      </div>
    </div>
  );
};

export default Webinars;
