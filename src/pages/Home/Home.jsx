// import React from "react";
// import ScrollController from "./ScrollController";
// import Scene1 from "./Scene1";
// import { grain_texture } from "../../assets/images/Home";
// import Scene2 from "./Scene2";

// const Home = () => {
//   return (
//     <div className="">
//       <ScrollController>
//         <div
//           // ref={grainRef}
//           style={{
//             position: "absolute",
//             top: 0,
//             left: 0,
//             width: "100%",
//             height: "100%",
//             pointerEvents: "none",
//             zIndex: 999,
//             mixBlendMode: "overlay", // try 'multiply' or 'overlay'
//             opacity: 0.2, // increase for stronger grain
//             backgroundImage: `url(${grain_texture})`,
//             backgroundRepeat: "repeat",
//             backgroundSize: "90px 90px", // smaller = denser noise
//             filter: "contrast(150%) brightness(110%)"
//           }}
//         />
//         <Scene1 />
//         <Scene2 />
//         {/* </div> */}
//       </ScrollController>
//     </div>
//   );
// };

// export default Home;

// import React from "react";
// import ScrollController from "./ScrollController";
// import Scene1 from "./Scene1";
// import Scene2 from "./Scene2";
// import { grain_texture } from "../../assets/images/Home";

// const Home = () => {
//   return (
//     <div className="relative overflow-hidden">
//       {/* ✨ GRAIN TEXTURE - Fixed overlay across all scenes */}
//       <div
//         style={{
//           position: "fixed",
//           top: 0,
//           left: 0,
//           width: "100%",
//           height: "100%",
//           pointerEvents: "none",
//           zIndex: 9999,
//           mixBlendMode: "overlay",
//           opacity: 0.2,
//           backgroundImage: `url(${grain_texture})`,
//           backgroundRepeat: "repeat",
//           backgroundSize: "90px 90px",
//           filter: "contrast(150%) brightness(110%)"
//         }}
//       />

//       {/* Normal scroll container - NO transforms */}
//       {/* <ScrollController> */}
//       <Scene1 />
//       <Scene2 />
//       {/* Add more scenes here */}
//       {/* </ScrollController> */}
//     </div>
//   );
// };

// export default Home;

// ============================================
// 📄 Home.js - SIMPLE VERSION
// ============================================
import React from "react";
import { SceneProvider, SceneWrapper } from "./SceneManager";
import Scene1 from "./Scene1";
import Scene2 from "./Scene2";
import { grain_texture } from "../../assets/images/Home";

const Home = () => {
  return (
    <SceneProvider>
      {/* ✨ GRAIN TEXTURE - Fixed overlay across all scenes */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 9999,
          mixBlendMode: "overlay",
          opacity: 0.2,
          backgroundImage: `url(${grain_texture})`,
          backgroundRepeat: "repeat",
          backgroundSize: "90px 90px",
          filter: "contrast(150%) brightness(110%)"
        }}
      />

      {/* Scene 1 - Base */}
      <SceneWrapper sceneIndex={0} className="bg-black w-full">
        <Scene1 />
      </SceneWrapper>

      {/* Scene 2 - Overlays Scene 1 */}
      <SceneWrapper
        sceneIndex={1}
        className="bg-gradient-to-br from-slate-900 to-black w-full"
      >
        <Scene2 />
      </SceneWrapper>
    </SceneProvider>
  );
};

export default Home;
