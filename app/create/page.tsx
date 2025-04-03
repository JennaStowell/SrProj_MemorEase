"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Papa from "papaparse";

export default function SetsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [setName, setSetName] = useState("");
  const [setId, setSetId] = useState<number | null>(null);
  const [terms, setTerms] = useState<{ term: string; definition: string }[]>([{ term: "", definition: "" }]);
  const [uploadMode, setUploadMode] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/api/auth/signin");
    }
  }, [status, router]);

  if (status === "loading") return null;

  const handleCreateSet = async () => {
    const res = await fetch("/api/sets", {
      method: "POST",
      body: JSON.stringify({ userId: session?.user?.id, setName }),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      const newSet = await res.json();
      setSetId(newSet.set_id);
    }
  };

  const handleAddTerm = async (index: number) => {
    const term = terms[index];
    if (!term.term.trim() || !term.definition.trim()) return;

    await fetch("/api/sets/terms", {
      method: "POST",
      body: JSON.stringify({
        setId,
        userId: session?.user?.id,
        ...term,
        order: index + 1,
      }),
      headers: { "Content-Type": "application/json" },
    });

    setTerms([...terms, { term: "", definition: "" }]); // Add a new term input after saving
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key === "Enter") {
      // If it is the last term, add the term
      if (index === terms.length - 1) {
        handleAddTerm(index);
      } else {
        // Move focus to the next term input
        const nextTermInput = document.getElementById(`term-${index + 1}`) as HTMLInputElement;
        if (nextTermInput) nextTermInput.focus();
      }
    }
  };

  const handleSaveSet = async () => {
    // Save the last term if it's not empty
    const lastTerm = terms[terms.length - 1];
    if (lastTerm.term.trim() && lastTerm.definition.trim()) {
      await handleAddTerm(terms.length - 1); // Add the last term
    }

    router.push("/mysets"); // Redirect to "My Sets" after saving
  };

  const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      complete: async (result) => {
        const parsedTerms = result.data
          .filter((row): row is string[] => Array.isArray(row) && row.length >= 2)
          .map((row, index) => ({ term: row[0], definition: row[1], order: index + 1 }));

        if (parsedTerms.length > 0) {
          const res = await fetch("/api/sets/terms/bulk", {
            method: "POST",
            body: JSON.stringify({ setId, userId: session?.user?.id, terms: parsedTerms }),
            headers: { "Content-Type": "application/json" },
          });
          if (res.ok) {
            router.push("/mysets");
          }
        }
      },
    });
  };

  return (
    <div className="flex flex-col items-center justify-center bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-red-900 mb-6 text-center">Create a Set</h1>

        {!setId ? (
          <div className="flex flex-col space-y-4">
            <input
              type="text"
              placeholder="Set Name"
              value={setName}
              onChange={(e) => setSetName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900"
              onKeyPress={(e) => e.key === "Enter" && handleCreateSet()} // Create set on "Enter"
            />
            <button
              onClick={handleCreateSet}
              className="w-full bg-red-900 text-white py-2 rounded-lg"
            >
              Create Set
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-red-900">Set: {setName}</h2>
            <div className="flex space-x-4">
              <button onClick={() => setUploadMode(false)} className="px-4 py-2 bg-gray-200 rounded-lg">Manual Entry</button>
              <button onClick={() => setUploadMode(true)} className="px-4 py-2 bg-gray-200 rounded-lg">Upload CSV</button>
            </div>
            {!uploadMode ? (
              <>
                <h3 className="text-lg font-medium text-gray-700">Add Terms</h3>
                {terms.map((t, i) => (
                  <div key={i} className="flex space-x-2">
                    <input
                      id={`term-${i}`}
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
                      onKeyPress={(e) => handleKeyPress(e, i)}
                      className="w-1/2 px-4 py-2 border rounded-lg"
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
                      className="w-1/2 px-4 py-2 border rounded-lg"
                    />
                    <button onClick={() => handleAddTerm(i)} className="bg-gray-200 px-4 py-2 rounded-lg">➕</button>
                  </div>
                ))}
                <button onClick={handleSaveSet} className="w-full bg-red-900 text-white py-2 rounded-lg">Save Set</button>
              </>
            ) : (
              <div>
                <input type="file" accept=".csv" onChange={handleCSVUpload} className="block w-full px-4 py-2 border rounded-lg" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
