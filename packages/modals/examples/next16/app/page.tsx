"use client";

import styles from "./page.module.css";
import { alertModal } from "@/components/AlertModal";
import { confirmModal } from "@/components/ConfirmModal";

export default function Home(): React.JSX.Element {
  return (
    <div className={styles.page}>
      <h1>@zemd/react-modals</h1>
      <p>Next.js 16 example</p>
      <div className={styles.buttons}>
        <button
          className={styles.button}
          onClick={() => {
            alertModal.open({
              title: "Hello!",
              message: "This modal was imported directly.",
            });
          }}
        >
          Open Alert (direct)
        </button>
        <button
          className={styles.button}
          onClick={() => {
            confirmModal.open({
              message: "This modal was loaded asynchronously with dynamic()/lazy().",
              onConfirm: () => {
                console.log("Confirmed!");
              },
              onCancel: () => {
                console.log("Cancelled!");
              },
            });
          }}
        >
          Open Confirm (lazy)
        </button>
      </div>
    </div>
  );
}
