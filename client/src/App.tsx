import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import NotFoundPage from "@/pages/NotFoundPage";
import StadiumPage from "@/pages/StadiumPage";
import StadiumsPage from "@/pages/StadiumsPage";

/**
 * Every URL the app answers to.
 *
 * The routes are nested inside a single layout route, so AppLayout renders
 * once and swaps only its <Outlet /> as the user navigates.
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<StadiumsPage />} />
          <Route path="stadiums/:slug" element={<StadiumPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
