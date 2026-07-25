type StatusMessageProps = {
  title: string;
  description?: string;
};

/** Neutral panel used for loading, empty and error states. */
export function StatusMessage({ title, description }: StatusMessageProps) {
  return (
    <div className="border border-dashed border-line p-10 text-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink">
        {title}
      </p>
      {description ? (
        <p className="mt-2 font-mono text-[11px] leading-relaxed text-ink-3">
          {description}
        </p>
      ) : null}
    </div>
  );
}

/** Grey placeholder shown while data loads, matching the real card's shape. */
export function SkeletonCard() {
  return (
    <div className="h-56 animate-pulse border border-line bg-surface" />
  );
}
