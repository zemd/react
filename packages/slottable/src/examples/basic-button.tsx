import type { PropsWithSlots } from "../types";
import { useSlot } from "../use-slot";

const DefaultDecorator: React.FC<{ readonly className?: string }> = ({ className }) => {
  return <div className={className}>Default decorator</div>;
};

type ButtonProps = PropsWithSlots<
  React.PropsWithChildren<{
    // here you define your regular component props
    readonly fullWidth?: boolean;
    readonly disabled?: boolean;
    readonly size?: "sm" | "md" | "xl";
    readonly variant?: "solid" | "outlined";
    readonly color?: "primary" | "secondary";
    readonly className?: string;
  }>,
  ["startDecorator", "endDecorator"] // here you define your slots
>;

export const Button: React.FC<ButtonProps> = (props) => {
  // useSlot now returns a render function instead of a component
  // This is React Compiler compatible - no component creation during render
  const renderStartDecorator = useSlot("startDecorator", props, {
    slot: DefaultDecorator, // provide default decorator, but can be overridden by user
  });
  const renderEndDecorator = useSlot("endDecorator", props);

  return (
    <button className={props.className}>
      {renderStartDecorator({ className: "class-override" })}
      {/* ^^^ you can provide default className ^^^ */}
      {props.children}
      {renderEndDecorator({})}
    </button>
  );
};

const MyCustomLabelComponent: React.FC = () => {
  return <span>My custom label</span>;
};

export function HomePage(): React.JSX.Element {
  return (
    <div>
      <Button
        slots={{
          endDecorator: MyCustomLabelComponent,
        }}
        slotProps={{
          startDecorator: {
            // prop1: "value"
          },
          endDecorator: {
            // prop2: "value"
          },
        }}
        className="my-custom-button-className"
      >
        Click me!
      </Button>
    </div>
  );
}
