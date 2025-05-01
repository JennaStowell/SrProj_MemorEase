"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Papa from "papaparse";
import Link from "next/link";

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
      
      if (index === terms.length - 1) {
        handleAddTerm(index);
      } else {
        
        const nextTermInput = document.getElementById(`term-${index + 1}`) as HTMLInputElement;
        if (nextTermInput) nextTermInput.focus();
      }
    }
  };

  const handleSaveSet = async () => {
   
    const lastTerm = terms[terms.length - 1];
    if (lastTerm.term.trim() && lastTerm.definition.trim()) {
      await handleAddTerm(terms.length - 1); 
    }

    router.push("/mysets"); 
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
    <div>
      <nav>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            padding: "10px 20px",
            backgroundColor: "#fff",
            width: "100%",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <h1 className="text-black text-3xl font-system-ui" style={{ fontFamily: "cursive" }}>
            MemorEase
          </h1>
          <Link href="/mysets" className="text-gray-500 underline">
            Exit
          </Link>
        </div>
      </nav><br></br><br></br>
  
      <div className="flex items-center justify-center bg-white p-8">
        <div className="bg-white border border-gray-300 shadow-xl rounded-xl p-10 w-full max-w-2xl">
          <div className="flex justify-end items-center space-x-2 mb-6">
            <h1 className="text-2xl font-semibold text-black">Create</h1>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-8 h-8 text-black"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.232 5.232l3.536 3.536M9 13l6-6m2-2a2.828 2.828 0 114 4l-10 10H5v-4l10-10z"
              />
            </svg>
          </div>
  
          {!setId ? (
            <div className="flex flex-col space-y-4">
              <h3 className="text-lg font-medium text-gray-700">Input Name:</h3>
              <input
                type="text"
                placeholder="Set Name"
                value={setName}
                onChange={(e) => setSetName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                onKeyPress={(e) => e.key === "Enter" && handleCreateSet()}
              />
              <button
                onClick={handleCreateSet}
                className="w-full bg-red-800 hover:bg-red-900 text-white py-3 rounded-md font-semibold"
              >
                Next
              </button>
            </div>
          ) : (
            <div className="flex flex-col space-y-6">
              <h2 className="text-xl font-system-ui text-red-900">Name: {setName}</h2>
  
              <div className="flex space-x-4">
                <button
                  onClick={() => setUploadMode(false)}
                  className={`px-4 py-2 rounded-md font-medium ${
                    uploadMode === false ? "bg-gray-300" : "bg-gray-100"
                  }`}
                >
                  Manual Entry
                </button>
                <button
                  onClick={() => setUploadMode(true)}
                  className={`px-4 py-2 rounded-md font-medium ${
                    uploadMode === true ? "bg-gray-300" : "bg-gray-100"
                  }`}
                >
                  Upload CSV
                </button> 
              </div><br></br>
  
              {!uploadMode ? (
                <>
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
                        onKeyPress={(e) => handleKeyPress(e, i)}
                        className="w-1/2 px-4 py-2 border border-gray-300 rounded-md focus:outline-none"
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
                        className="w-1/2 px-4 py-2 border border-gray-300 rounded-md focus:outline-none"
                      />
                      <button onClick={() => handleAddTerm(i)} className="bg-gray-100 px-3 py-2 rounded-md hover:bg-gray-200">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-6 h-6 text-black"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={handleSaveSet}
                    className="w-full bg-red-800 hover:bg-red-900 text-white py-3 rounded-md font-semibold mt-4"
                  >
                    Save Set
                  </button>
                </>
              ) : (
                <div>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCSVUpload}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}  
