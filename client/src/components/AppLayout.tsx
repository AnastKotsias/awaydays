import { Link, Outlet } from "react-router-dom";

/**
 * The frame every page sits inside: header, content area, footer.
 *
 * Used as a "layout route" in App.tsx — React Router renders the matched page
 * into <Outlet />, so the header is not re-mounted on every navigation.
 */
export default function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-500 border-b border-white/10 bg-night-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <Link to="/" className="group flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="grid size-9 place-items-center rounded-lg bg-pitch-500 text-lg font-black text-night-950"
            >
              A
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-base font-bold tracking-tight text-white">
                Away Days
              </span>
              <span className="text-xs text-slate-400">
                Where&rsquo;s the game?
              </span>
            </span>
          </Link>

          <nav>
            <Link
              to="/"
              className="rounded-md px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
            >
              Grounds
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-white/10 py-6">
        <p className="mx-auto max-w-6xl px-4 text-xs text-slate-500">
          Away Days — a university project by Anastasis Kotsias. Map data ©{" "}
          <a
            href="https://www.openstreetmap.org/copyright"
            className="underline underline-offset-2 hover:text-slate-300"
          >
            OpenStreetMap
          </a>{" "}
          contributors.
        </p>
      </footer>
    </div>
  );
}
