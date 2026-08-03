/**
 * Nested Slottable Components Example
 *
 * Demonstrates how to compose slottable components together,
 * using one slottable component as a slot for another.
 */
import { Slot } from "../slot";
import type { PropsWithSlots } from "../types";

// ==============================================
// IconButton - Inner slottable component
// ==============================================

type IconButtonProps = PropsWithSlots<
  {
    readonly icon: React.ReactNode;
    readonly label?: string;
    readonly onClick: () => void;
    readonly variant?: "default" | "primary" | "danger";
  },
  ["icon", "label"]
>;

const DefaultIcon: React.FC<{
  readonly children?: React.ReactNode;
  readonly className?: string;
}> = ({ children, className }) => (
  <span className={className} style={{ fontSize: "1.25rem" }}>
    {children}
  </span>
);

const DefaultLabel: React.FC<{
  readonly children?: React.ReactNode;
  readonly className?: string;
}> = ({ children, className }) => (
  <span className={className} style={{ marginLeft: "0.5rem" }}>
    {children}
  </span>
);

export const IconButton: React.FC<IconButtonProps> = (props) => {
  const { icon, label, onClick, variant = "default" } = props;

  const variantStyles: Record<string, React.CSSProperties> = {
    default: { backgroundColor: "#f3f4f6", color: "#374151" },
    primary: { backgroundColor: "#2563eb", color: "white" },
    danger: { backgroundColor: "#dc2626", color: "white" },
  };

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "0.5rem 1rem",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        fontSize: "1rem",
        ...variantStyles[variant],
      }}
    >
      <Slot name="icon" parentProps={props} default={DefaultIcon}>
        {icon}
      </Slot>
      {label ? (
        <Slot name="label" parentProps={props} default={DefaultLabel}>
          {label}
        </Slot>
      ) : null}
    </button>
  );
};

// ==============================================
// Toolbar - Outer slottable component
// ==============================================

type ToolbarAction = {
  readonly id: string;
  readonly icon: React.ReactNode;
  readonly label?: string;
  readonly onClick: () => void;
  readonly variant?: "default" | "primary" | "danger";
};

type ToolbarProps = PropsWithSlots<
  {
    readonly actions: ToolbarAction[];
    readonly title?: string;
    readonly className?: string;
  },
  ["button", "container", "title"]
>;

const DefaultContainer: React.FC<{
  readonly children?: React.ReactNode;
  readonly className?: string;
}> = ({ children, className }) => (
  <div
    className={className}
    style={{
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      padding: "0.75rem",
      backgroundColor: "#f9fafb",
      borderRadius: "8px",
      border: "1px solid #e5e7eb",
    }}
  >
    {children}
  </div>
);

const DefaultTitle: React.FC<{
  readonly children?: React.ReactNode;
}> = ({ children }) => <span style={{ fontWeight: 600, marginRight: "1rem" }}>{children}</span>;

/**
 * A Toolbar component that uses IconButton as its default button slot.
 * This demonstrates nested slottable components.
 */
export const Toolbar: React.FC<ToolbarProps> = (props) => {
  const { actions, title, className } = props;

  return (
    <Slot
      name="container"
      parentProps={props}
      default={DefaultContainer}
      {...(className && { className })}
    >
      {title ? (
        <Slot name="title" parentProps={props} default={DefaultTitle}>
          {title}
        </Slot>
      ) : null}
      {actions.map((action) => (
        <span key={action.id}>
          <Slot
            name="button"
            parentProps={props}
            default={IconButton}
            icon={action.icon}
            {...(action.label && { label: action.label })}
            onClick={action.onClick}
            {...(action.variant && { variant: action.variant })}
          />
        </span>
      ))}
    </Slot>
  );
};

// ==============================================
// Usage Examples
// ==============================================

// Custom animated button for toolbar
const AnimatedButton: React.FC<{
  readonly icon: React.ReactNode;
  readonly label?: string;
  readonly onClick: () => void;
  readonly variant?: "default" | "primary" | "danger";
}> = ({ icon, label, onClick, variant = "default" }) => {
  const variantColors: Record<string, string> = {
    default: "#6b7280",
    primary: "#2563eb",
    danger: "#dc2626",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.25rem",
        padding: "0.5rem",
        border: `2px solid ${variantColors[variant]}`,
        borderRadius: "50%",
        backgroundColor: "transparent",
        color: variantColors[variant],
        cursor: "pointer",
        transition: "all 0.2s",
      }}
      title={label}
    >
      {icon}
    </button>
  );
};

// Gradient container
const GradientContainer: React.FC<{
  readonly children?: React.ReactNode;
  readonly className?: string;
}> = ({ children, className }) => (
  <div
    className={className}
    style={{
      display: "flex",
      alignItems: "center",
      gap: "1rem",
      padding: "1rem 1.5rem",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      borderRadius: "12px",
      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    }}
  >
    {children}
  </div>
);

/**
 * Example usage of nested slottable components.
 */
export function NestedToolbarExample(): React.JSX.Element {
  const actions: ToolbarAction[] = [
    {
      id: "edit",
      icon: "✏️",
      label: "Edit",
      onClick: () => {
        console.log("Edit clicked");
      },
    },
    {
      id: "save",
      icon: "💾",
      label: "Save",
      onClick: () => {
        console.log("Save clicked");
      },
      variant: "primary",
    },
    {
      id: "delete",
      icon: "🗑️",
      label: "Delete",
      onClick: () => {
        console.log("Delete clicked");
      },
      variant: "danger",
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
        padding: "2rem",
      }}
    >
      <div>
        <h3 style={{ marginBottom: "0.5rem" }}>Default Toolbar (uses IconButton)</h3>
        <Toolbar actions={actions} title="File Actions" />
      </div>

      <div>
        <h3 style={{ marginBottom: "0.5rem" }}>Custom Button Slot</h3>
        <Toolbar
          actions={actions}
          title="File Actions"
          slots={{
            button: AnimatedButton,
          }}
        />
      </div>

      <div>
        <h3 style={{ marginBottom: "0.5rem" }}>Custom Container + Button</h3>
        <Toolbar
          actions={actions}
          slots={{
            button: AnimatedButton,
            container: GradientContainer,
          }}
          slotProps={{
            container: { className: "custom-toolbar" },
          }}
        />
      </div>

      <div>
        <h3 style={{ marginBottom: "0.5rem" }}>Standalone IconButton</h3>
        <IconButton
          icon="🚀"
          label="Launch"
          onClick={() => {
            console.log("Launch!");
          }}
          variant="primary"
        />
      </div>
    </div>
  );
}
