import { Suspense } from "react";
import type { Entry } from "./types";

type Props = {
  entry: Entry;
};

export const ModalInstance: React.FC<Props> = ({ entry }) => {
  const Component = entry.component;
  return (
    <Suspense>
      <Component {...entry.props} />
    </Suspense>
  );
};
