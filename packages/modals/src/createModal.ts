import { lazy, type LazyExoticComponent } from "react";
import type { Entry, Store, UUID } from "./types";
import { store as defaultStore } from "./store";

// `keyof Record<string, never>` is `string`, which would hide the propless `open()`.
type NoProps = Record<never, never>;

export type ModalController<ArgProps extends object = NoProps> = [keyof ArgProps] extends [never]
  ? { readonly open: () => UUID; readonly close: (id?: UUID) => void }
  : {
      readonly open: (props: ArgProps) => UUID;
      readonly close: (id?: UUID) => void;
    };

type CreateModalOptions<ArgProps extends object> = (
  | { lazy: () => Promise<{ default: React.ComponentType<ArgProps> }> }
  | { component: React.ComponentType<ArgProps> }
) & {
  onOpen?: (props: ArgProps) => void;
  onClose?: (props: ArgProps) => void;
  store?: Store;
};

export const createModal = <ArgProps extends object = NoProps>(
  options: CreateModalOptions<ArgProps>,
): ModalController<ArgProps> => {
  const store = options.store ?? defaultStore;
  type ComponentType = React.ComponentType<ArgProps>;
  const Component: ComponentType | LazyExoticComponent<ComponentType> =
    "lazy" in options ? lazy(options.lazy) : options.component;

  let lastOpenedId: UUID | undefined;
  const openModal = (...args: [keyof ArgProps] extends [never] ? [] : [props: ArgProps]) => {
    const resolvedProps = (args.length > 0 ? args[0] : {}) as ArgProps;
    lastOpenedId = store.append({
      component: Component as React.ComponentType<Record<string, unknown>>,
      props: resolvedProps as Record<string, unknown>,
      callbacks: {
        onOpen: options.onOpen,
        onClose: options.onClose,
      } as Entry["callbacks"],
    });
    return lastOpenedId;
  };

  const closeModal = (id?: UUID) => {
    if (id === undefined) {
      if (lastOpenedId === undefined) {
        console.warn("No modal is currently open.");
        return;
      }
      const target = lastOpenedId;
      lastOpenedId = undefined;
      store.remove(target);
      return;
    }
    if (id === lastOpenedId) {
      lastOpenedId = undefined;
    }
    store.remove(id);
  };

  return Object.freeze({
    open: openModal,
    close: closeModal,
  }) as ModalController<ArgProps>;
};
