"use client";

import { Portal } from "./Portal";
import { ModalInstance } from "./ModalInstance";
import type { PortalContainer, Store } from "./types";
import { useModals } from "./useModals";
import { ModalEntryProvider } from "./ModalEntryProvider";
import { store as defaultStore } from "./store";

type Props = {
  container?: PortalContainer;
  store?: Store;
};

export const ModalRoot: React.FC<Props> = ({ container, store = defaultStore }) => {
  const modals = useModals({ store });

  return modals.length > 0 ? (
    <Portal container={container}>
      {modals.map((entry) => {
        return (
          <ModalEntryProvider entry={entry} store={store} key={entry.id}>
            <ModalInstance entry={entry} />
          </ModalEntryProvider>
        );
      })}
    </Portal>
  ) : null;
};
