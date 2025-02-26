"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SetsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [setName, setSetName] = useState("");

  // Redirect if unauthenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/api/auth/signin");
    }
  }, [status, router]);

  if (status === "loading") return null;

  // Handle set creation and redirect
  const handleCreateSet = async () => {
    const res = await fetch("/api/sets", {
      method: "POST",
      body: JSON.stringify({ userId: session?.user?.id, setName }), // Use actual user ID
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      const newSet = await res.json();
      router.push(`/sets/${newSet.set_id}`); // Redirect to new set page
    }
  };

  return (
    <div>
      <h1>Create a Set</h1>
      <input
        type="text"
        placeholder="Set Name"
        value={setName}
        onChange={(e) => setSetName(e.target.value)}
      />
      <button onClick={handleCreateSet}>Create Set</button>
    </div>
  );
}
