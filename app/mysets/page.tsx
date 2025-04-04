"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";

export default function MySetsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [sets, setSets] = useState<{ set_id: number; user_id: string; set_name: string }[]>([]);
  const [selectedSet, setSelectedSet] = useState<{ set_id: number; set_name: string } | null>(null);
  const [terms, setTerms] = useState<{ term: string; definition: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Track loading state
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<{ term: string; definition: string }>({ term: "", definition: "" });

  const fetchUserSets = useCallback(async () => {
    if (!session?.user?.id) {
      console.error("User ID is missing");
      return;
    }
  
    setIsLoading(true);
    try {
      const res = await fetch(`/api/sets?userId=${session.user.id}`);
      if (!res.ok) {
        const errorData = await res.json();
        console.error("Error fetching user sets:", errorData.error || "Unknown error");
        throw new Error("Failed to fetch user sets");
      }
      const data = await res.json();
      setSets(data);
    } catch (error) {
      console.error("Error fetching user sets:", error);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id]);
  

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/api/auth/signin");
    } else if (status === "authenticated" && session?.user?.id) {
      fetchUserSets();
    }
  }, [status, session, router, fetchUserSets]);
  
  
  
  const fetchSetDetails = async (setId: number, setName: string) => {
    try {
      const res = await fetch(`/api/sets/details?setId=${setId}`);
      if (!res.ok) throw new Error(`Failed to fetch set details for ID ${setId}`);
      const data = await res.json();
      setSelectedSet({ set_id: setId, set_name: setName });
      setTerms(data.terms);
    } catch (error) {
      console.error("Error fetching set details:", error);
    }
  };
  
  const handleDeleteSet = async (setId: number) => {
    if (!session?.user?.id) {
      console.error("User ID is missing");
      return;
    }
  
    const confirmDelete = confirm("Are you sure you want to delete this set?");
    if (!confirmDelete) return;
  
    try {
      const res = await fetch("/api/sets", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          setId,
          userId: session.user.id,
        }),
      });
  
      if (!res.ok) {
        const errorData = await res.json();
        console.error("Error deleting set:", errorData.error || "Unknown error");
        return;
      }
  
      // Remove the deleted set from state
      setSets((prevSets) => prevSets.filter((set) => set.set_id !== setId));
    } catch (error) {
      console.error("Error deleting set:", error);
    }
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditValues(terms[index]);
  };

  const handleDelete = (index: number) => {
    const newTerms = terms.filter((_, i) => i !== index);
    setTerms(newTerms);
  };

  const handleSave = (index: number) => {
    if (editingIndex === null) return;
    const newTerms = [...terms];
    newTerms[index] = editValues;
    setTerms(newTerms);
    setEditingIndex(null);
  };

  if (status === "loading") return <p>Loading...</p>;

  return (
    <div>
      {selectedSet ? (
        <>
          <div className="flex justify-center w-full" style={{ padding: '10px' }}>
            <h1 className="text-maroon text-5xl font-bold mx-auto">{selectedSet.set_name}</h1>
          </div>

          <hr style={{ border: '1px solid #ccc', margin: '10px 0' }} />

          {/* Buttons above table */}
          <div className="mb-4 flex justify-center space-x-4">
          <Link href={`/mysets/flashcards?setId=${selectedSet?.set_id}`} passHref><button className="btn text-2xl py-4 px-8">Flashcards</button></Link>
            <Link href={`/mysets/study?setId=${selectedSet?.set_id}`} passHref><button className="btn text-2xl py-4 px-8">Study</button></Link>
            <Link href={`/mysets/test?setId=${selectedSet?.set_id}`} passHref><button className="btn text-2xl py-4 px-8">Test</button></Link>
            <Link href={`/mysets/matching?setId=${selectedSet?.set_id}`} passHref><button className="btn text-2xl py-4 px-8">Matching</button></Link>
          </div>
          <br />

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
                      <input
                        className="border p-1 w-full"
                        value={editValues.term}
                        onChange={(e) => setEditValues({ ...editValues, term: e.target.value })}
                      />
                    ) : (
                      term.term
                    )}
                  </td>
                  <td className="p-2">
                    {editingIndex === index ? (
                      <input
                        className="border p-1 w-full"
                        value={editValues.definition}
                        onChange={(e) => setEditValues({ ...editValues, definition: e.target.value })}
                      />
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

          <button onClick={() => setSelectedSet(null)} className="mt-4 p-2 bg-gray-200 rounded hover:bg-gray-300">
            Back to All Sets
          </button>
        </>
      ) : (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", // Add shadow under the navbar
              padding: "10px 20px", // Added some padding for better appearance
              backgroundColor: "#fff", // Optional: set a background color
            }}
          >
            <Link href="/">
              <h1 style={{ fontFamily: "cursive", fontSize: "36px" }}>Memorease</h1>
            </Link>
          </div>
          <div className="flex justify-between items-center w-full" style={{ padding: '10px' }}>
            <h1 className="text-maroon text-5xl font-bold mx-auto">My Sets</h1>
            <Link href="/create">
              <button className="ml-auto">+ Create Set</button>
            </Link>
          </div>
          <hr style={{ border: '1px solid #ccc', margin: '10px 0' }} />

          {isLoading ? (
            <p>Loading sets...</p>
          ) : sets.length === 0 ? (
            <p>No sets created yet.</p>
          ) : (
            <ul>
  {sets.map((set) => (
    <li
      key={set.set_id}
      className="my-2 ml-6 flex items-center group" // Added 'group' to track hover state
    >
      <span className="text-maroon mr-3">&#9733;</span>
      <div className="flex items-center">
        <button
          onClick={() => fetchSetDetails(set.set_id, set.set_name)}
          className="set-button py-6 px-12 text-2xl bg-white shadow-md rounded-lg hover:border-b-4 hover:border-maroon transition-all duration-300"
        >
          {set.set_name}
        </button>
        <button
          onClick={() => handleDeleteSet(set.set_id)}
          className="opacity-0 group-hover:opacity-100 transition flex items-center justify-center p-2 rounded-full text-black hover:bg-red-700"
        >
          <Trash2 className="w-5 h-5" /> {/* Trashcan icon */}
        </button>
      </div>
    </li>
  ))}
</ul>


          )}
        </>
      )}

      {/* Custom styles */}
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

        .btn:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(128, 0, 0, 0.4);
        }

        .text-maroon {
          color: #800000;
        }
      `}</style>
    </div>
  );
}
