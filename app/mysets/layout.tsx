"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

export default function SetLayout({ children }: { children: ReactNode }) {
  return (
      <div>
        <SessionProvider>{children}</SessionProvider>
      </div>
    
  );
}