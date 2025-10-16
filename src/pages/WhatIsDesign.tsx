import React, { useState } from "react";

const WhatIsDesign = () => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div style={{ width: "100%", maxWidth: "900px" }}>
        <div
          style={{
            position: "relative",
            paddingBottom: "177.77%",
            height: 0,
            overflow: "hidden"
          }}
        >
          {/* Loader Overlay */}
          {!loaded &&
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black">
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-evolve-lavender-indigo border-t-transparent" />
            </div>}

          {/* Genially iframe */}
          <iframe
            title="what is design?"
            src="https://view.genially.com/68d2037cc1cf1960693cd5ca"
            frameBorder="0"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%"
            }}
            allowFullScreen
            scrolling="yes"
            allow="autoplay; fullscreen"
            onLoad={() => setLoaded(true)}
          />
        </div>
      </div>
    </div>
  );
};

export default WhatIsDesign;
