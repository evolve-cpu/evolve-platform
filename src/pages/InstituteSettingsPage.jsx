import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

// Settings used to be its own full page here, with its own copy of the
// topbar/sidebar shell — navigating to it remounted the entire app shell
// just to swap the main content area. It now lives inside
// InstitutePublicPage as a `tab === "settings"` view (see
// InstituteSettingsPanel), rendered in the exact same shell instance so the
// sidebar/topbar never unmount. This route stays in place purely so old
// bookmarks/links to /institute/:slug/settings still land somewhere useful.
export default function InstituteSettingsPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    navigate(`/institute/${slug}`, { replace: true, state: { openTab: "settings" } });
  }, [slug, navigate]);

  return null;
}
