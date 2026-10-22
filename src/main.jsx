import { createRoot, hydrateRoot } from "react-dom/client";
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

if (rootElement.hasChildNodes()) {
  hydrateRoot(rootElement, app);
} else {
  createRoot(rootElement).render(app);
}
