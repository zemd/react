# @zemd/react-modals

> A lightweight React modal management library

[![npm version](https://img.shields.io/npm/v/@zemd/react-modals?color=%230000ff&labelColor=%23000)](https://www.npmjs.com/package/@zemd/react-modals)
[![source](https://img.shields.io/badge/source-zemd%2Freact-000?labelColor=000&color=0000ff)](https://github.com/zemd/react/tree/main/packages/modals)

This client-side library gives you a simple way to manage modals in React. Define modal components, register module-level controllers with `createModal`, and open or close them from anywhere in your client code. One `ModalRoot` renders the stack, without application-level provider wiring or prop drilling. The store uses `useSyncExternalStore` and is compatible with React 19 and Next.js.

Check out working examples in the [examples](./examples) folder, including a [Next.js 16 demo](./examples/next16).

## Features

- Simple `createModal` API — define once, use from client code
- Built-in support for lazy-loaded modals via `React.lazy`
- One `ModalRoot`, with no provider wiring required
- Full TypeScript support with typed modal props
- SSR-friendly empty server snapshot
- Lifecycle callbacks (`onOpen`, `onClose`)
- You can implement your own store for advanced use cases
- ESM-only package with bundled TypeScript declarations
- No runtime dependencies beyond the React and React DOM peers

## Installation

```bash
npm install @zemd/react-modals
pnpm add @zemd/react-modals
yarn add @zemd/react-modals
```

## Compatibility

`@zemd/react-modals` requires React 19 and React DOM 19 or newer. It is published as ESM with TypeScript declarations.

Server-side rendering requires Node.js 22 or newer.

The published entry is marked with `"use client"`. A Next.js Server Component layout can render `ModalRoot`, but code that calls `open`, `close`, store methods, or hooks must run on the client.

## Quick Start

### 1. Add `ModalRoot` to your layout

Place `<ModalRoot />` somewhere near the root of your app. It renders active modals into a portal.

```tsx
import { ModalRoot } from "@zemd/react-modals";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <ModalRoot />
      </body>
    </html>
  );
}
```

### 2. Create a modal component

Write a regular React component. Use `useModalContext` to get a `close` function.

```tsx
"use client";

import { useEffect, useRef } from "react";
import { useModalContext } from "@zemd/react-modals";

type Props = {
  title: string;
  message: string;
};

export const AlertModal: React.FC<Props> = ({ title, message }) => {
  const { close } = useModalContext();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  return (
    <dialog ref={dialogRef} onCancel={close}>
      <h2>{title}</h2>
      <p>{message}</p>
      <button onClick={close}>OK</button>
    </dialog>
  );
};
```

### 3. Register and use

Create the controller once at module scope:

```tsx
// alert-modal-controller.ts
"use client";

import { createModal } from "@zemd/react-modals";
import { AlertModal } from "./AlertModal";

export const alertModal = createModal({
  component: AlertModal,
});
```

Call it from client code, such as an event handler:

```tsx
"use client";

import { alertModal } from "./alert-modal-controller";

export function ShowAlertButton() {
  return (
    <button
      onClick={() =>
        alertModal.open({
          title: "Hello!",
          message: "This is a modal.",
        })
      }
    >
      Show alert
    </button>
  );
}
```

`open` returns the new modal's ID. Pass that ID to `close(id)` to close a specific instance, or call `close()` to close the most recently opened instance created by this controller.

### Lazy loading

You can lazy-load modal components to keep your initial bundle small:

```tsx
"use client";

import { createModal } from "@zemd/react-modals";

export const confirmModal = createModal({
  lazy: () => import("./ConfirmModal").then((m) => ({ default: m.ConfirmModal })),
});

export function openConfirmModal() {
  return confirmModal.open({ message: "Are you sure?" });
}
```

## API Reference

### `createModal(options)`

Creates a modal controller with `open` and `close` methods.

**Options:**

- `component` — the React component to render as a modal
- `lazy` — a function returning a dynamic import (alternative to `component`)
- `onOpen` — callback fired with the modal props when the modal opens
- `onClose` — callback fired with the modal props when the modal closes
- `store` — custom store instance (optional)

**Returns:** `{ open, close }`

- `open(props)` — opens the modal and returns a unique ID; controllers for components without props expose `open()`
- `close(id?)` — closes a specific modal by ID, or the last instance opened by this controller

### `<ModalRoot />`

Renders all active modals into a portal. Place it once in your layout.

**Props:**

- `container` — custom DOM element or function returning one (defaults to `document.body`)
- `store` — custom store instance (optional)

When using a custom store, pass the same instance to `ModalRoot` and every controller that should render through it.

### `useModalContext()`

A hook available inside modal components. Returns `{ entry, close }`.

- `entry` — the current modal entry (id, component, props)
- `close()` — closes this modal

### `useModals(options?)`

A hook that returns the current list of active modal entries. Uses `useSyncExternalStore`.

### `createStore(options?)`

Creates a standalone modal store. Useful when you need multiple independent modal stacks.

**Options:**

- `maxStackSize` — maximum number of modals allowed in the stack (default: `100`)

The returned store exposes `getSnapshot`, `getServerSnapshot`, `subscribe`, `append`, `remove`, `removeLatest`, and `removeAll`. Most applications should manipulate it through modal controllers and render it through `ModalRoot`:

```tsx
"use client";

import { createModal, createStore, ModalRoot } from "@zemd/react-modals";
import { AlertModal } from "./AlertModal";

const store = createStore();
export const alertModal = createModal({ component: AlertModal, store });

export function CustomModalRoot() {
  return <ModalRoot store={store} />;
}
```

### Lower-level exports

`Portal`, `ModalInstance`, `ModalEntryContext`, `ModalEntryProvider`, and the related entry, store, container, and UUID types are exported for custom renderers. Most consumers should prefer `ModalRoot`, `createModal`, `useModalContext`, and `createStore`.

## License

This project is licensed under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0).

## 💙 💛 Donate

[![Support Ukraine](https://img.shields.io/static/v1?color=blue&label=UNITED24&message=support+Ukraine)](https://u24.gov.ua/)
