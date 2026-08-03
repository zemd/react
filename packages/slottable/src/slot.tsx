import type { ComponentProps, ElementType, ReactNode } from "react";
import { useSlot } from "./use-slot";
import type { Prettify } from "./types";

type SlotComponentProps<
  ArgSlotName extends string,
  ArgSlotType extends ElementType,
  ArgSlotsMap extends Record<string, ElementType>,
> = {
  /**
   * The name of the slot to render
   */
  readonly name: ArgSlotName;
  /**
   * The parent component props containing `slots` and `slotProps`
   */
  readonly parentProps: Prettify<{
    readonly slots?: ArgSlotsMap;
    readonly slotProps?: Partial<Record<keyof ArgSlotsMap, unknown>>;
  }>;
  /**
   * Default component to render if no slot is provided
   */
  readonly default?: ArgSlotType;
  /**
   * Children to render inside the slot (passed as children prop)
   */
  readonly children?: ReactNode;
} & Omit<ComponentProps<ArgSlotType>, "children">;

/**
 * A JSX-centric component alternative to the useSlot hook.
 *
 * @example
 * ```tsx
 * const Card: React.FC<CardProps> = (props) => {
 *   return (
 *     <div className="card">
 *       <Slot
 *         name="header"
 *         parentProps={props}
 *         default="div"
 *         className="card-header"
 *       >
 *         {props.title}
 *       </Slot>
 *       <div className="card-body">{props.children}</div>
 *       <Slot name="footer" parentProps={props} default="div" />
 *     </div>
 *   );
 * };
 * ```
 */
export function Slot<
  ArgSlotName extends string,
  ArgSlotType extends ElementType,
  ArgSlotsMap extends Record<string, ElementType>,
>({
  name,
  parentProps,
  default: defaultSlot = "div" as ArgSlotType,
  children,
  ...slotProps
}: SlotComponentProps<ArgSlotName, ArgSlotType, ArgSlotsMap>): ReactNode {
  const options = { slot: defaultSlot };
  const renderSlot = useSlot(name, parentProps, options);

  return renderSlot({
    ...slotProps,
    children,
  } as ComponentProps<ArgSlotType>);
}
