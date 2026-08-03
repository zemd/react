"use client";

import { createPortal } from "react-dom";
import type { PortalContainer } from "./types";
import { useMemo } from "react";

type Props = React.PropsWithChildren<{
  container?: PortalContainer;
}>;

const getContainer = (container: PortalContainer) => {
  return typeof container === "function" ? container() : container;
};

export const Portal: React.FC<Props> = ({ children, container }) => {
  const mountNode = useMemo(() => {
    if (typeof document === "undefined") {
      return null;
    }
    return getContainer(container) ?? document.body;
  }, [container]);

  if (!mountNode) {
    return null;
  }

  return createPortal(children, mountNode);
};
