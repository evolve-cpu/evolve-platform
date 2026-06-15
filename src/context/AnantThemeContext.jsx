import { createContext, useContext, useState, useCallback, useMemo } from "react";

const AnantThemeContext = createContext({ dark: true, toggleDark: () => {} });

export function AnantThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    try {
      const stored = localStorage.getItem("anant_theme");
      return stored ? stored === "dark" : false;
    } catch {
      return true;
    }
  });

  const toggleDark = useCallback(() => {
    setDark(prev => {
      const next = !prev;
      try { localStorage.setItem("anant_theme", next ? "dark" : "light"); } catch {}
      return next;
    });
  }, []);

  const value = useMemo(() => ({ dark, toggleDark }), [dark, toggleDark]);

  return (
    <AnantThemeContext.Provider value={value}>
      {children}
    </AnantThemeContext.Provider>
  );
}

export function useAnantTheme() {
  return useContext(AnantThemeContext);
}
