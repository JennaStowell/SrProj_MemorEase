"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button, ButtonGroup } from "flowbite-react";
import { Dropdown, DropdownItem } from "flowbite-react";

export default function SetDetailsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const setId = searchParams.get("setId");

  const { data: session } = useSession();

  const [setName, setSetName] = useState<string>("");
  const [terms, setTerms] = useState<{ term: string; definition: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValues, setEditValues] = useState({ term: "", definition: "" });
  const [newTerm, setNewTerm] = useState({ term: "", definition: "" });
  const [ownerId, setOwnerId] = useState<string | null>(null);

  useEffect(() => {
    if (!setId) return;

    const fetchSetDetails = async () => {
      try {
        const res = await fetch(`/api/sets/details?setId=${setId}`);
        if (!res.ok) throw new Error("Failed to fetch terms");

        const data = await res.json();
        setTerms(data.terms);
        setSetName(data.setName);
        setOwnerId(data.userId);  // Assuming `userId` is the ID of the set owner
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSetDetails();
  }, [setId]);

  useEffect(() => {
    if (ownerId && session?.user?.id !== ownerId) {
      router.push("/mysets");  // Redirect if the user is not the owner
    }
  }, [ownerId, session, router]);

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditValues(terms[index]);
  };

  const handleSave = async (index: number) => {
    const updated = [...terms];
    updated[index] = editValues;
    setTerms(updated);
    setEditingIndex(null);

    const res = await fetch("/api/sets/terms", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ setId, order: index + 1, ...editValues }),
    });
    if (!res.ok) {
      console.error("Failed to save changes");
    }
  };

  const handleDelete = async (index: number) => {
    if (!confirm("Delete this term?")) return;
    const updatedTerms = [...terms];
    updatedTerms.splice(index, 1);
    setTerms(updatedTerms);

    await fetch("/api/sets/terms", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ setId, order: index + 1 }),
    });
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/study/details?setId=${setId}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert("Link copied to clipboard!");
    }).catch((err) => {
      console.error("Failed to copy:", err);
      alert("Failed to copy link.");
    });
  };
  

  const handleAddNewTerm = async () => {
    if (!session || !session.user) {
      console.error("User is not authenticated");
      return;
    }
    

    const userId = session.user.id;
    

    if (!newTerm.term.trim() || !newTerm.definition.trim()) return;

    const newEntry = { ...newTerm, order: terms.length + 1, userId };

    const res = await fetch("/api/sets/terms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ setId, ...newEntry }),
    });

    if (res.ok) {
      setTerms((prevTerms) => [...prevTerms, newEntry]);
      setNewTerm({ term: "", definition: "" });
    } else {
      console.error("Failed to add term:", await res.json());
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-xl text-gray-600">Loading your set...</p>
      </div>
    );
  }

  if (!setId) return <p>Missing set ID.</p>;

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',  
          padding: "10px 20px", 
          backgroundColor: "#fff", 
          width: "100%", 
        }}>
        <h1 className="text-maroon text-5xl font-bold" style={ {fontFamily: "cursive"} }>Set: {setName}</h1>
        {session?.user?.name && (
          <div className="text-lg text-gray-600">
            <span>{session.user.name}!</span>
          </div>
        )}
      </div>
      <br></br>

      <div className="mb-4 flex items-center justify-between w-full">
        <ButtonGroup>
        <Button
          color="alternative"
          onClick={() => setEditMode(!editMode)}
          className={`m-2 text-xl px-6 py-3 ${editMode ? "bg-gray-200 hover:text-red-800" : "bg-white hover:text-red-800"}`}
        >{editMode ? "Done Editing" : "Edit Set"}
        </Button>
        <Button
  color="alternative"
  className="m-2 text-xl px-6 py-3 bg-white hover:text-red-800"
  onClick={() => handleShare()}
>
  Share Set
</Button>

        </ButtonGroup>

        <div className="mx-auto">
        <Dropdown label="Study Modes" dismissOnClick={false} color="alternative" className="text-red-800 text-7x1">
            {["Flashcards", "Study", "Test", "Matching"].map((mode) => (
          <DropdownItem key={mode} className="text-5xl py-6 px-8">
            <Link href={`/mysets/${mode.toLowerCase()}?setId=${setId}`} className="text-2xl">
              {mode}
            </Link>
          </DropdownItem>
        ))}
          </Dropdown>
        </div>
      </div>
      <br></br>

      {terms.length === 0 ? (
        <p className="text-center text-gray-600">No terms added yet.</p>
      ) : (
        <div className="flex justify-center">
  <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl">
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
                    {editMode && editingIndex === index ? (
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
                    {editMode && editingIndex === index ? (
                      <input
                        className="border p-1 w-full"
                        value={editValues.definition}
                        onChange={(e) =>
                          setEditValues({ ...editValues, definition: e.target.value })
                        }
                      />
                    ) : (
                      term.definition
                    )}
                  </td>
                  <td className="p-2 flex space-x-2">
                    {editMode &&
                      (editingIndex === index ? (
                        <button className="btn" onClick={() => handleSave(index)}>
                          Save
                        </button>
                      ) : (
                        <>
                          <button className="btn" onClick={() => handleEdit(index)}>
                            Edit
                          </button>
                          <button className="btn" onClick={() => handleDelete(index)}>
                            Delete
                          </button>
                        </>
                      ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {editMode && (
            <div className="flex space-x-2 mt-4">
              <input
                type="text"
                placeholder="New Term"
                value={newTerm.term}
                onChange={(e) => setNewTerm({ ...newTerm, term: e.target.value })}
                className="border p-2 w-1/2"
              />
              <input
                type="text"
                placeholder="New Definition"
                value={newTerm.definition}
                onChange={(e) => setNewTerm({ ...newTerm, definition: e.target.value })}
                className="border p-2 w-1/2"
              />
              <button className="btn" onClick={handleAddNewTerm}>
                Add
              </button>
            </div>
          )}
        </div>
        </div>
      )}

      <div className="mt-6 flex justify-center space-x-4">

        <button
          onClick={() => router.push("/mysets")}
          className="p-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Back to All Sets
        </button>
      </div>

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
