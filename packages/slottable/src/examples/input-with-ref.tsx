/**
 * Input with Ref Example
 *
 * Demonstrates how to use useSlot with React refs for form controls.
 */
import { useRef, useState } from "react";
import type { PropsWithSlots } from "../types";
import { useSlot } from "../use-slot";

// Define the Input component props with slots
type InputProps = PropsWithSlots<
  {
    readonly label: string;
    readonly value: string;
    readonly onChange: (value: string) => void;
    readonly placeholder?: string;
    readonly error?: string;
    readonly helperText?: string;
  },
  ["input", "label", "helperText", "errorText"]
>;

// Default input component
const DefaultInput: React.FC<{
  readonly ref?: React.Ref<HTMLInputElement>;
  readonly value?: string;
  readonly onChange?: React.ChangeEventHandler<HTMLInputElement>;
  readonly placeholder?: string;
  readonly className?: string;
  readonly "aria-invalid"?: boolean;
  readonly "aria-describedby"?: string;
}> = ({ ref, className, ...props }) => (
  <input
    ref={ref}
    className={className}
    style={{
      width: "100%",
      padding: "0.5rem",
      border: "1px solid #ddd",
      borderRadius: "4px",
      fontSize: "1rem",
    }}
    {...props}
  />
);

// Default label component
const DefaultLabel: React.FC<{
  readonly htmlFor?: string;
  readonly children?: React.ReactNode;
  readonly className?: string;
}> = ({ htmlFor, children, className }) => (
  <label
    htmlFor={htmlFor}
    className={className}
    style={{
      display: "block",
      marginBottom: "0.25rem",
      fontWeight: 500,
    }}
  >
    {children}
  </label>
);

// Default helper text component
const DefaultHelperText: React.FC<{
  readonly children?: React.ReactNode;
  readonly id?: string;
}> = ({ children, id }) => (
  <small id={id} style={{ color: "#666", fontSize: "0.875rem" }}>
    {children}
  </small>
);

// Default error text component
const DefaultErrorText: React.FC<{
  readonly children?: React.ReactNode;
  readonly id?: string;
}> = ({ children, id }) => (
  <small id={id} style={{ color: "#dc2626", fontSize: "0.875rem" }}>
    {children}
  </small>
);

/**
 * A customizable Input component with slots for all subcomponents.
 * Demonstrates ref forwarding in React 19.
 */
export const Input: React.FC<InputProps> = (props) => {
  const { label, value, onChange, placeholder, error, helperText } = props;

  // Create a ref that can be passed to the input slot
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = `input-${label.toLowerCase().replace(/\s+/g, "-")}`;
  const helperId = `${inputId}-helper`;
  const errorId = `${inputId}-error`;

  const renderLabel = useSlot("label", props, { slot: DefaultLabel });
  const renderInput = useSlot("input", props, { slot: DefaultInput });
  const renderHelperText = useSlot("helperText", props, {
    slot: DefaultHelperText,
  });
  const renderErrorText = useSlot("errorText", props, {
    slot: DefaultErrorText,
  });

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    onChange(e.target.value);
  };

  return (
    <div style={{ marginBottom: "1rem" }}>
      {renderLabel({ htmlFor: inputId, children: label })}

      {renderInput({
        ref: inputRef,
        value,
        onChange: handleChange,
        ...(placeholder && { placeholder }),
        ...(error && { className: "input-error" }),
        "aria-invalid": !!error,
        ...(error
          ? { "aria-describedby": errorId }
          : helperText
            ? { "aria-describedby": helperId }
            : {}),
      })}

      {error ? renderErrorText({ id: errorId, children: error }) : null}
      {!error && helperText ? renderHelperText({ id: helperId, children: helperText }) : null}
    </div>
  );
};

// ==============================================
// Usage Examples
// ==============================================

// Custom styled input
const StyledInput: React.FC<{
  readonly ref?: React.Ref<HTMLInputElement>;
  readonly value?: string;
  readonly onChange?: React.ChangeEventHandler<HTMLInputElement>;
  readonly placeholder?: string;
  readonly className?: string;
  readonly "aria-invalid"?: boolean;
  readonly "aria-describedby"?: string;
}> = ({ ref, className, ...props }) => (
  <input
    ref={ref}
    className={className}
    style={{
      width: "100%",
      padding: "0.75rem 1rem",
      border: "2px solid #2563eb",
      borderRadius: "8px",
      fontSize: "1rem",
      outline: "none",
      transition: "border-color 0.2s",
    }}
    {...props}
  />
);

// Custom animated label
const AnimatedLabel: React.FC<{
  readonly htmlFor?: string;
  readonly children?: React.ReactNode;
}> = ({ htmlFor, children }) => (
  <label
    htmlFor={htmlFor}
    style={{
      display: "block",
      marginBottom: "0.5rem",
      fontWeight: 600,
      color: "#2563eb",
      textTransform: "uppercase",
      fontSize: "0.75rem",
      letterSpacing: "0.05em",
    }}
  >
    {children}
  </label>
);

/**
 * Example usage of the Input component with refs and custom slots.
 */
export function InputWithRefExample(): React.JSX.Element {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const emailError = email && !email.includes("@") ? "Please enter a valid email" : undefined;

  return (
    <div style={{ maxWidth: "400px", margin: "2rem auto", padding: "1rem" }}>
      <h2>Input with Ref Example</h2>

      {/* Default input */}
      <Input
        label="Name"
        value={name}
        onChange={setName}
        placeholder="Enter your name"
        helperText="Your full name as it appears on your ID"
      />

      {/* Input with custom slots */}
      <Input
        label="Email"
        value={email}
        onChange={setEmail}
        placeholder="you@example.com"
        {...(emailError && { error: emailError })}
        slots={{
          input: StyledInput,
          label: AnimatedLabel,
        }}
        slotProps={{
          input: { className: "styled-input" },
        }}
      />

      <button
        type="button"
        onClick={() => {
          console.log("Form submitted:", { name, email });
        }}
        style={{
          marginTop: "1rem",
          backgroundColor: "#2563eb",
          color: "white",
          border: "none",
          padding: "0.75rem 1.5rem",
          borderRadius: "4px",
          cursor: "pointer",
          width: "100%",
        }}
      >
        Submit
      </button>
    </div>
  );
}
