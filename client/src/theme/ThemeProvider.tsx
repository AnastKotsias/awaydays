import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Theme = "dark" | "light";

const STORAGE_KEY = "awaydays.theme";

type ThemeContextValue = {
  theme: Theme;
  /** "Floodlit" in dark, "Daylight" in light — the label on the header toggle. */
  label: string;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

/** Reads the theme the inline script in index.html already applied. */
function readInitialTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.dataset["theme"] === "light"
    ? "light"
    : "dark";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(readInitialTheme);

  // The <html> attribute is what the CSS actually keys off, so React state and
  // the DOM have to stay in step.
  useEffect(() => {
    document.documentElement.dataset["theme"] = theme;
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Private browsing can refuse writes; the theme still works this session.
    }
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      label: theme === "dark" ? "Floodlit" : "Daylight",
      toggle,
    }),
    [theme, toggle],
  );

  return <ThemeContext value={value}>{children}</ThemeContext>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside <ThemeProvider>");
  }
  return context;
}
