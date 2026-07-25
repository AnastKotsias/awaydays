import { useState, type FormEvent } from "react";

type Mode = "signin" | "signup";

const FIELDS: Record<
  Mode,
  { label: string; type: string; placeholder: string; autoComplete: string }[]
> = {
  signin: [
    {
      label: "Email",
      type: "email",
      placeholder: "you@example.gr",
      autoComplete: "email",
    },
    {
      label: "Password",
      type: "password",
      placeholder: "••••••••",
      autoComplete: "current-password",
    },
  ],
  signup: [
    {
      label: "Username",
      type: "text",
      placeholder: "anast",
      autoComplete: "username",
    },
    {
      label: "Email",
      type: "email",
      placeholder: "you@example.gr",
      autoComplete: "email",
    },
    {
      label: "Password",
      type: "password",
      placeholder: "at least 8 characters",
      autoComplete: "new-password",
    },
  ],
};

/**
 * The members' gate.
 *
 * Presentation only for now — there is no auth endpoint behind it yet. The
 * form deliberately does not pretend to work: submitting explains what is
 * still missing rather than faking a session.
 */
export default function AuthPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
      <div className="relative flex flex-col justify-between overflow-hidden border-r border-line bg-canvas-2 px-12 py-16">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[repeating-linear-gradient(135deg,var(--line2)_0_1px,transparent_1px_10px)]"
        />
        <p className="relative font-mono text-[10px] uppercase tracking-[0.24em] text-acid">
          Members&rsquo; gate
        </p>
        <div className="relative">
          <h1 className="font-display text-[clamp(40px,6vw,76px)] leading-[0.88] uppercase tracking-[-0.02em]">
            Save the day,
            <br />
            share the day.
          </h1>
          <p className="mt-5.5 max-w-[38ch] text-[17px] leading-[1.6] text-pretty text-ink-2">
            An account keeps your itineraries, your rated spots and the plans
            your mates sent you. Nothing else.
          </p>
        </div>
        <div
          aria-hidden="true"
          className="relative h-2 bg-[repeating-linear-gradient(135deg,var(--acid)_0_10px,transparent_10px_20px)]"
        />
      </div>

      <div className="grid place-items-center px-12 py-16">
        <form onSubmit={handleSubmit} className="w-full max-w-100">
          <div className="flex border border-line">
            {(["signin", "signup"] as Mode[]).map((candidate) => {
              const isActive = mode === candidate;
              return (
                <button
                  key={candidate}
                  type="button"
                  onClick={() => {
                    setMode(candidate);
                    setSubmitted(false);
                  }}
                  aria-pressed={isActive}
                  className={[
                    "flex-1 cursor-pointer py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] transition-colors",
                    isActive
                      ? "bg-acid text-acid-ink"
                      : "bg-transparent text-ink-3 hover:text-ink",
                  ].join(" ")}
                >
                  {candidate === "signin" ? "Sign in" : "Create account"}
                </button>
              );
            })}
          </div>

          {FIELDS[mode].map((field) => (
            <label key={field.label} className="mt-6 block">
              <span className="block font-mono text-[9px] uppercase tracking-[0.2em] text-ink-3">
                {field.label}
              </span>
              <input
                type={field.type}
                placeholder={field.placeholder}
                autoComplete={field.autoComplete}
                className="mt-2 w-full border-0 border-b border-line bg-transparent py-3.25 text-base text-ink outline-none placeholder:text-ink-3 focus:border-acid"
              />
            </label>
          ))}

          <button
            type="submit"
            className="mt-8 h-13 w-full cursor-pointer bg-acid font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-acid-ink"
          >
            {mode === "signup" ? "Create account" : "Sign in"}
          </button>

          <p
            className="mt-4.5 font-mono text-[10px] leading-[1.7] tracking-[0.06em] text-ink-3"
            aria-live="polite"
          >
            {submitted
              ? "Nothing to sign in to yet — accounts arrive in phase 4, with JWT and bcrypt behind them. Your plans are saved in this browser in the meantime."
              : mode === "signup"
                ? "JWT in an httpOnly cookie, bcrypt on the password. Phase 4 of the build."
                : "Forgot it? Password resets land in phase 4 with the rest of auth."}
          </p>
        </form>
      </div>
    </div>
  );
}
