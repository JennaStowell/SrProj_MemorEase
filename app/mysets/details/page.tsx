"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function SetDetailsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const setId = searchParams.get("setId");

  const [setName, setSetName] = useState<string>("");
  const [terms, setTerms] = useState<{ term: string; definition: string }[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<{ term: string; definition: string }>({ term: "", definition: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!setId) return;

    const fetchSetDetails = async () => {
      try {
        const res = await fetch(`/api/sets/details?setId=${setId}`);
        if (!res.ok) throw new Error("Failed to fetch terms");
        const data = await res.json();
        setTerms(data.terms);
        setSetName(data.setName); // 👈 make sure your API returns this!
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSetDetails();
  }, [setId]);

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditValues(terms[index]);
  };

  const handleDelete = (index: number) => {
    setTerms((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = (index: number) => {
    if (editingIndex === null) return;
    const updated = [...terms];
    updated[index] = editValues;
    setTerms(updated);
    setEditingIndex(null);
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <p className="text-xl text-gray-600">Loading your set...</p>
    </div>
  );
  if (!setId) return <p>Missing set ID.</p>;

  return (
    <div>
      <div className="flex justify-center w-full p-4">
        <h1 className="text-maroon text-5xl font-bold mx-auto">{setName}</h1>
      </div>

      <hr className="border border-gray-300 my-4" />

      <div className="mb-4 flex justify-center space-x-4">
        <Link href={`/mysets/flashcards?setId=${setId}`}><button className="btn text-2xl py-4 px-8">Flashcards</button></Link>
        <Link href={`/mysets/study?setId=${setId}`}><button className="btn text-2xl py-4 px-8">Study</button></Link>
        <Link href={`/mysets/test?setId=${setId}`}><button className="btn text-2xl py-4 px-8">Test</button></Link>
        <Link href={`/mysets/matching?setId=${setId}`}><button className="btn text-2xl py-4 px-8">Matching</button></Link>
      </div>

      {terms.length === 0 ? (
        <p>No terms added yet.</p>
      ) : (
        <div className="bg-white rounded-lg shadow-lg p-6 mx-auto my-6 w-full max-w-4xl">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 p-2">Term</th>
                <th className="border border-gray-300 p-2">Definition</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {terms.map((term, index) => (
                <tr key={index} className="group border border-gray-300 hover:bg-gray-100">
                  <td className="p-2">
                    {editingIndex === index ? (
                      <input className="border p-1 w-full" value={editValues.term} onChange={(e) => setEditValues({ ...editValues, term: e.target.value })} />
                    ) : (
                      term.term
                    )}
                  </td>
                  <td className="p-2">
                    {editingIndex === index ? (
                      <input className="border p-1 w-full" value={editValues.definition} onChange={(e) => setEditValues({ ...editValues, definition: e.target.value })} />
                    ) : (
                      term.definition
                    )}
                  </td>
                  <td className="p-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {editingIndex === index ? (
                      <button className="btn" onClick={() => handleSave(index)}>Save</button>
                    ) : (
                      <>
                        <button className="btn" onClick={() => handleEdit(index)}>Edit</button>
                        <button className="btn" onClick={() => handleDelete(index)}>Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button onClick={() => router.push("/mysets")} className="mt-4 p-2 bg-gray-200 rounded hover:bg-gray-300">
        Back to All Sets
      </button>

      <style jsx>{`
        .btn {
          padding: 12px 24px;
          background-color: #800000;
          color: white;
          border-radius: 8px;
          cursor: pointer;
          transition: background-color 0.3s ease, transform 0.2s ease;
        }

        .btn:hover {
          background-color: #b30000;
          transform: scale(1.05);
        }

        .text-maroon {
          color: #800000;
        }
      `}</style>
    </div>
  );
}
