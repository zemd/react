/**
 * Counter External Store
 *
 * External store implementation used with useSyncExternalStore. The store can
 * be shared across multiple components and lives in its own module so example
 * component files only export components (fast-refresh friendly).
 */
import { useSyncExternalStore } from "react";

export type CounterState = {
  readonly count: number;
  readonly lastUpdated: Temporal.Instant | null;
};

export type CounterStore = {
  readonly getSnapshot: () => CounterState;
  readonly getServerSnapshot: () => CounterState;
  readonly subscribe: (listener: () => void) => () => void;
  readonly increment: () => void;
  readonly decrement: () => void;
  readonly reset: () => void;
  readonly set: (value: number) => void;
};

/**
 * Factory function to create a counter store.
 * The store can be shared across multiple components.
 */
export function createCounterStore(initialValue = 0): CounterStore {
  let state: CounterState = {
    count: initialValue,
    lastUpdated: null,
  };
  const listeners = new Set<() => void>();

  const notify = (): void => {
    for (const listener of listeners) {
      listener();
    }
  };

  return {
    getSnapshot: () => {
      return state;
    },
    getServerSnapshot: () => {
      return { count: initialValue, lastUpdated: null };
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    increment: () => {
      state = { count: state.count + 1, lastUpdated: Temporal.Now.instant() };
      notify();
    },
    decrement: () => {
      state = { count: state.count - 1, lastUpdated: Temporal.Now.instant() };
      notify();
    },
    reset: () => {
      state = { count: initialValue, lastUpdated: Temporal.Now.instant() };
      notify();
    },
    set: (value: number) => {
      state = { count: value, lastUpdated: Temporal.Now.instant() };
      notify();
    },
  };
}

// Create a shared store instance
export const sharedCounterStore: CounterStore = createCounterStore(0);

/**
 * Custom hook to use the counter store with useSyncExternalStore.
 */
export function useCounterStore(store: CounterStore = sharedCounterStore): {
  readonly count: number;
  readonly lastUpdated: Temporal.Instant | null;
  readonly increment: () => void;
  readonly decrement: () => void;
  readonly reset: () => void;
  readonly set: (value: number) => void;
} {
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);

  return {
    ...state,
    increment: store.increment,
    decrement: store.decrement,
    reset: store.reset,
    set: store.set,
  };
}
