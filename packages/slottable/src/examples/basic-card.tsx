/**
 * Basic Card Example
 *
 * Demonstrates basic usage of useSlot with multiple slots for a Card component.
 */
import { useState } from "react";
import type { PropsWithSlots } from "../types";
import { useSlot } from "../use-slot";

// Define the Card component props with slots
type CardProps = PropsWithSlots<
  {
    readonly title: string;
    readonly children: React.ReactNode;
    readonly className?: string;
  },
  ["header", "footer", "action"]
>;

// Default components for slots
const DefaultHeader: React.FC<{
  readonly className?: string;
  readonly children?: React.ReactNode;
}> = ({ className, children }) => (
  <div className={className} style={{ fontWeight: "bold", fontSize: "1.25rem" }}>
    {children}
  </div>
);

const DefaultFooter: React.FC<{
  readonly className?: string;
  readonly children?: React.ReactNode;
}> = ({ className, children }) => (
  <div className={className} style={{ borderTop: "1px solid #eee", paddingTop: "0.5rem" }}>
    {children}
  </div>
);

/**
 * A Card component with customizable header, footer, and action slots.
 */
export const Card: React.FC<CardProps> = (props) => {
  const renderHeader = useSlot("header", props, { slot: DefaultHeader });
  const renderFooter = useSlot("footer", props, { slot: DefaultFooter });
  const renderAction = useSlot("action", props);

  return (
    <div
      className={props.className}
      style={{
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "1rem",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      {renderHeader({ className: "card-header", children: props.title })}

      <div className="card-body" style={{ padding: "1rem 0" }}>
        {props.children}
      </div>

      {renderFooter({ className: "card-footer" })}

      {renderAction({})}
    </div>
  );
};

// ==============================================
// Usage Examples
// ==============================================

// Custom header component
const CustomHeader: React.FC<{
  readonly children?: React.ReactNode;
  readonly className?: string;
}> = ({ children, className }) => (
  <h2 className={className} style={{ color: "#2563eb", margin: 0 }}>
    {children}
  </h2>
);

// Custom footer with timestamp
const TimestampFooter: React.FC = () => {
  const [now] = useState(() => new Date());
  return (
    <p style={{ color: "#666", fontSize: "0.875rem", margin: 0 }}>
      Last updated: {now.toLocaleDateString()}
    </p>
  );
};

// Custom action button
const ActionButton: React.FC = () => (
  <button
    type="button"
    style={{
      marginTop: "1rem",
      backgroundColor: "#2563eb",
      color: "white",
      border: "none",
      padding: "0.5rem 1rem",
      borderRadius: "4px",
      cursor: "pointer",
    }}
  >
    Learn More
  </button>
);

/**
 * Example usage of the Card component with custom slots.
 */
export function BasicCardExample(): React.JSX.Element {
  return (
    <div style={{ maxWidth: "400px", margin: "2rem auto" }}>
      {/* Card with default slots */}
      <Card title="Default Card" className="mb-4">
        This card uses all default slot components.
      </Card>

      {/* Card with custom slots */}
      <Card
        title="Custom Card"
        slots={{
          header: CustomHeader,
          footer: TimestampFooter,
          action: ActionButton,
        }}
        slotProps={{
          header: { className: "custom-header" },
        }}
      >
        This card uses custom slot components for header, footer, and action.
      </Card>
    </div>
  );
}
