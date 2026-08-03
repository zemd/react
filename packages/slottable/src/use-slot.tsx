import { useCallback, useMemo, type ComponentProps, type ElementType, type ReactNode } from "react";
import type { Prettify } from "./types";

type SlotOptions<ArgSlotType extends ElementType> = {
  readonly slot?: ArgSlotType;
};

type SlotsProps<ArgSlotsMap extends Record<string, ElementType>> = {
  readonly slots?: ArgSlotsMap;
};

type SlotPropsProps<ArgSlotPropsMap extends Record<string, unknown>> = {
  readonly slotProps?: Partial<ArgSlotPropsMap>;
};

export type SlotRenderFunction<ArgSlotType extends ElementType> = (
  slotProps: ComponentProps<ArgSlotType>,
) => ReactNode;

/**
 * A hook that returns a render function for a given slot.
 *
 * This design is React Compiler compatible - instead of returning a component
 * (which would be created during render), it returns a render function that
 * resolves the slot and merges props correctly.
 *
 * @example
 * ```tsx
 * const renderStartDecorator = useSlot("startDecorator", props, {
 *   slot: DefaultDecorator,
 * });
 * return (
 *   <button>
 *     {renderStartDecorator({ className: "custom" })}
 *     {props.children}
 *   </button>
 * );
 * ```
 */
export function useSlot<
  ArgSlotType extends ElementType,
  ArgExtraProps extends Partial<ComponentProps<ArgSlotType>>,
  ArgSlotOptions extends SlotOptions<ArgSlotType> & ArgExtraProps,
  ReturnComponent extends (ArgSlotOptions extends SlotOptions<infer T> ? T : ElementType),
  ArgSlotsKeys extends Record<string, ElementType>,
>(
  name: keyof ArgSlotsKeys,
  props: Prettify<SlotsProps<ArgSlotsKeys> & SlotPropsProps<Record<keyof ArgSlotsKeys, unknown>>>,
  options: ArgSlotOptions = {} as ArgSlotOptions,
): SlotRenderFunction<ReturnComponent> {
  // Development mode warnings
  if (process.env.NODE_ENV === "development") {
    if (typeof name !== "string" && typeof name !== "symbol") {
      console.warn("useSlot: slot name must be a string or symbol");
    }
  }

  const { slots, slotProps } = props;
  const { slot } = options;

  // Memoize the resolved slot component
  const Slot = useMemo(
    () => (slots?.[name] ?? slot ?? null) as ReturnComponent | null,
    [slots, name, slot],
  );

  // Memoize the resolved slot props
  const resolvedSlotProps = useMemo(() => slotProps?.[name], [slotProps, name]);

  // Memoize extra props to ensure stable reference
  // Using options as dependency since extraProps is derived from it
  const stableExtraProps = useMemo(() => {
    const { slot: _slot, ...rest } = options;
    return rest;
  }, [options]);

  // Memoize the render function for performance
  const renderSlot = useCallback(
    (componentProps: ComponentProps<ReturnComponent>): ReactNode => {
      // Return null if no slot is provided
      if (Slot === null) {
        return null;
      }

      const mergedProps = {
        ...componentProps,
        ...(resolvedSlotProps as object),
        ...stableExtraProps,
      } as ComponentProps<ReturnComponent>;

      return <Slot {...mergedProps} />;
    },
    [Slot, resolvedSlotProps, stableExtraProps],
  );

  return renderSlot;
}
