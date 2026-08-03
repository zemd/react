import * as fc from "fast-check";
import { describe, expect, test, vi } from "vitest";
import { createStore } from "./store";
import type { UUID } from "./types";

const Noop = () => null;
const UNKNOWN_ID = "00000000-0000-0000-0000-000000000000" as UUID;

type FuzzProps = {
  count: number;
  enabled: boolean;
  label: string;
};

type Operation =
  | {
      type: "append";
      props: FuzzProps;
      throwOnClose: boolean;
      throwOnOpen: boolean;
    }
  | { type: "remove"; target: number }
  | { type: "removeLatest" }
  | { type: "removeAll" };

type ModelEntry = {
  appendIndex: number;
  id: UUID;
  props: FuzzProps;
  throwOnClose: boolean;
};

type CallbackEvent = {
  appendIndex: number;
  props: Record<string, unknown>;
};

const propsArbitrary: fc.Arbitrary<FuzzProps> = fc.record({
  count: fc.integer(),
  enabled: fc.boolean(),
  label: fc.string(),
});

const operationArbitrary: fc.Arbitrary<Operation> = fc.oneof(
  fc.record({
    type: fc.constant<"append">("append"),
    props: propsArbitrary,
    throwOnClose: fc.boolean(),
    throwOnOpen: fc.boolean(),
  }),
  fc.record({
    type: fc.constant<"remove">("remove"),
    target: fc.nat({ max: 59 }),
  }),
  fc.record({ type: fc.constant<"removeLatest">("removeLatest") }),
  fc.record({ type: fc.constant<"removeAll">("removeAll") }),
);

describe("createStore fuzzing", () => {
  test("matches a stack model across arbitrary operation sequences", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    try {
      fc.assert(
        fc.property(
          fc.array(operationArbitrary, { minLength: 1, maxLength: 60 }),
          fc.nat({ max: 60 }),
          (operations, unsubscribeAt) => {
            consoleError.mockClear();

            const store = createStore();
            const serverSnapshot = store.getServerSnapshot();
            const model: ModelEntry[] = [];
            const idsByAppendIndex = new Map<number, UUID>();
            const opened: CallbackEvent[] = [];
            const closed: CallbackEvent[] = [];
            const expectedOpened: CallbackEvent[] = [];
            const expectedClosed: CallbackEvent[] = [];
            let expectedErrors = 0;
            let expectedNotifications = 0;
            let notifications = 0;
            let subscribed = true;
            const unsubscribe = store.subscribe(() => {
              notifications += 1;
            });

            operations.forEach((operation, operationIndex) => {
              if (operationIndex === unsubscribeAt) {
                unsubscribe();
                subscribed = false;
              }

              const previousSnapshot = store.getSnapshot();
              let emitted = false;

              switch (operation.type) {
                case "append": {
                  const id = store.append({
                    component: Noop,
                    props: operation.props,
                    callbacks: {
                      onOpen: (props) => {
                        opened.push({ appendIndex: operationIndex, props });
                        if (operation.throwOnOpen) {
                          throw new Error("fuzzed onOpen failure");
                        }
                      },
                      onClose: (props) => {
                        closed.push({ appendIndex: operationIndex, props });
                        if (operation.throwOnClose) {
                          throw new Error("fuzzed onClose failure");
                        }
                      },
                    },
                  });

                  idsByAppendIndex.set(operationIndex, id);
                  model.push({
                    appendIndex: operationIndex,
                    id,
                    props: operation.props,
                    throwOnClose: operation.throwOnClose,
                  });
                  expectedOpened.push({ appendIndex: operationIndex, props: operation.props });
                  expectedErrors += Number(operation.throwOnOpen);
                  emitted = true;
                  break;
                }
                case "remove": {
                  const id = idsByAppendIndex.get(operation.target) ?? UNKNOWN_ID;
                  const modelIndex = model.findIndex((entry) => {
                    return entry.appendIndex === operation.target;
                  });

                  store.remove(id);
                  if (modelIndex !== -1) {
                    const [removed] = model.splice(modelIndex, 1);
                    expectedClosed.push({
                      appendIndex: removed!.appendIndex,
                      props: removed!.props,
                    });
                    expectedErrors += Number(removed!.throwOnClose);
                    emitted = true;
                  }
                  break;
                }
                case "removeLatest": {
                  store.removeLatest();
                  const removed = model.pop();
                  if (removed) {
                    expectedClosed.push({
                      appendIndex: removed.appendIndex,
                      props: removed.props,
                    });
                    expectedErrors += Number(removed.throwOnClose);
                    emitted = true;
                  }
                  break;
                }
                case "removeAll": {
                  store.removeAll();
                  if (model.length > 0) {
                    for (const removed of model) {
                      expectedClosed.push({
                        appendIndex: removed.appendIndex,
                        props: removed.props,
                      });
                      expectedErrors += Number(removed.throwOnClose);
                    }
                    model.splice(0);
                    emitted = true;
                  }
                  break;
                }
              }

              if (emitted && subscribed) {
                expectedNotifications += 1;
              }

              const snapshot = store.getSnapshot();
              expect(
                snapshot.map(({ id, props }) => {
                  return { id, props };
                }),
              ).toEqual(
                model.map(({ id, props }) => {
                  return { id, props };
                }),
              );
              expect(snapshot).toBe(store.getSnapshot());
              expect(Object.isFrozen(snapshot)).toBe(true);
              expect(snapshot === previousSnapshot).toBe(!emitted);
              expect(store.getServerSnapshot()).toBe(serverSnapshot);
              expect(serverSnapshot).toEqual([]);
              expect(Object.isFrozen(serverSnapshot)).toBe(true);
              expect(opened).toEqual(expectedOpened);
              expect(closed).toEqual(expectedClosed);
              expect(notifications).toBe(expectedNotifications);
              expect(consoleError).toHaveBeenCalledTimes(expectedErrors);
            });

            unsubscribe();
          },
        ),
        { numRuns: 200 },
      );
    } finally {
      consoleError.mockRestore();
    }
  });

  test("enforces arbitrary valid stack capacities without partially appending", () => {
    const capacityCaseArbitrary = fc.integer({ min: 0, max: 50 }).chain((capacity) => {
      return fc.tuple(
        fc.constant(capacity),
        fc.array(propsArbitrary, { minLength: capacity + 1, maxLength: capacity + 1 }),
      );
    });

    fc.assert(
      fc.property(capacityCaseArbitrary, ([capacity, propsList]) => {
        const store = createStore({ maxStackSize: capacity });
        let notifications = 0;
        let rejectedOpenCalls = 0;
        store.subscribe(() => {
          notifications += 1;
        });

        for (const props of propsList.slice(0, capacity)) {
          store.append({ component: Noop, props, callbacks: {} });
        }

        const snapshotAtCapacity = store.getSnapshot();
        const overflowProps = propsList[capacity]!;
        expect(() => {
          store.append({
            component: Noop,
            props: overflowProps,
            callbacks: {
              onOpen: () => {
                rejectedOpenCalls += 1;
              },
            },
          });
        }).toThrow(`Maximum modal stack size (${capacity}) exceeded.`);

        expect(store.getSnapshot()).toBe(snapshotAtCapacity);
        expect(store.getSnapshot()).toHaveLength(capacity);
        expect(notifications).toBe(capacity);
        expect(rejectedOpenCalls).toBe(0);
      }),
      { numRuns: 100 },
    );
  });
});
