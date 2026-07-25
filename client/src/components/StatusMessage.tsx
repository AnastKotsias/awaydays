type StatusMessageProps = {
  title: string;
  description?: string;
};

/** Neutral panel used for loading, empty and error states. */
export function StatusMessage({ title, description }: StatusMessageProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-night-900 p-8 text-center">
      <p className="font-semibold text-white">{title}</p>
      {description ? (
        <p className="mt-1 text-sm text-slate-400">{description}</p>
      ) : null}
    </div>
  );
}

/** Grey placeholder shown while data loads, matching the real card's shape. */
export function SkeletonCard() {
  return (
    <div className="h-40 animate-pulse rounded-xl border border-white/10 bg-night-900" />
  );
}
