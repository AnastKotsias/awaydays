import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "@/App";
import { ThemeProvider } from "@/theme/ThemeProvider";
import "@/index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stadium and fixture data barely changes, so don't refetch it every
      // time the window regains focus.
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      // One retry covers a blip; more just delays showing the error.
      retry: 1,
    },
  },
});

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error('index.html is missing <div id="root">');
}

createRoot(rootElement).render(
  <StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
);
