"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function SetsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [setName, setSetName] = useState("");
  const [setId, setSetId] = useState(null); // Store the created set ID
  const [terms, setTerms] = useState([{ term: "", definition: "" }]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/api/auth/signin");
    }
  }, [status, router]);

  if (status === "loading") return null;

  // Handle set creation
  const handleCreateSet = async () => {
    const res = await fetch("/api/sets", {
      method: "POST",
      body: JSON.stringify({ userId: session?.user?.id, setName }),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      const newSet = await res.json();
      setSetId(newSet.set_id); // Store the set ID in state
    }
  };

  // Handle adding a term to the set
  const handleAddTerm = async (index:number) => {
    const term = terms[index];
    if (!term.term.trim() || !term.definition.trim()) return;
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
      setTerms([...terms, { term: "", definition: "" }]);
    }
  };

  return (
    <div>
      <h1>Create a Set</h1>
      {!setId ? (
        <div>
          <input
            type="text"
            placeholder="Set Name"
            value={setName}
            onChange={(e) => setSetName(e.target.value)}
          />
          <button onClick={handleCreateSet}>Create Set</button>
        </div>
      ) : (
        <div>
          <h2>Set: {setName}</h2>
          <h3>Add Terms</h3>
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
          <Link href="/mysets"><h1>Return to All Sets</h1></Link>
        </div>
      )}
    </div>
  );
}
