"use client";

import { SessionProvider } from "next-auth/react";
import { Suspense } from "react";

export default function TestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <Suspense>
      <div className="test-layout">
        {children}
      </div>
      </Suspense>
    </SessionProvider>
  );
}
