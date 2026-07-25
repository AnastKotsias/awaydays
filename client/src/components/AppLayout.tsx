import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { usePlans } from "@/plan/PlanProvider";
import { useTheme } from "@/theme/ThemeProvider";

/** Routes that sit on a full-bleed map and supply their own chrome. */
const FULL_BLEED = /^\/stadiums\/[^/]+$/;

export default function AppLayout() {
  const { label, toggle } = useTheme();
  const { lastStadium } = usePlans();
  const { pathname } = useLocation();

  const showFooter = !FULL_BLEED.test(pathname);

  // "My plan" needs a ground to be about. Send people to the fixture list
  // until they have picked one.
  const planHref = lastStadium ? `/stadiums/${lastStadium}/plan` : "/grounds";

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    [
      "px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em] border-b-2 transition-colors",
      isActive
        ? "text-ink border-acid"
        : "text-ink-3 border-transparent hover:text-ink",
    ].join(" ");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-600 border-b border-line bg-glass backdrop-blur-[14px]">
        <div className="flex h-16 items-center gap-7 px-6">
          <Link to="/" className="flex items-center gap-[11px] text-ink">
            <span
              aria-hidden="true"
              className="grid size-[34px] place-items-center bg-acid font-display text-[17px] tracking-[-0.5px] text-acid-ink"
            >
              AD
            </span>
            <span className="flex flex-col gap-px">
              <span className="font-display text-[17px] leading-none tracking-[0.02em] uppercase">
                Away Days
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink-3">
                Where&rsquo;s the game?
              </span>
            </span>
          </Link>

          <nav className="ml-3 flex items-center gap-1">
            <NavLink to="/" end className={navItemClass}>
              Home
            </NavLink>
            <NavLink to="/grounds" className={navItemClass}>
              Grounds
            </NavLink>
            <NavLink to={planHref} className={navItemClass}>
              My plan
            </NavLink>
          </nav>

          <div className="flex-1" />

          <button
            type="button"
            onClick={toggle}
            className="flex h-[34px] cursor-pointer items-center gap-2 border border-line px-3 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-2 transition-colors hover:border-acid hover:text-ink"
          >
            <span
              aria-hidden="true"
              className="block size-[9px] rounded-full bg-acid"
            />
            {label}
          </button>

          <Link
            to="/signin"
            className="grid h-[34px] place-items-center bg-acid px-4 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-acid-ink"
          >
            Sign in
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      {showFooter ? (
        <footer className="border-t border-line bg-canvas-2">
          <div className="mx-auto flex max-w-330 flex-wrap items-center justify-between gap-6 px-6 py-7">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">
              Away Days — a university project by Anastasis Kotsias
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">
              Map data ©{" "}
              <a
                href="https://www.openstreetmap.org/copyright"
                className="text-ink-2 underline underline-offset-2 hover:text-acid"
              >
                OpenStreetMap
              </a>{" "}
              contributors, tiles © CARTO
            </p>
          </div>
        </footer>
      ) : null}
    </div>
  );
}
