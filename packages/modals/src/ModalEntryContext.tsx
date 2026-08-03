import { createContext, use, type Context } from "react";
import type { Entry } from "./types";

export type ModalEntryContextType = {
  entry: Entry;
  close: () => void;
};

export const ModalEntryContext: Context<ModalEntryContextType | null> =
  createContext<ModalEntryContextType | null>(null);

export const useModalContext = (): ModalEntryContextType => {
  const context = use(ModalEntryContext);
  if (!context) {
    throw new Error("useModalContext must be used within a ModalEntryProvider");
  }
  return context;
};
