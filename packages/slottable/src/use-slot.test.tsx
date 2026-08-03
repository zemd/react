import { render, renderHook } from "@testing-library/react";
import { useSlot } from "./use-slot";
import { describe, test, expect } from "vitest";

describe("useSlot", () => {
  test("should return a render function", () => {
    const { result } = renderHook(() =>
      useSlot("root", {
        slots: {
          root: "div",
        },
      }),
    );

    expect(typeof result.current).toBe("function");
  });

  test("should return null when no slot is provided and render content with default slot", () => {
    const { result } = renderHook(() => useSlot("root", {}));
    const { container } = render(<>{result.current({ children: "Test Content" })}</>);

    // With no slot provided, renderSlot returns null
    expect(container.innerHTML).toBe("");
  });

  test("should use provided slot component", () => {
    const CustomDiv = (props: Readonly<React.HTMLProps<HTMLDivElement>>) => (
      <div data-testid="custom-div" {...props} />
    );

    const { result } = renderHook(() =>
      useSlot("root", {
        slots: {
          root: CustomDiv,
        },
      }),
    );

    const { container } = render(<>{result.current({ children: "Test Content" })}</>);

    expect(container.querySelector("[data-testid='custom-div']")).toBeTruthy();
  });

  test("should merge slot props correctly", () => {
    const { result } = renderHook(() =>
      useSlot("root", {
        slots: {
          root: "div",
        },
        slotProps: {
          root: {
            className: "extra-class",
            "data-testid": "test-div",
          },
        },
      }),
    );

    const { container } = render(
      <>
        {result.current({
          className: "default-class",
          children: "Test Content",
        })}
      </>,
    );

    const element = container.firstChild as HTMLElement;
    expect(element).toHaveClass("extra-class");
    expect(element).toHaveAttribute("data-testid", "test-div");
  });

  test("should use slot from options if slots prop is not provided", () => {
    const CustomDiv = (props: Readonly<React.HTMLProps<HTMLDivElement>>) => (
      <div data-testid="option-div" {...props} />
    );

    const { result } = renderHook(() =>
      useSlot(
        "root",
        {},
        {
          slot: CustomDiv,
        },
      ),
    );

    const { container } = render(<>{result.current({ children: "Test Content" })}</>);

    expect(container.querySelector("[data-testid='option-div']")).toBeTruthy();
  });

  test("should merge extraProps from third argument", () => {
    const CustomDiv = (props: Readonly<React.HTMLProps<HTMLDivElement>>) => (
      <div data-testid="extra-props-div" id="initial-id" {...props} />
    );

    const props = { slotProps: { root: { id: "props-id" } } };

    const { result } = renderHook(() =>
      useSlot("root", props, {
        slot: CustomDiv,
        id: "custom-id",
        "aria-label": "custom-label",
      }),
    );

    const { container } = render(
      <>{result.current({ id: "default-id", children: "Test Content" })}</>,
    );
    const element = container.querySelector("[data-testid='extra-props-div']") as HTMLElement;

    expect(element).toHaveAttribute("id", "custom-id");
    expect(element).toHaveAttribute("aria-label", "custom-label");
    expect(element).toHaveTextContent("Test Content");
  });

  test("should return null when no slot is provided", () => {
    const { result } = renderHook(() => useSlot("root", {}));
    const { container } = render(<>{result.current({ children: "Test Content" })}</>);

    expect(container.innerHTML).toBe("");
  });

  test("should forward ref as a regular prop (React 19)", () => {
    const CustomDiv = ({
      ref,
      ...props
    }: Readonly<React.HTMLProps<HTMLDivElement> & { ref?: React.Ref<HTMLDivElement> }>) => (
      <div ref={ref} data-testid="ref-div" {...props} />
    );

    const { result } = renderHook(() =>
      useSlot("root", { slots: { root: CustomDiv } }, { slot: CustomDiv }),
    );

    const { container } = render(<>{result.current({ children: "Content" })}</>);
    expect(container.querySelector("[data-testid='ref-div']")).toBeTruthy();
  });

  test("should prioritize slots over default slot option", () => {
    const DefaultSlot = () => <div data-testid="default" />;
    const OverrideSlot = () => <div data-testid="override" />;

    const { result } = renderHook(() =>
      useSlot("root", { slots: { root: OverrideSlot } }, { slot: DefaultSlot }),
    );

    const { container } = render(<>{result.current({})}</>);

    expect(container.querySelector("[data-testid='override']")).toBeTruthy();
    expect(container.querySelector("[data-testid='default']")).toBeNull();
  });
});
