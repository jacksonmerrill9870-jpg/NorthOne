"use client";

import { BankProvider } from './context/BankContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return <BankProvider>{children}</BankProvider>;
}
