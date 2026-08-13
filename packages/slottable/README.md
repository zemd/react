# @zemd/react-slottable

> A lightweight library for customizing subcomponents in React

[![npm version](https://img.shields.io/npm/v/@zemd/react-slottable?color=%230000ff&labelColor=%23000)](https://www.npmjs.com/package/@zemd/react-slottable)
[![source](https://img.shields.io/badge/source-zemd%2Freact-000?labelColor=000&color=0000ff)](https://github.com/zemd/react/tree/main/packages/slottable)

This package provides a lightweight approach that allows your component users to easily customize nested subcomponents. The concept is inspired by [Material UI's slots pattern](https://mui.com/x/common-concepts/custom-components/).

## Features

- Simple API with `useSlot` hook and `Slot` component
- Compatible with React Compiler
- TypeScript support with full type inference
- Uses `useMemo` and `useCallback` for slot resolution and rendering
- ESM-only package with bundled TypeScript declarations
- No runtime dependencies beyond the React peer
- Development mode warnings for debugging

## Installation

```bash
npm install @zemd/react-slottable
pnpm add @zemd/react-slottable
yarn add @zemd/react-slottable
```

## Compatibility

`@zemd/react-slottable` requires React 18 or newer and is published as ESM with TypeScript declarations.

Server-side rendering requires Node.js 22 or newer.

`useSlot` and `Slot` use React hooks. In a React Server Components framework, use them from a client component.

## Quick Start

The core concept of this library is the **slot**. A slot is a part of a component that can be overridden or customized by the consumer. Instead of creating numerous props to customize nested components, you can divide your component into slots and let users provide their own implementations.

### Creating a Slottable Component

Here is how to create a simple `Button` component with `startDecorator` and `endDecorator` slots:

```tsx
import { type PropsWithSlots, useSlot } from "@zemd/react-slottable";

// Define your component props with slots
type ButtonProps = PropsWithSlots<
  React.PropsWithChildren<{
    fullWidth?: boolean;
    disabled?: boolean;
    size?: "sm" | "md" | "xl";
    variant?: "solid" | "outlined";
    color?: "primary" | "secondary";
    className?: string;
  }>,
  ["startDecorator", "endDecorator"]
>;

// Optional: define a default component for a slot
const DefaultDecorator: React.FC<{ className?: string }> = ({ className }) => {
  return <div className={className}>Default decorator</div>;
};

export const Button: React.FC<ButtonProps> = (props) => {
  // useSlot returns a render function (React Compiler compatible)
  const renderStartDecorator = useSlot("startDecorator", props, {
    slot: DefaultDecorator, // provide a default component
  });
  const renderEndDecorator = useSlot("endDecorator", props);

  return (
    <button className={props.className}>
      {renderStartDecorator({ className: "decorator-class" })}
      {props.children}
      {renderEndDecorator({})}
    </button>
  );
};
```

### Using the `Slot` Component (JSX-centric API)

For developers who prefer a more declarative JSX syntax, the `Slot` component provides an alternative to the `useSlot` hook:

```tsx
import { type PropsWithSlots, Slot } from "@zemd/react-slottable";

type AlertProps = PropsWithSlots<
  { type: "info" | "error"; title: string; message: string },
  ["icon", "title", "message"]
>;

export const Alert: React.FC<AlertProps> = (props) => {
  return (
    <div role="alert">
      <Slot name="icon" parentProps={props} default="span">
        {props.type === "info" ? "ℹ️" : "❌"}
      </Slot>
      <Slot name="title" parentProps={props} default="div">
        {props.title}
      </Slot>
      <Slot name="message" parentProps={props} default="div">
        {props.message}
      </Slot>
    </div>
  );
};
```

### Using a Slottable Component

Consumers can now customize the slots by providing their own components:

```tsx
const MyCustomDecorator: React.FC = () => {
  return <span>Custom decorator</span>;
};

export function App(): React.JSX.Element {
  return (
    <Button
      slots={{
        endDecorator: MyCustomDecorator,
      }}
      slotProps={{
        startDecorator: {
          className: "custom-class",
        },
      }}
      className="my-button"
    >
      Click me
    </Button>
  );
}
```

## API Reference

### `useSlot`

A hook that returns a memoized render function for a given slot.

```tsx
const renderSlot = useSlot(name, props, options);
```

**Parameters:**

- `name` - The name of the slot
- `props` - The component props containing `slots` and `slotProps`
- `options` - Optional configuration object
  - `slot` - Default component to render if no slot is provided
  - `...extraProps` - Additional props to pass to the slot (highest priority)

**Returns:**

A memoized render function (`SlotRenderFunction`) that accepts props and returns the rendered slot.

### `Slot`

A JSX component alternative to the `useSlot` hook.

```tsx
<Slot name="header" parentProps={props} default="div" className="header">
  {children}
</Slot>
```

**Props:**

- `name` - The name of the slot to render
- `parentProps` - The parent component props containing `slots` and `slotProps`
- `default` - Default component to render if no slot is provided (defaults to `"div"`)
- `children` - Children to render inside the slot
- `...rest` - Additional props passed to the slot component

### `PropsWithSlots<Props, SlotNames>`

A type helper that extends your component props with `slots` and `slotProps` using a simple array of slot names.

```tsx
type MyComponentProps = PropsWithSlots<{ title: string }, ["header", "footer"]>;
```

This adds the following optional props to your component:

- `slots` - An object mapping slot names to custom components
- `slotProps` - An object mapping slot names to props passed to each slot

### `PropsWithTypedSlots<Props, SlotsMap>`

A type helper for advanced use cases that provides better TypeScript inference for slot-specific props.

```tsx
type ButtonSlots = {
  startDecorator: React.FC<{ icon?: string; className?: string }>;
  endDecorator: React.FC<{ label?: string }>;
};

type ButtonProps = PropsWithTypedSlots<{ disabled?: boolean }, ButtonSlots>;

// Now slotProps will have proper type inference:
// slotProps.startDecorator accepts { icon?: string; className?: string }
// slotProps.endDecorator accepts { label?: string }
```

### `SlotRenderFunction<T>`

The type of the render function returned by `useSlot`.

```tsx
import type { SlotRenderFunction } from "@zemd/react-slottable";

type MyRenderFn = SlotRenderFunction<typeof MyComponent>;
```

### `Prettify<T>`

A type-only utility that flattens intersections and mapped types into a more readable shape in TypeScript tooling. It has no runtime behavior.

## How It Works

When `useSlot` resolves a slot:

1. If the user provides a custom component via `slots`, it is used
2. Otherwise, the default component from `options.slot` is used
3. If neither is provided, `null` is returned (nothing is rendered)

The `Slot` component follows the same override order, but its `default` prop falls back to `"div"`. Therefore `<Slot>` renders a `div` when neither `slots[name]` nor an explicit `default` is provided.

Props are merged in the following order (later values override earlier ones):

1. Props passed directly to the render function
2. Props from `slotProps`
3. Extra props from the `options` object

## Usage with `useSyncExternalStore`

The library works seamlessly with external state management. Here's an example using `useSyncExternalStore`:

```tsx
import { useSyncExternalStore } from "react";
import { useSlot, type PropsWithSlots } from "@zemd/react-slottable";

// Create an external store
function createCounterStore(initialValue = 0) {
  let state = { count: initialValue };
  const listeners = new Set<() => void>();

  return {
    getSnapshot: () => state,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    increment: () => {
      state = { count: state.count + 1 };
      listeners.forEach((l) => l());
    },
  };
}

const store = createCounterStore(0);

// Counter component with customizable slots
type CounterProps = PropsWithSlots<{ min?: number; max?: number }, ["display", "incrementButton"]>;

const Counter: React.FC<CounterProps> = (props) => {
  const { count } = useSyncExternalStore(store.subscribe, store.getSnapshot);

  const renderDisplay = useSlot("display", props, { slot: "span" });
  const renderButton = useSlot("incrementButton", props, { slot: "button" });

  return (
    <div>
      {renderDisplay({ children: count })}
      {renderButton({
        onClick: store.increment,
        disabled: count >= (props.max ?? Infinity),
        children: "+",
      })}
    </div>
  );
};

// Multiple counters can share the same store with different slot implementations
function App() {
  return (
    <>
      <Counter />
      <Counter
        slots={{
          display: ({ children }) => <strong>{children}</strong>,
        }}
      />
    </>
  );
}
```

## Performance

The resolved slot, selected slot props, and render function use `useMemo` and `useCallback`. Reference stability still depends on the caller: recreating `slots`, `slotProps`, or the `useSlot` options object on every render also changes the hook dependencies. Reuse those objects when stable identity matters to a component's performance.

## License

This project is licensed under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0).

## 💙 💛 Donate

[![Support Ukraine](https://img.shields.io/static/v1?color=blue&label=UNITED24&message=support+Ukraine)](https://u24.gov.ua/)
