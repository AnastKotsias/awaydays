import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="py-16 text-center">
      <p className="text-sm font-semibold text-pitch-400">404</p>
      <h1 className="mt-2 text-3xl font-bold text-white">Wrong ground</h1>
      <p className="mt-2 text-slate-400">
        That page doesn&rsquo;t exist. Let&rsquo;s get you back to the fixtures.
      </p>
      <Link
        to="/"
        className="mt-6 inline-block rounded-lg bg-pitch-500 px-4 py-2 font-semibold text-night-950 transition hover:bg-pitch-400"
      >
        Browse grounds
      </Link>
    </div>
  );
}
