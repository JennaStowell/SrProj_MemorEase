"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SetDetailsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { setId } = useParams(); // Get the set ID from the URL
  const [terms, setTerms] = useState([{ term: "", definition: "" }]);

  // Redirect if unauthenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/api/auth/signin");
    }
  }, [status, router]);

  if (status === "loading") return null;

  // Handle adding a term to the set
  const handleAddTerm = async (index: number) => {
    const term = terms[index];
    const res = await fetch("/api/sets/terms", {
      method: "POST",
      body: JSON.stringify({
        setId,
        userId: session?.user?.id,
        ...term,
        order: index + 1,
      }),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      console.log("Term added!");
    }
  };

  return (
    <div>
      <h1>Set: {setId}</h1>
      <h2>Add Terms</h2>
      {terms.map((t, i) => (
        <div key={i}>
          <input
            type="text"
            placeholder="Term"
            value={t.term}
            onChange={(e) =>
              setTerms((prev) =>
                prev.map((item, idx) =>
                  idx === i ? { ...item, term: e.target.value } : item
                )
              )
            }
          />
          <input
            type="text"
            placeholder="Definition"
            value={t.definition}
            onChange={(e) =>
              setTerms((prev) =>
                prev.map((item, idx) =>
                  idx === i ? { ...item, definition: e.target.value } : item
                )
              )
            }
          />
          <button onClick={() => handleAddTerm(i)}>Add Term</button>
        </div>
      ))}
      <button onClick={() => setTerms([...terms, { term: "", definition: "" }])}>
        + Add More Terms
      </button>
    </div>
  );
}
