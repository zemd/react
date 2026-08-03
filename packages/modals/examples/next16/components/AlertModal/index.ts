import { createModal } from "@zemd/react-modals";
import { AlertModal } from "./AlertModal";

// Direct import — the component is bundled with the page
export const alertModal = createModal({
  component: AlertModal,
  onOpen: () => {
    console.log("Alert modal opened");
  },
  onClose: () => {
    console.log("Alert modal closed");
  },
});
