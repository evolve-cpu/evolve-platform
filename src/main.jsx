import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.jsx";
import "./index.css";
import { trackVisit } from "./lib/platformAnalytics";

// before the first render — AuthContext strips OAuth params from the URL
trackVisit();

const rootElement = document.getElementById("root");
const app = (
  <HelmetProvider>
    <App />
  </HelmetProvider>
);

// Prerendered pages (scripts/prerender.mjs) ship static HTML for AI readers and
// crawlers; React simply re-renders over it rather than hydrating, since the
// snapshot includes browser-only state (animations, auth) that would mismatch.
createRoot(rootElement).render(app);
