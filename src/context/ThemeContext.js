import { createContext, useContext, useCallback, useMemo } from "react";

import useLocalStorage from "../hooks/useLocalStorage";
import { STORAGE_KEYS } from "../storage";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useLocalStorage(STORAGE_KEYS.THEME, "light");

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }, [setTheme]);

  const value = useMemo(
    () => ({
      theme,
      toggleTheme,
    }),
    [theme, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme phải được sử dụng bên trong ThemeProvider");
  }

  return context;
};
