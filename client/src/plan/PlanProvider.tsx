import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "awaydays.plans";

/** One away-day plan: an ordered list of spots, plus the fixture it is built around. */
export type StadiumPlan = {
  /** Spot ids, in visiting order. */
  stops: string[];
  /** The fixture the timeline counts back from. */
  eventId: string | null;
};

type PlansState = {
  byStadium: Record<string, StadiumPlan>;
  /** Lets the header's "My plan" link know where to go. */
  lastStadium: string | null;
};

const EMPTY_PLAN: StadiumPlan = { stops: [], eventId: null };

const INITIAL_STATE: PlansState = { byStadium: {}, lastStadium: null };

function loadState(): PlansState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATE;
    const parsed: unknown = JSON.parse(raw);
    // Storage is user-writable and survives across deploys, so treat anything
    // that isn't the shape we expect as absent rather than trusting it.
    if (
      parsed &&
      typeof parsed === "object" &&
      "byStadium" in parsed &&
      typeof (parsed as PlansState).byStadium === "object"
    ) {
      return parsed as PlansState;
    }
  } catch {
    // Corrupt JSON or private mode — start empty.
  }
  return INITIAL_STATE;
}

type PlanContextValue = {
  lastStadium: string | null;
  planFor: (slug: string) => StadiumPlan;
  toggleStop: (slug: string, spotId: string) => void;
  removeStop: (slug: string, spotId: string) => void;
  moveStop: (slug: string, index: number, direction: -1 | 1) => void;
  chooseEvent: (slug: string, eventId: string) => void;
  clearPlan: (slug: string) => void;
};

const PlanContext = createContext<PlanContextValue | null>(null);

export function PlanProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PlansState>(loadState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Out of quota or private mode — the plan still works for this session.
    }
  }, [state]);

  /** Applies a change to one stadium's plan and marks it as the current one. */
  const update = useCallback(
    (slug: string, change: (plan: StadiumPlan) => StadiumPlan) => {
      setState((previous) => {
        const current = previous.byStadium[slug] ?? EMPTY_PLAN;
        return {
          lastStadium: slug,
          byStadium: { ...previous.byStadium, [slug]: change(current) },
        };
      });
    },
    [],
  );

  const value = useMemo<PlanContextValue>(
    () => ({
      lastStadium: state.lastStadium,

      planFor: (slug) => state.byStadium[slug] ?? EMPTY_PLAN,

      toggleStop: (slug, spotId) =>
        update(slug, (plan) => ({
          ...plan,
          stops: plan.stops.includes(spotId)
            ? plan.stops.filter((id) => id !== spotId)
            : [...plan.stops, spotId],
        })),

      removeStop: (slug, spotId) =>
        update(slug, (plan) => ({
          ...plan,
          stops: plan.stops.filter((id) => id !== spotId),
        })),

      moveStop: (slug, index, direction) =>
        update(slug, (plan) => {
          const target = index + direction;
          if (target < 0 || target >= plan.stops.length) return plan;
          const stops = [...plan.stops];
          const moved = stops[index];
          const displaced = stops[target];
          // `noUncheckedIndexedAccess` makes these possibly-undefined, and a
          // guard is cheaper than asserting.
          if (moved === undefined || displaced === undefined) return plan;
          stops[index] = displaced;
          stops[target] = moved;
          return { ...plan, stops };
        }),

      chooseEvent: (slug, eventId) => update(slug, (plan) => ({ ...plan, eventId })),

      clearPlan: (slug) => update(slug, () => EMPTY_PLAN),
    }),
    [state, update],
  );

  return <PlanContext value={value}>{children}</PlanContext>;
}

export function usePlans(): PlanContextValue {
  const context = useContext(PlanContext);
  if (!context) {
    throw new Error("usePlans must be used inside <PlanProvider>");
  }
  return context;
}
