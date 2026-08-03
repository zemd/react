import { render } from "@testing-library/react";
import * as fc from "fast-check";
import { describe, expect, test } from "vitest";
import { Slot } from "./slot";
import { useSlot } from "./use-slot";

const fuzzValue = fc.oneof(
  fc.string({ maxLength: 64 }),
  fc.integer(),
  fc.boolean(),
  fc.constant(null),
  fc.constant(undefined),
);

const fuzzPropName = fc.stringMatching(/^[a-z][a-z0-9]{0,8}$/).map((name) => `fuzz_${name}`);

const fuzzProps = fc.dictionary(fuzzPropName, fuzzValue, { maxKeys: 8 });

describe("slottable fuzz properties", () => {
  test("useSlot always applies the documented prop precedence", () => {
    fc.assert(
      fc.property(
        fuzzProps,
        fuzzProps,
        fuzzProps,
        fuzzValue,
        fuzzValue,
        fuzzValue,
        (
          componentProps,
          configuredProps,
          optionProps,
          componentCollision,
          configuredCollision,
          optionCollision,
        ) => {
          let receivedProps: Readonly<Record<string, unknown>> | undefined;
          let selectedSlotRendered = false;
          let fallbackSlotRendered = false;

          const SelectedSlot = (props: Readonly<Record<string, unknown>>) => {
            selectedSlotRendered = true;
            receivedProps = props;
            return null;
          };
          const FallbackSlot = () => {
            fallbackSlotRendered = true;
            return null;
          };
          const Harness = () => {
            const renderRoot = useSlot(
              "root",
              {
                slots: { root: SelectedSlot },
                slotProps: {
                  root: { ...configuredProps, collision: configuredCollision },
                },
              },
              {
                slot: FallbackSlot,
                ...optionProps,
                collision: optionCollision,
              },
            );

            return <>{renderRoot({ ...componentProps, collision: componentCollision })}</>;
          };

          const view = render(<Harness />);
          try {
            expect(selectedSlotRendered).toBe(true);
            expect(fallbackSlotRendered).toBe(false);
            expect(receivedProps).toStrictEqual({
              ...componentProps,
              ...configuredProps,
              ...optionProps,
              collision: optionCollision,
            });
            expect(receivedProps).not.toHaveProperty("slot");
          } finally {
            view.unmount();
          }
        },
      ),
    );
  });

  test("useSlot resolves arbitrary slot names without leaking adjacent slot props", () => {
    const slotEntries = fc.uniqueArray(
      fc.record({ name: fuzzPropName, configuredValue: fuzzValue }),
      {
        minLength: 1,
        maxLength: 8,
        selector: (entry) => entry.name,
      },
    );

    fc.assert(
      fc.property(slotEntries, fc.nat(), fuzzValue, (entries, index, componentValue) => {
        const selected = entries[index % entries.length]!;
        const renderedNames: string[] = [];
        let receivedProps: Readonly<Record<string, unknown>> | undefined;
        const slots: Record<string, (props: Readonly<Record<string, unknown>>) => null> = {};
        const slotProps: Record<string, Record<string, unknown>> = {};

        for (const entry of entries) {
          slots[entry.name] = (props) => {
            renderedNames.push(entry.name);
            receivedProps = props;
            return null;
          };
          slotProps[entry.name] = { selectedValue: entry.configuredValue };
        }

        const Harness = () => {
          const renderSelected = useSlot(selected.name, { slots, slotProps });
          return <>{renderSelected({ selectedValue: componentValue })}</>;
        };

        const view = render(<Harness />);
        try {
          expect(renderedNames).toEqual([selected.name]);
          expect(receivedProps).toStrictEqual({ selectedValue: selected.configuredValue });
        } finally {
          view.unmount();
        }
      }),
    );
  });

  test("Slot preserves resolution and prop precedence for defaults and overrides", () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        fuzzProps,
        fuzzProps,
        fuzzValue,
        fuzzValue,
        fc.string({ maxLength: 64 }),
        (
          useOverride,
          directProps,
          configuredProps,
          directCollision,
          configuredCollision,
          child,
        ) => {
          let renderedSlot: "default" | "override" | undefined;
          let receivedProps: Readonly<Record<string, unknown>> | undefined;

          const DefaultSlot = (props: Readonly<Record<string, unknown>>) => {
            renderedSlot = "default";
            receivedProps = props;
            return null;
          };
          const OverrideSlot = (props: Readonly<Record<string, unknown>>) => {
            renderedSlot = "override";
            receivedProps = props;
            return null;
          };
          const slots: Record<string, typeof OverrideSlot> = useOverride
            ? { root: OverrideSlot }
            : {};

          const view = render(
            <Slot
              name="root"
              parentProps={{
                slots,
                slotProps: {
                  root: { ...configuredProps, collision: configuredCollision },
                },
              }}
              default={DefaultSlot}
              {...directProps}
              collision={directCollision}
            >
              {child}
            </Slot>,
          );

          try {
            expect(renderedSlot).toBe(useOverride ? "override" : "default");
            expect(receivedProps).toStrictEqual({
              ...directProps,
              children: child,
              ...configuredProps,
              collision: configuredCollision,
            });
          } finally {
            view.unmount();
          }
        },
      ),
    );
  });
});
