// app/home/layout.tsx
"use client";

import { SessionProvider } from "next-auth/react";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div className="home-layout">
        {children}
      </div>
    </SessionProvider>
  );
}
