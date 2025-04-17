"use client";

import { SessionProvider } from "next-auth/react";
import { Suspense } from "react";

export default function FlashcardsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <Suspense>
      <div className="flash-layout">
        {children}
      </div>
      </Suspense>
    </SessionProvider>
  );
}
