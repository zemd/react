"use client";

import { useSyncExternalStore } from "react";
import type { EntryList, Store } from "./types";
import { store as defaultStore } from "./store";

type Options = {
  store?: Store;
};

export const useModals = (options?: Options): EntryList => {
  const store = options?.store ?? defaultStore;
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
};
