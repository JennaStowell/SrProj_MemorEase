"use client";

import { SessionProvider } from "next-auth/react";
import { Suspense } from "react";

export default function StudyDetailsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <Suspense>
      <div className="study-layout">
        {children}
      </div>
      </Suspense>
    </SessionProvider>
  );
}
