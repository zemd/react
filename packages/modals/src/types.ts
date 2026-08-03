declare const __brand: unique symbol;
export type UUID = `${string}-${string}-${string}-${string}-${string}` & {
  readonly [__brand]: "UUID";
};

export type Entry<ArgProps extends object = Record<string, unknown>> = {
  id: UUID;
  component:
    | React.LazyExoticComponent<React.ComponentType<ArgProps>>
    | React.ComponentType<ArgProps>;
  props: ArgProps;
  callbacks: {
    onOpen?: ((props: ArgProps) => void) | undefined;
    onClose?: ((props: ArgProps) => void) | undefined;
  };
};

export type EntryList = readonly Entry[];

export type StoreOptions = {
  maxStackSize?: number;
};

export type Store = {
  getSnapshot: () => EntryList;
  getServerSnapshot: () => EntryList;
  subscribe: (listener: () => void) => () => void;
  append: (entry: Omit<Entry, "id">) => UUID;
  remove: (id: UUID) => void;
  removeLatest: () => void;
  removeAll: () => void;
};

export type PortalContainer = Element | (() => Element | null) | null | undefined;
