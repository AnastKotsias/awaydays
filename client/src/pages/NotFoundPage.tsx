import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-330 px-6 py-24 text-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-acid">
        404
      </p>
      <h1 className="mt-6 font-display text-[clamp(40px,8vw,96px)] leading-[0.9] uppercase tracking-[-0.02em]">
        Wrong ground
      </h1>
      <p className="mt-5 text-lg text-ink-2">
        That page doesn&rsquo;t exist. Let&rsquo;s get you back to the fixtures.
      </p>
      <Link
        to="/grounds"
        className="mt-9 inline-grid h-14 place-items-center bg-acid px-8 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-acid-ink"
      >
        Browse grounds
      </Link>
    </div>
  );
}
