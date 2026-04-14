import React from "react";

/**
 * Renders a string that may contain \n or <br/> as actual line breaks in JSX.
 * Usage: {renderWithBreaks(someString)}
 */
export function renderWithBreaks(text) {
  if (!text) return null;
  const parts = text.split(/\n|<br\s*\/?>/);
  return parts.map((part, i) => (
    <React.Fragment key={i}>
      {part}
      {i < parts.length - 1 && <br />}
    </React.Fragment>
  ));
}
