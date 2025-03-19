"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";
import { Suspense } from "react";

export default function SetLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <SessionProvider>
        <Suspense fallback={<div>Loading...</div>}>
          {children}
        </Suspense>
      </SessionProvider>
    </div>
  );
}