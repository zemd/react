/**
 * Slot Component Example
 *
 * Demonstrates the JSX-centric Slot component alternative to the useSlot hook.
 */
import type { PropsWithSlots } from "../types";
import { Slot } from "../slot";

// Define the Alert component props with slots
type AlertProps = PropsWithSlots<
  {
    readonly type: "info" | "success" | "warning" | "error";
    readonly title: string;
    readonly message: string;
    readonly onDismiss?: () => void;
  },
  ["icon", "title", "message", "dismissButton"]
>;

// Type colors mapping
const typeStyles: Record<
  "info" | "success" | "warning" | "error",
  { bg: string; border: string; text: string; icon: string }
> = {
  info: { bg: "#eff6ff", border: "#3b82f6", text: "#1e40af", icon: "ℹ️" },
  success: { bg: "#f0fdf4", border: "#22c55e", text: "#166534", icon: "✅" },
  warning: { bg: "#fffbeb", border: "#f59e0b", text: "#92400e", icon: "⚠️" },
  error: { bg: "#fef2f2", border: "#ef4444", text: "#991b1b", icon: "❌" },
};

/**
 * An Alert component using the JSX-centric Slot component.
 * This approach is more declarative and may be preferred by some developers.
 */
export const Alert: React.FC<AlertProps> = (props) => {
  const { type, title, message, onDismiss } = props;
  const styles = typeStyles[type];

  return (
    <div
      role="alert"
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "0.75rem",
        padding: "1rem",
        backgroundColor: styles.bg,
        border: `1px solid ${styles.border}`,
        borderRadius: "8px",
        color: styles.text,
      }}
    >
      {/* Using Slot component instead of useSlot hook */}
      <Slot name="icon" parentProps={props} default="span" style={{ fontSize: "1.25rem" }}>
        {styles.icon}
      </Slot>

      <div style={{ flex: 1 }}>
        <Slot
          name="title"
          parentProps={props}
          default="div"
          style={{ fontWeight: 600, marginBottom: "0.25rem" }}
        >
          {title}
        </Slot>

        <Slot name="message" parentProps={props} default="div" style={{ fontSize: "0.875rem" }}>
          {message}
        </Slot>
      </div>

      {onDismiss ? (
        <Slot
          name="dismissButton"
          parentProps={props}
          default="button"
          onClick={onDismiss}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "1.25rem",
            padding: 0,
            color: "inherit",
            opacity: 0.7,
          }}
        >
          ×
        </Slot>
      ) : null}
    </div>
  );
};

// ==============================================
// Usage Examples
// ==============================================

// Custom icon component
const AnimatedIcon: React.FC<{
  readonly children?: React.ReactNode;
}> = ({ children }) => (
  <span
    style={{
      display: "inline-block",
      fontSize: "1.5rem",
      animation: "pulse 2s infinite",
    }}
  >
    {children}
  </span>
);

// Custom dismiss button
const RoundDismissButton: React.FC<{
  readonly onClick?: () => void;
  readonly children?: React.ReactNode;
}> = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      width: "24px",
      height: "24px",
      borderRadius: "50%",
      border: "1px solid currentColor",
      background: "none",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "0.875rem",
      color: "inherit",
    }}
  >
    ×
  </button>
);

/**
 * Example usage of the Alert component with the Slot component pattern.
 */
export function SlotComponentExample(): React.JSX.Element {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        padding: "2rem",
        maxWidth: "600px",
      }}
    >
      <h2 style={{ marginBottom: "1rem" }}>Slot Component Example</h2>

      {/* Default alerts */}
      <Alert
        type="info"
        title="Information"
        message="This is an informational alert using the Slot component pattern."
      />

      <Alert
        type="success"
        title="Success!"
        message="Your action was completed successfully."
        onDismiss={() => {
          console.log("Dismissed");
        }}
      />

      <Alert
        type="warning"
        title="Warning"
        message="Please review your input before continuing."
        onDismiss={() => {
          console.log("Dismissed");
        }}
      />

      <Alert
        type="error"
        title="Error"
        message="Something went wrong. Please try again."
        onDismiss={() => {
          console.log("Dismissed");
        }}
      />

      {/* Alert with custom slots */}
      <h3 style={{ marginTop: "1rem" }}>With Custom Slots</h3>
      <Alert
        type="success"
        title="Custom Styled Alert"
        message="This alert uses custom icon and dismiss button components."
        onDismiss={() => {
          console.log("Custom dismiss");
        }}
        slots={{
          icon: AnimatedIcon,
          dismissButton: RoundDismissButton,
        }}
        slotProps={{
          title: { style: { fontSize: "1.25rem", color: "#166534" } },
        }}
      />

      <div
        style={{
          marginTop: "1rem",
          padding: "1rem",
          backgroundColor: "#f8fafc",
          borderRadius: "8px",
        }}
      >
        <h4 style={{ marginBottom: "0.5rem" }}>Slot Component vs useSlot Hook</h4>
        <p style={{ fontSize: "0.875rem", color: "#64748b", margin: 0 }}>
          The <code>&lt;Slot&gt;</code> component provides a more declarative, JSX-centric API.
          It&apos;s built on top of the <code>useSlot</code> hook and offers the same functionality
          with a different syntax that some developers may find more intuitive.
        </p>
      </div>
    </div>
  );
}
