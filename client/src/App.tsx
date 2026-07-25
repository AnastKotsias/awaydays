import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { PlanProvider } from "@/plan/PlanProvider";
import AuthPage from "@/pages/AuthPage";
import LandingPage from "@/pages/LandingPage";
import NotFoundPage from "@/pages/NotFoundPage";
import PlanPage from "@/pages/PlanPage";
import SharedPlanPage from "@/pages/SharedPlanPage";
import StadiumPage from "@/pages/StadiumPage";
import StadiumsPage from "@/pages/StadiumsPage";

/**
 * Every URL the app answers to.
 *
 * The routes nest inside a single layout route, so AppLayout renders once and
 * swaps only its <Outlet /> as the user navigates.
 */
export default function App() {
  return (
    <BrowserRouter>
      <PlanProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="grounds" element={<StadiumsPage />} />
            <Route path="stadiums/:slug" element={<StadiumPage />} />
            <Route path="stadiums/:slug/plan" element={<PlanPage />} />
            {/* Shared itineraries carry their whole payload in the URL. */}
            <Route path="p/:token" element={<SharedPlanPage />} />
            <Route path="signin" element={<AuthPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </PlanProvider>
    </BrowserRouter>
  );
}
