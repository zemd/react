"use client";

import { useMemo } from "react";
import { ModalEntryContext } from "./ModalEntryContext";
import type { Entry, Store } from "./types";

type Props = {
  entry: Entry;
  store: Store;
};

export const ModalEntryProvider: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  entry,
  store,
}) => {
  const contextValue = useMemo(() => {
    return {
      entry,
      close: () => {
        store.remove(entry.id);
      },
    };
  }, [entry, store]);

  return <ModalEntryContext value={contextValue}>{children}</ModalEntryContext>;
};
