"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

export default function SetLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}