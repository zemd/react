"use client";

import { useEffect, useRef } from "react";
import { useModalContext } from "@zemd/react-modals";
import styles from "../modals.module.css";

type Props = {
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
};

export const ConfirmModal: React.FC<Props> = ({ message, onConfirm, onCancel }) => {
  const modalContext = useModalContext();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className={styles.modal}
      onCancel={() => {
        onCancel?.();
        modalContext.close();
      }}
    >
      <h2>Confirm</h2>
      <p>{message}</p>
      <div className={styles.actions}>
        <button
          className={styles.buttonOutline}
          onClick={() => {
            onCancel?.();
            modalContext.close();
          }}
        >
          Cancel
        </button>
        <button
          className={styles.button}
          onClick={() => {
            onConfirm?.();
            modalContext.close();
          }}
        >
          Yes
        </button>
      </div>
    </dialog>
  );
};
