import type { Entry, Store, StoreOptions, EntryList, UUID } from "./types";

const EMPTY_SNAPSHOT: EntryList = Object.freeze<EntryList>([]);
const DEFAULT_MAX_STACK_SIZE = 100;

export const createStore = (options?: StoreOptions): Store => {
  const maxStackSize = options?.maxStackSize ?? DEFAULT_MAX_STACK_SIZE;
  const listeners = new Set<() => void>();
  const stack: Entry[] = [];
  let snapshot: EntryList = EMPTY_SNAPSHOT;

  const emit = () => {
    snapshot = Object.freeze([...stack]);
    for (const listener of listeners) {
      listener();
    }
  };

  return {
    getSnapshot: () => {
      return snapshot;
    },
    getServerSnapshot: () => {
      return EMPTY_SNAPSHOT;
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    append: ({ component, props, callbacks }) => {
      const id = crypto.randomUUID() as UUID;
      if (stack.length >= maxStackSize) {
        throw new Error(
          `Maximum modal stack size (${maxStackSize}) exceeded. This may indicate a logic error.`,
        );
      }
      const newEntry: Entry = { id, component, props, callbacks: callbacks };
      stack.push(newEntry);

      try {
        newEntry.callbacks.onOpen?.(newEntry.props);
      } catch (error) {
        console.error(error);
      }

      emit();
      return id;
    },
    remove: (id) => {
      const index = stack.findIndex((m) => {
        return m.id === id;
      });
      if (index !== -1) {
        const entry = stack[index] as Entry;

        try {
          entry.callbacks.onClose?.(entry.props);
        } catch (error) {
          console.error(error);
        }

        stack.splice(index, 1);
        emit();
      }
    },
    removeLatest: () => {
      const entry = stack.pop();
      if (!entry) {
        return;
      }

      try {
        entry.callbacks.onClose?.(entry.props);
      } catch (error) {
        console.error(error);
      }

      emit();
    },
    removeAll: () => {
      if (stack.length > 0) {
        for (const entry of stack) {
          try {
            entry.callbacks.onClose?.(entry.props);
          } catch (error) {
            console.error(error);
          }
        }

        stack.splice(0);
        emit();
      }
    },
  };
};

export const store: Store = createStore();
