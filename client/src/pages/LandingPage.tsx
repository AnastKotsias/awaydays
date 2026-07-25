import { Link } from "react-router-dom";
import { useEvents, useStadiums } from "@/api/queries";
import { formatShortDate } from "@/lib/format";

const STEPS = [
  {
    num: "01",
    title: "Find the ground",
    body: "Search by city or club. Every ground carries its real coordinates, capacity and the fixtures coming up.",
  },
  {
    num: "02",
    title: "Work the circle",
    body: "Drag the radius and filter by bar, taverna, pub, café or meeting point. The map answers as you move.",
  },
  {
    num: "03",
    title: "Pin the timeline",
    body: "Add stops and we schedule them backwards from kick-off, walking time included. One link, send it to the group.",
  },
];

export default function LandingPage() {
  const { data: stadiums } = useStadiums();
  const { data: events } = useEvents();

  // Counted from the live API rather than hard-coded, so the numbers can never
  // drift away from what the database actually holds.
  const stats = [
    { value: stadiums ? String(stadiums.length) : "—", label: "Grounds mapped" },
    { value: events ? String(events.length) : "—", label: "Fixtures ahead" },
    {
      value: stadiums
        ? String(stadiums.reduce((total, s) => total + s.spotCount, 0))
        : "—",
      label: "Spots logged",
    },
    { value: "0", label: "API keys needed" },
  ];

  // The marquee needs the list twice: the animation slides exactly half the
  // track width, so the second copy is what makes the loop seamless.
  const ticker = events ? [...events, ...events] : [];

  return (
    <div>
      <section className="relative overflow-hidden border-b border-line">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(135deg,var(--line2)_0_1px,transparent_1px_9px)]"
        />
        <div className="relative mx-auto max-w-330 px-6 pt-22 pb-16">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-acid">
            Away days · matchday no. 01
          </p>
          <h1 className="mt-6 font-display text-[clamp(56px,9vw,132px)] leading-[0.88] uppercase tracking-[-0.02em] text-balance">
            You came for the game.
            <br />
            <span className="text-acid">Stay for the city.</span>
          </h1>
          <div className="mt-11 grid items-end gap-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
            <p className="max-w-[52ch] text-[19px] leading-[1.55] text-pretty text-ink-2">
              Pick an away ground and we&rsquo;ll map the bars with the game on,
              the tavernas locals actually eat in, and the corner where your lot
              meets. Then pin it all to a timeline that ends at kick-off.
            </p>
            <div className="flex flex-wrap justify-start gap-3 lg:justify-end">
              <Link
                to="/grounds"
                className="grid h-14 place-items-center bg-acid px-8 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-acid-ink"
              >
                Plan an away day
              </Link>
              <Link
                to="/stadiums/karaiskakis"
                className="grid h-14 place-items-center border border-line px-8 font-mono text-xs uppercase tracking-[0.18em] text-ink transition-colors hover:border-acid"
              >
                See a ground
              </Link>
            </div>
          </div>
        </div>
      </section>

      {ticker.length > 0 ? (
        <section className="overflow-hidden border-b border-line bg-acid text-acid-ink">
          <div
            className="ticker-track flex w-max"
            style={{ animation: "ticker 40s linear infinite" }}
          >
            {ticker.map((event, index) => (
              <span
                key={`${event.id}-${index}`}
                className="flex items-center gap-3.5 px-5.5 py-2.5 font-mono text-[11px] font-semibold whitespace-nowrap uppercase tracking-[0.14em]"
              >
                <span className="opacity-55">
                  {formatShortDate(event.kickoffAt)}
                </span>
                {event.title}
                <span className="opacity-40">/</span>
              </span>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-330 px-6 py-18">
        <div className="grid grid-cols-2 border-t border-l border-line lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="border-r border-b border-line px-5.5 py-6.5"
            >
              <p className="font-display text-[52px] leading-none tracking-[-0.01em]">
                {stat.value}
              </p>
              <p className="mt-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-3">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-330 px-6 pb-24">
        <h2 className="font-display text-[clamp(30px,4vw,52px)] leading-none uppercase tracking-[-0.01em]">
          Three moves, one day out
        </h2>
        <div className="mt-8.5 grid gap-5 md:grid-cols-3">
          {STEPS.map((step) => (
            <article
              key={step.num}
              className="border border-line bg-surface px-6 pt-7 pb-7.5"
            >
              <p className="font-mono text-[11px] tracking-[0.2em] text-acid">
                {step.num}
              </p>
              <h3 className="mt-4.5 font-display text-[27px] leading-[1.05] uppercase">
                {step.title}
              </h3>
              <p className="mt-3 text-[15px] leading-[1.6] text-pretty text-ink-2">
                {step.body}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
