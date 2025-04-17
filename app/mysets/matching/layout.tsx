"use client";

import { SessionProvider } from "next-auth/react";
import { Suspense } from "react";

export default function MatchingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <Suspense>
      <div className="match-layout">
        {children}
      </div>
      </Suspense>
    </SessionProvider>
  );
}
