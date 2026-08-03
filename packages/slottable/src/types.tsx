import type { ComponentProps, ElementType } from "react";

export type Prettify<ArgType> = {
  [K in keyof ArgType]: ArgType[K];
} & {};

/**
 * A helper type that allows to define proper slot props using a simple array of slot names.
 *
 * Usage:
 * ```ts
 * type ButtonProps = PropsWithSlots<
 *   React.PropsWithChildren<{ name: string }>,
 *   ["startDecorator", "endDecorator"]
 * >;
 * const Button: React.FC<ButtonProps> = (props) => {
 *   const renderStartDecorator = useSlot("startDecorator", props);
 *   const renderEndDecorator = useSlot("endDecorator", props);
 *
 *   return (
 *     <button>
 *       {renderStartDecorator({})}
 *       {props.children}
 *       {renderEndDecorator({})}
 *     </button>
 *   );
 * };
 * ```
 */
export type PropsWithSlots<ArgProps = {}, ArgSlots extends string[] = []> = ArgProps &
  (ArgSlots["length"] extends 0
    ? {}
    : {
        slots?: {
          [K in ArgSlots[number]]?: ElementType;
        };
        slotProps?: {
          [K in ArgSlots[number]]?: ComponentProps<ElementType>;
        };
      });

/**
 * A helper type that allows to define proper slot props with typed slot components.
 * This provides better TypeScript inference for slot-specific props.
 *
 * Usage:
 * ```ts
 * type ButtonSlots = {
 *   startDecorator: React.FC<{ icon?: string; className?: string }>;
 *   endDecorator: React.FC<{ label?: string }>;
 * };
 *
 * type ButtonProps = PropsWithTypedSlots<
 *   React.PropsWithChildren<{ name: string }>,
 *   ButtonSlots
 * >;
 *
 * // Now slotProps will have proper type inference:
 * // slotProps.startDecorator will accept { icon?: string; className?: string }
 * // slotProps.endDecorator will accept { label?: string }
 * ```
 */
export type PropsWithTypedSlots<
  ArgProps = {},
  ArgSlots extends Record<string, ElementType> = Record<string, ElementType>,
> = ArgProps & {
  slots?: Partial<ArgSlots>;
  slotProps?: {
    [K in keyof ArgSlots]?: ComponentProps<ArgSlots[K]>;
  };
};
