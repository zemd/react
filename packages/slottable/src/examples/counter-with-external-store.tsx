/**
 * Counter with External Store Example
 *
 * Demonstrates how to use useSlot with useSyncExternalStore for
 * managing external state that can be shared across multiple components.
 */
import { useCallback, useEffect, useState } from "react";
import type { PropsWithSlots } from "../types";
import { useSlot } from "../use-slot";
import {
  createCounterStore,
  sharedCounterStore,
  useCounterStore,
  type CounterStore,
} from "./counter-store";

// ==============================================
// Slottable Counter Component
// ==============================================

// Default slot components
const DefaultDisplay: React.FC<{
  readonly count: number;
  readonly className?: string;
}> = ({ count, className }) => (
  <span
    className={className}
    style={{
      fontSize: "3rem",
      fontWeight: "bold",
      fontFamily: "monospace",
    }}
  >
    {count}
  </span>
);

const DefaultButton: React.FC<{
  readonly onClick: () => void;
  readonly children: React.ReactNode;
  readonly disabled?: boolean;
  readonly variant?: "increment" | "decrement" | "reset";
}> = ({ onClick, children, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    style={{
      padding: "0.5rem 1rem",
      fontSize: "1.25rem",
      border: "1px solid #ddd",
      borderRadius: "4px",
      backgroundColor: disabled ? "#f3f4f6" : "white",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
    }}
  >
    {children}
  </button>
);

const DefaultTimestamp: React.FC<{
  readonly date: Temporal.Instant | null;
}> = ({ date }) =>
  date ? (
    <small style={{ color: "#666", fontSize: "0.875rem" }}>
      Last updated: {date.toLocaleString(undefined, { timeStyle: "medium" })}
    </small>
  ) : null;

// Counter component props with slots
type CounterProps = PropsWithSlots<
  {
    readonly store?: CounterStore;
    readonly min?: number;
    readonly max?: number;
    readonly step?: number;
    readonly className?: string;
  },
  ["display", "incrementButton", "decrementButton", "resetButton", "timestamp"]
>;

/**
 * A Counter component that uses an external store via useSyncExternalStore.
 * All slots are customizable, and multiple Counter instances can share the same store.
 */
export const Counter: React.FC<CounterProps> = (props) => {
  const {
    store = sharedCounterStore,
    min = -Infinity,
    max = Infinity,
    step = 1,
    className,
  } = props;

  // Use the external store
  // increment and decrement are available but we use set with step for flexibility
  const { count, lastUpdated, reset, set } = useCounterStore(store);

  // Create slot render functions
  const renderDisplay = useSlot("display", props, {
    slot: DefaultDisplay,
  });

  const renderIncrementButton = useSlot("incrementButton", props, {
    slot: DefaultButton,
  });

  const renderDecrementButton = useSlot("decrementButton", props, {
    slot: DefaultButton,
  });

  const renderResetButton = useSlot("resetButton", props, {
    slot: DefaultButton,
  });

  const renderTimestamp = useSlot("timestamp", props, {
    slot: DefaultTimestamp,
  });

  const canIncrement = count + step <= max;
  const canDecrement = count - step >= min;

  const handleIncrement = useCallback(() => {
    if (canIncrement) {
      set(count + step);
    }
  }, [canIncrement, count, step, set]);

  const handleDecrement = useCallback(() => {
    if (canDecrement) {
      set(count - step);
    }
  }, [canDecrement, count, step, set]);

  return (
    <div
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1rem",
        padding: "2rem",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        backgroundColor: "#fafafa",
      }}
    >
      <div className="counter-display">{renderDisplay({ count, className: "counter-value" })}</div>

      <div className="counter-controls" style={{ display: "flex", gap: "0.5rem" }}>
        {renderDecrementButton({
          onClick: handleDecrement,
          disabled: !canDecrement,
          children: `−${step}`,
          variant: "decrement",
        })}

        {renderResetButton({
          onClick: reset,
          children: "Reset",
          variant: "reset",
        })}

        {renderIncrementButton({
          onClick: handleIncrement,
          disabled: !canIncrement,
          children: `+${step}`,
          variant: "increment",
        })}
      </div>

      <div className="counter-meta">{renderTimestamp({ date: lastUpdated })}</div>
    </div>
  );
};

// ==============================================
// Custom Slot Implementations
// ==============================================

// Animated display that scales based on count
const AnimatedDisplay: React.FC<{
  readonly count: number;
  readonly className?: string;
}> = ({ count, className }) => (
  <span
    className={className}
    style={{
      fontSize: "4rem",
      fontWeight: "bold",
      fontFamily: "monospace",
      color: count > 0 ? "#16a34a" : count < 0 ? "#dc2626" : "#374151",
      transform: `scale(${1 + Math.min(Math.abs(count) * 0.02, 0.5)})`,
      transition: "all 0.2s ease-out",
      display: "inline-block",
    }}
  >
    {count}
  </span>
);

// Gradient button with variants
const GradientButton: React.FC<{
  readonly onClick: () => void;
  readonly children: React.ReactNode;
  readonly disabled?: boolean;
  readonly variant?: "increment" | "decrement" | "reset";
}> = ({ onClick, children, disabled, variant = "reset" }) => {
  const gradients: Record<string, string> = {
    increment: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
    decrement: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
    reset: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "0.75rem 1.5rem",
        fontSize: "1rem",
        fontWeight: 600,
        border: "none",
        borderRadius: "8px",
        background: disabled ? "#d1d5db" : gradients[variant],
        color: "white",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        boxShadow: disabled ? "none" : "0 2px 4px rgba(0,0,0,0.1)",
        transition: "all 0.2s",
      }}
    >
      {children}
    </button>
  );
};

// Enhanced timestamp with relative time
const EnhancedTimestamp: React.FC<{
  readonly date: Temporal.Instant | null;
}> = ({ date }) => {
  const [now, setNow] = useState(() => Temporal.Now.instant());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setNow(Temporal.Now.instant());
    }, 1000);
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  if (!date) return null;

  const diffMs = now.epochMilliseconds - date.epochMilliseconds;
  const diffSec = Math.floor(diffMs / 1000);

  let relativeTime: string;
  if (diffSec < 5) {
    relativeTime = "just now";
  } else if (diffSec < 60) {
    relativeTime = `${diffSec} seconds ago`;
  } else {
    relativeTime = date.toLocaleString(undefined, { timeStyle: "medium" });
  }

  return (
    <div
      style={{
        padding: "0.5rem 1rem",
        backgroundColor: "#f3f4f6",
        borderRadius: "999px",
        fontSize: "0.875rem",
        color: "#4b5563",
      }}
    >
      ⏱️ {relativeTime}
    </div>
  );
};

// ==============================================
// Usage Examples
// ==============================================

/**
 * Example demonstrating Counter with useSyncExternalStore.
 * Multiple counters share the same external store!
 */
export function CounterWithExternalStoreExample(): React.JSX.Element {
  // Create a separate store for the second group
  const separateStore = createCounterStore(100);

  return (
    <div style={{ padding: "2rem" }}>
      <h2 style={{ marginBottom: "1rem" }}>Counter with useSyncExternalStore</h2>

      <div style={{ marginBottom: "2rem" }}>
        <h3 style={{ marginBottom: "1rem", color: "#374151" }}>
          Shared Store (changes sync between counters)
        </h3>
        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
          {/* Default counter */}
          <div>
            <p style={{ marginBottom: "0.5rem", fontWeight: 500 }}>Default Style</p>
            <Counter min={0} max={100} />
          </div>

          {/* Styled counter - shares the same store! */}
          <div>
            <p style={{ marginBottom: "0.5rem", fontWeight: 500 }}>Custom Style (Same Store!)</p>
            <Counter
              min={0}
              max={100}
              step={5}
              slots={{
                display: AnimatedDisplay,
                incrementButton: GradientButton,
                decrementButton: GradientButton,
                resetButton: GradientButton,
                timestamp: EnhancedTimestamp,
              }}
            />
          </div>
        </div>
      </div>

      <div>
        <h3 style={{ marginBottom: "1rem", color: "#374151" }}>
          Separate Store (independent counter)
        </h3>
        <Counter
          store={separateStore}
          min={0}
          max={200}
          step={10}
          slots={{
            display: AnimatedDisplay,
            incrementButton: GradientButton,
            decrementButton: GradientButton,
            resetButton: GradientButton,
            timestamp: EnhancedTimestamp,
          }}
          slotProps={{
            display: { className: "separate-counter-display" },
          }}
        />
      </div>

      <div
        style={{
          marginTop: "2rem",
          padding: "1rem",
          backgroundColor: "#f0f9ff",
          borderRadius: "8px",
        }}
      >
        <h4 style={{ marginBottom: "0.5rem" }}>How it works:</h4>
        <ul style={{ margin: 0, paddingLeft: "1.5rem", color: "#374151" }}>
          <li>The first two counters share the same external store</li>
          <li>Clicking buttons on one counter updates both displays</li>
          <li>The third counter uses a separate store (starts at 100)</li>
          <li>useSyncExternalStore ensures React re-renders when store changes</li>
          <li>All slots are customizable per counter instance</li>
        </ul>
      </div>
    </div>
  );
}
