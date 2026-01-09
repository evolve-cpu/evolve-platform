// Create: src/utils/sceneImageOptimizer.js

/**
 * Optimizes image loading for Scene components
 * Loads only critical images first, then background images
 */

export const getCriticalSceneImages = (sceneNumber) => {
  // Define which images are critical (visible immediately) per scene
  const criticalImageMap = {
    1: [
      // Scene1 intro - only show logo initially
      "logo",
      "hero"
    ],
    "1_1": [
      // Scene1_1 - first visible elements
      "rightCloud",
      "leftCloud",
      "floor"
    ],
    "1_2": [
      // Scene1_2 - main elements
      "background",
      "mainElement"
    ],
    "1_3": [
      // Scene1_3 - screen elements
      "screen1",
      "mainContent"
    ],
    "1_4": [
      // Scene1_4 - final scene
      "background",
      "centerpiece"
    ]
  };

  return criticalImageMap[sceneNumber] || [];
};

/**
 * Preload images for a specific scene
 */
export const preloadSceneImages = (images, priority = "low") => {
  return Promise.all(
    images.map((src) => {
      return new Promise((resolve) => {
        const img = new Image();
        if (priority === "high") {
          img.fetchPriority = "high";
        }
        img.onload = resolve;
        img.onerror = resolve; // Don't block on errors
        img.src = src;
      });
    })
  );
};

/**
 * React hook for scene-specific image loading
 */
import { useState, useEffect } from "react";

export const useSceneImages = (sceneNumber, allImages) => {
  const [criticalLoaded, setCriticalLoaded] = useState(false);
  const [allLoaded, setAllLoaded] = useState(false);

  useEffect(() => {
    const criticalImageKeys = getCriticalSceneImages(sceneNumber);
    const criticalImages = Object.entries(allImages)
      .filter(([key]) => criticalImageKeys.includes(key))
      .map(([, src]) => src);

    const backgroundImages = Object.entries(allImages)
      .filter(([key]) => !criticalImageKeys.includes(key))
      .map(([, src]) => src);

    // Load critical images first
    preloadSceneImages(criticalImages, "high").then(() => {
      setCriticalLoaded(true);

      // Load background images after critical ones
      if ("requestIdleCallback" in window) {
        requestIdleCallback(() => {
          preloadSceneImages(backgroundImages, "low").then(() => {
            setAllLoaded(true);
          });
        });
      } else {
        setTimeout(() => {
          preloadSceneImages(backgroundImages, "low").then(() => {
            setAllLoaded(true);
          });
        }, 500);
      }
    });
  }, [sceneNumber, allImages]);

  return { criticalLoaded, allLoaded };
};

/**
 * Optimize SVG for animations
 */
export const optimizeSVGForAnimation = (svgElement) => {
  if (!svgElement) return;

  // Add CSS optimization hints
  svgElement.style.willChange = "transform";
  svgElement.style.transform = "translateZ(0)"; // Force GPU acceleration

  // Reduce complexity for animations
  const paths = svgElement.querySelectorAll("path");
  paths.forEach((path) => {
    path.style.vectorEffect = "non-scaling-stroke";
  });
};

/**
 * Lazy component wrapper for scenes
 */
import React, { Suspense } from "react";

export const LazyScene = ({
  component: Component,
  fallback = null,
  ...props
}) => {
  return (
    <Suspense fallback={fallback}>
      <Component {...props} />
    </Suspense>
  );
};
