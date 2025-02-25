"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Sets() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/api/auth/signin"); // Redirect if not authenticated
    }
  }, [status, router]);

  if (status === "loading") return null;

  return (
    <div>Sets</div>
  );
}

