import { describe, test, expect, vi, afterEach } from "vitest";
import { render, renderHook, screen, act } from "@testing-library/react";
import { createModal } from "./createModal";
import { createStore, store as defaultStore } from "./store";
import { ModalRoot } from "./ModalRoot";
import { useModalContext } from "./ModalEntryContext";
import { useModals } from "./useModals";

type AlertProps = {
  title: string;
};

const Alert: React.FC<AlertProps> = ({ title }) => {
  const { close } = useModalContext();
  return (
    <div data-testid="alert">
      <span>{title}</span>
      <button type="button" onClick={close}>
        close
      </button>
    </div>
  );
};

describe("createModal", () => {
  test("open appends to the store and returns the new id", () => {
    const store = createStore();
    const modal = createModal<AlertProps>({ component: Alert, store });

    const id = modal.open({ title: "hi" });

    expect(store.getSnapshot().map((entry) => entry.id)).toEqual([id]);
  });

  test("passes typed props to onOpen and onClose", () => {
    const store = createStore();
    const onOpen = vi.fn<(props: AlertProps) => void>();
    const onClose = vi.fn<(props: AlertProps) => void>();
    const modal = createModal<AlertProps>({ component: Alert, store, onOpen, onClose });

    modal.close(modal.open({ title: "hi" }));

    expect(onOpen).toHaveBeenCalledWith({ title: "hi" });
    expect(onClose).toHaveBeenCalledWith({ title: "hi" });
  });

  test("bare close removes the most recently opened instance", () => {
    const store = createStore();
    const modal = createModal<AlertProps>({ component: Alert, store });
    const firstId = modal.open({ title: "first" });
    modal.open({ title: "second" });

    modal.close();

    expect(store.getSnapshot().map((entry) => entry.id)).toEqual([firstId]);
  });

  test("warns instead of silently doing nothing when closed twice", () => {
    const store = createStore();
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const modal = createModal<AlertProps>({ component: Alert, store });
    modal.open({ title: "hi" });

    modal.close();
    modal.close();

    expect(consoleWarn).toHaveBeenCalledWith("No modal is currently open.");
    consoleWarn.mockRestore();
  });

  test("close by id forgets that id as the last opened instance", () => {
    const store = createStore();
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const modal = createModal<AlertProps>({ component: Alert, store });

    modal.close(modal.open({ title: "hi" }));
    modal.close();

    expect(consoleWarn).toHaveBeenCalledWith("No modal is currently open.");
    consoleWarn.mockRestore();
  });

  test("controllers without props expose a zero-argument open", () => {
    const store = createStore();
    const modal = createModal({ component: () => null, store });

    const id = modal.open();

    expect(store.getSnapshot()[0]?.id).toBe(id);
  });

  test("renders a lazily imported component", async () => {
    const store = createStore();
    const modal = createModal<AlertProps>({
      lazy: () => Promise.resolve({ default: Alert }),
      store,
    });
    render(<ModalRoot store={store} container={document.body} />);

    act(() => {
      modal.open({ title: "lazy" });
    });

    expect(await screen.findByTestId("alert")).toHaveTextContent("lazy");
  });
});

describe("ModalRoot", () => {
  test("renders nothing while the stack is empty", () => {
    const store = createStore();
    const { container } = render(<ModalRoot store={store} container={document.body} />);

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByTestId("alert")).toBeNull();
  });

  test("renders opened modals and closes them through the entry context", async () => {
    const store = createStore();
    const modal = createModal<AlertProps>({ component: Alert, store });
    render(<ModalRoot store={store} container={document.body} />);

    act(() => {
      modal.open({ title: "hello" });
    });
    expect(screen.getByTestId("alert")).toHaveTextContent("hello");

    act(() => {
      screen.getByRole("button", { name: "close" }).click();
    });
    expect(screen.queryByTestId("alert")).toBeNull();
    expect(store.getSnapshot()).toEqual([]);
  });

  test("renders into a custom container resolved from a function", () => {
    const store = createStore();
    const mount = document.createElement("section");
    mount.id = "Modals";
    document.body.append(mount);
    const modal = createModal<AlertProps>({ component: Alert, store });

    render(<ModalRoot store={store} container={() => mount} />);
    act(() => {
      modal.open({ title: "hello" });
    });

    expect(mount.querySelector("[data-testid='alert']")).not.toBeNull();
    mount.remove();
  });
});

describe("useModalContext", () => {
  test("throws when used outside a modal entry", () => {
    const Orphan: React.FC = () => {
      useModalContext();
      return null;
    };
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => render(<Orphan />)).toThrow(/must be used within a ModalEntryProvider/);

    consoleError.mockRestore();
  });
});

describe("useModals", () => {
  afterEach(() => {
    defaultStore.removeAll();
  });

  test("reads from the shared store when called without options", () => {
    const { result } = renderHook(() => useModals());
    expect(result.current).toEqual([]);

    act(() => {
      defaultStore.append({ component: () => null, props: {}, callbacks: {} });
    });

    expect(result.current).toHaveLength(1);
  });

  test("reads from an explicit store", () => {
    const store = createStore();
    const { result } = renderHook(() => useModals({ store }));

    act(() => {
      store.append({ component: () => null, props: {}, callbacks: {} });
    });

    expect(result.current).toHaveLength(1);
    expect(defaultStore.getSnapshot()).toEqual([]);
  });
});
