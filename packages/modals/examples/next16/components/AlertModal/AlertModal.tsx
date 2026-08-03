"use client";

import { useEffect, useRef } from "react";
import styles from "../modals.module.css";
import { useModalContext } from "@zemd/react-modals";

type Props = {
  title: string;
  message: string;
};

export const AlertModal: React.FC<Props> = ({ title, message }) => {
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
        modalContext.close();
      }}
    >
      <h2>{title}</h2>
      <p>{message}</p>
      <button
        className={styles.button}
        onClick={() => {
          modalContext.close();
        }}
      >
        OK
      </button>
    </dialog>
  );
};
