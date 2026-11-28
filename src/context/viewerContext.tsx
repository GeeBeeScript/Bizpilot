"use client";

import type { Viewer } from "@/types";
import { createContext, ReactNode, useContext } from "react";

const ViewerContext = createContext<Viewer | null>(null);

export const ViewerProvider = ({
  value,
  children,
}: {
  value: Viewer;
  children: ReactNode;
}) => <ViewerContext value={value}>{children}</ViewerContext>;

export const useViewer = () => {
  const viewer = useContext(ViewerContext);
  if (!viewer)
    throw new Error("useViewer() must be used inside <ViewerProvider />");
  return viewer;
};
