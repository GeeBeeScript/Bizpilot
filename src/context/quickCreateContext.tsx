"use client";

import { createContext, useCallback, useContext, useState } from "react";

export type CreateKind = "client" | "project" | "task" | "document" | "invite";

type Payload = { clientId?: string; projectId?: string };

type QuickCreateContextType = {
  active: CreateKind | null;
  payload: Payload;
  openCreate: (kind: CreateKind, payload?: Payload) => void;
  close: () => void;
};

const QuickCreateContext = createContext<QuickCreateContextType | undefined>(undefined);

/** Lets any screen open the global create drawers with inherited context (§29, §36) */
export const QuickCreateProvider = ({ children }: { children: React.ReactNode }) => {
  const [active, setActive] = useState<CreateKind | null>(null);
  const [payload, setPayload] = useState<Payload>({});
  const openCreate = useCallback((kind: CreateKind, p: Payload = {}) => {
    setPayload(p);
    setActive(kind);
  }, []);
  const close = useCallback(() => setActive(null), []);
  return <QuickCreateContext.Provider value={{ active, payload, openCreate, close }}>{children}</QuickCreateContext.Provider>;
};

export const useQuickCreate = () => {
  const ctx = useContext(QuickCreateContext);
  if (!ctx) throw new Error("useQuickCreate must be used inside a QuickCreateProvider");
  return ctx;
};
