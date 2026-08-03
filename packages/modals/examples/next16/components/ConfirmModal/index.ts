import dynamic from "next/dynamic";
import { createModal } from "@zemd/react-modals";

// Lazy import — the component is loaded asynchronously on first open
const ConfirmModal = dynamic(async () => {
  return import("./ConfirmModal").then((mod) => {
    return mod.ConfirmModal;
  });
});

export const confirmModal = createModal({
  component: ConfirmModal,
  onOpen: () => {
    console.log("Confirm modal opened");
  },
  onClose: () => {
    console.log("Confirm modal closed");
  },
});
