import { describe, test, expect, vi } from "vitest";
import { createStore } from "./store";
import type { Entry, UUID } from "./types";

const Noop = () => null;

const entry = (props: Record<string, unknown> = {}): Omit<Entry, "id"> => {
  return { component: Noop, props, callbacks: {} };
};

describe("createStore", () => {
  test("starts empty and keeps the server snapshot empty", () => {
    const store = createStore();

    expect(store.getSnapshot()).toEqual([]);
    expect(store.getServerSnapshot()).toEqual([]);
  });

  test("appends entries and returns their id", () => {
    const store = createStore();

    const id = store.append(entry({ title: "hello" }));

    const snapshot = store.getSnapshot();
    expect(snapshot).toHaveLength(1);
    expect(snapshot[0]?.id).toBe(id);
    expect(snapshot[0]?.props).toEqual({ title: "hello" });
  });

  test("keeps snapshot identity stable between emits", () => {
    const store = createStore();
    store.append(entry());

    expect(store.getSnapshot()).toBe(store.getSnapshot());
  });

  test("notifies subscribers until they unsubscribe", () => {
    const store = createStore();
    const listener = vi.fn<() => void>();

    const unsubscribe = store.subscribe(listener);
    store.append(entry());
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    store.append(entry());
    expect(listener).toHaveBeenCalledTimes(1);
  });

  test("throws once the stack reaches maxStackSize", () => {
    const store = createStore({ maxStackSize: 2 });
    store.append(entry());
    store.append(entry());

    expect(() => store.append(entry())).toThrow(/Maximum modal stack size \(2\)/);
    expect(store.getSnapshot()).toHaveLength(2);
  });

  test("invokes onOpen with the entry props", () => {
    const store = createStore();
    const onOpen = vi.fn<(props: Record<string, unknown>) => void>();

    store.append({ component: Noop, props: { id: 7 }, callbacks: { onOpen } });

    expect(onOpen).toHaveBeenCalledWith({ id: 7 });
  });

  test("isolates the caller from a throwing lifecycle callback", () => {
    const store = createStore();
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const onOpen = vi.fn<() => void>(() => {
      throw new Error("boom");
    });

    expect(() => store.append({ component: Noop, props: {}, callbacks: { onOpen } })).not.toThrow();
    expect(store.getSnapshot()).toHaveLength(1);
    expect(consoleError).toHaveBeenCalled();

    consoleError.mockRestore();
  });

  test("removes an entry by id and fires onClose", () => {
    const store = createStore();
    const onClose = vi.fn<(props: Record<string, unknown>) => void>();
    const id = store.append({ component: Noop, props: { a: 1 }, callbacks: { onClose } });
    const keptId = store.append(entry());

    store.remove(id);

    expect(onClose).toHaveBeenCalledWith({ a: 1 });
    expect(store.getSnapshot().map((item) => item.id)).toEqual([keptId]);
  });

  test("ignores removal of an unknown id", () => {
    const store = createStore();
    store.append(entry());
    const listener = vi.fn<() => void>();
    store.subscribe(listener);

    store.remove("00000000-0000-0000-0000-000000000000" as UUID);

    expect(store.getSnapshot()).toHaveLength(1);
    expect(listener).not.toHaveBeenCalled();
  });

  test("removeLatest pops the top of the stack", () => {
    const store = createStore();
    const firstId = store.append(entry());
    store.append(entry());

    store.removeLatest();

    expect(store.getSnapshot().map((item) => item.id)).toEqual([firstId]);
  });

  test("removeLatest does not notify subscribers when the stack is empty", () => {
    const store = createStore();
    const listener = vi.fn<() => void>();
    store.subscribe(listener);

    store.removeLatest();

    expect(listener).not.toHaveBeenCalled();
  });

  test("removeAll clears the stack and fires every onClose once", () => {
    const store = createStore();
    const onClose = vi.fn<(props: Record<string, unknown>) => void>();
    store.append({ component: Noop, props: { a: 1 }, callbacks: { onClose } });
    store.append({ component: Noop, props: { a: 2 }, callbacks: { onClose } });
    const listener = vi.fn<() => void>();
    store.subscribe(listener);

    store.removeAll();

    expect(onClose).toHaveBeenCalledTimes(2);
    expect(store.getSnapshot()).toEqual([]);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  test("removeAll does not notify subscribers when the stack is empty", () => {
    const store = createStore();
    const listener = vi.fn<() => void>();
    store.subscribe(listener);

    store.removeAll();

    expect(listener).not.toHaveBeenCalled();
  });
});
