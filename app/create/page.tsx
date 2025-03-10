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
  const handleAddTerm = async (index: number) => {
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

  // Handle saving the set and adding last term if needed
  const handleSaveSet = async () => {
    const lastTerm = terms[terms.length - 1];
    // If the last term is not empty, add it to the set
    if (lastTerm.term.trim() && lastTerm.definition.trim()) {
      await handleAddTerm(terms.length - 1);
    }
    // Here, you can handle any additional save functionality, if needed
    console.log("Set saved!");
    router.push("/mysets"); // Redirect to the list of sets after saving
  };

  return (
    <div className="flex flex-col items-center justify-center  bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-maroon mb-6 text-center">
          Create a Set
        </h1>

        {!setId ? (
          <div className="flex flex-col space-y-4">
            <input
              type="text"
              placeholder="Set Name"
              value={setName}
              onChange={(e) => setSetName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon"
            />
            <button
              onClick={handleCreateSet}
              className="w-full bg-maroon text-white py-2 rounded-lg hover:bg-red-700 transition-all"
            >
              Create Set
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-maroon">Set: {setName}</h2>
            <h3 className="text-lg font-medium text-gray-700">Add Terms</h3>

            {terms.map((t, i) => (
              <div key={i} className="flex space-x-2">
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
                  className="w-1/2 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon"
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
                  className="w-1/2 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon"
                />
                <button
                  onClick={() => handleAddTerm(i)}
                  className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 transition-all"
                >
                  ➕
                </button>
              </div>
            ))}

            <button
              onClick={handleSaveSet}
              className="w-full bg-maroon text-white py-2 rounded-lg hover:bg-red-700 transition-all"
            >
              Save Set
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .text-maroon {
          color: #800000;
        }
        .bg-maroon {
          background-color: #800000;
        }
      `}</style>
    </div>
  );
}