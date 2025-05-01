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
  const [terms, setTerms] = useState<{ term: string; definition: string; term_id: number }[]>([]);
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
    updated[index] = {
      ...editValues,
      term_id: terms[index].term_id, // ✅ Preserve term_id
    };
    setTerms(updated);
    setEditingIndex(null);
  
    const res = await fetch("/api/sets/terms", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        setId,
        order: index + 1,
        ...editValues,
        term_id: terms[index].term_id, // ✅ Add term_id here
      }),
    });
  
    if (!res.ok) {
      console.error("Failed to save changes");
    }
  };
  
  const handleDelete = async (index: number) => {
    if (!confirm("Delete this term?")) return;
    
    const termToDelete = terms[index]; // now has term_id!
  
    const updatedTerms = [...terms];
    updatedTerms.splice(index, 1);
    setTerms(updatedTerms);
  
    await fetch("/api/sets/terms", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ setId, termId: termToDelete.term_id }),
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
  
    if (!newTerm.term.trim() || !newTerm.definition.trim()) return;
  
    const res = await fetch("/api/sets/terms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        setId,
        term: newTerm.term,
        definition: newTerm.definition,
        order: terms.length + 1,
        userId: session.user.id,
      }),
    });
  
    if (res.ok) {
      const savedTerm = await res.json(); // expect { term_id, term, definition }
      setTerms((prevTerms) => [...prevTerms, {
        term: savedTerm.term,
        definition: savedTerm.definition,
        term_id: savedTerm.term_id, // ✅ only these 3 fields
      }]);
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
          <Link href="/mysets">
          <h1 style={{ fontFamily: "cursive", fontSize: "36px" }}>MemorEase</h1>
        </Link>
        {session?.user?.name && (
          <div className="text-lg text-gray-600">
            <span>{session.user.name}!</span>
          </div>
        )}
      </div>
      <br></br>
      <h1 className="text-maroon text-5xl font-system-ui">Set: {setName}</h1>

      <div className="flex justify-between mb-4">
  <div className="ml-4">
    <br></br>
    <Dropdown label={<span className="text-1xl">Study Modes</span>} dismissOnClick={false}  color = "alternative" className = "hover:text-red-800">
      {["Flashcards", "Study", "Test", "Matching"].map((mode) => (
        <DropdownItem key={mode} className="text-5xl py-6 px-6">
          <Link href={`/mysets/${mode.toLowerCase()}?setId=${setId}`} className="text-2xl">
            {mode}
          </Link>
        </DropdownItem>
      ))}
    </Dropdown>
  </div>
</div>

<br />

{terms.length === 0 ? (
  <div className="flex justify-center">
    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl text-center">
      <p className="text-gray-600 text-lg">No terms added yet.</p>
    </div>
  </div>
) : (
<div className="flex justify-center">
  <div
    className="rounded-lg shadow-lg p-6 w-full max-w-4xl bg-white bubble-style">  {/* Ensure bg-amber-50 is here */}
    <table className="w-full border-collapse border-2 border-white shadow-sm">
      <tbody>
        {terms.map((term, index) => (
          <tr key={index} className="group hover:bg-gray-100">
            <td className="p-4 text-center text-xl border-t border-b border-2 border-white shadow-sm">
              {editMode && editingIndex === index ? (
                <input
                  className="border p-2 w-full"
                  value={editValues.term}
                  onChange={(e) => setEditValues({ ...editValues, term: e.target.value })}
                />
              ) : (
                term.term
              )}
            </td>
            <td className="p-4 text-center text-xl  border-2 border-white shadow-sm">
              {editMode && editingIndex === index ? (
                <input
                  className="border p-2 w-full"
                  value={editValues.definition}
                  onChange={(e) => setEditValues({ ...editValues, definition: e.target.value })}
                />
              ) : (
                term.definition
              )}
            </td>
            <td className="p-2 flex space-x-2 text-center">
              {editMode &&
                (editingIndex === index ? (
                  <button className="btn" onClick={() => handleSave(index)}>
                    Save
                  </button>
                ) : (
                  <>
                    <button className="btn" onClick={() => handleEdit(index)}>
                    <span className="inline-block">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                    </svg>
                  </span>
                    </button>
                    <button className="btn" onClick={() => handleDelete(index)}>
                    <span className="inline-block">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18" />
                      <path d="M8 6V4h8v2" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6" />
                      <path d="M14 11v6" />
                    </svg>
                  </span>
                    </button>
                  </>
                ))}
            </td>
          </tr>
        ))}
      </tbody>
    </table>

    {editMode && (
      <div className="flex space-x-2 mt-4 justify-center">
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
        <button className="btn bg-white border-red-200" onClick={handleAddNewTerm}>
          <span><svg
  xmlns="http://www.w3.org/2000/svg"
  className="w-8 h-8 text-black cursor-pointer hover:text-gray-700"
  fill="none"
  viewBox="0 0 24 24"
  stroke="currentColor"
  role="img"
  aria-label="create study set"
>
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
</svg></span>
        </button>
      </div>
    )}
  </div>
</div>
)}
          <br></br>
          <div className="flex justify-center mt-4">
  <ButtonGroup>
    <Button
      color="alternative"
      className="m-2 text-xl px-6 py-3 bg-white hover:text-red-800"
      onClick={() => router.push("/mysets")}
    >
      Back
    </Button>
    <Button
      color="alternative"
      onClick={() => setEditMode(!editMode)}
      className={`m-2 text-xl px-6 py-3 ${editMode ? "bg-gray-200 hover:text-red-800" : "bg-white hover:text-red-800"}`}
    >
      {editMode ? "Done Editing" : "Edit"}
    </Button>
    <Button
      color="alternative"
      className="m-2 text-xl px-6 py-3 bg-white hover:text-red-800"
      onClick={() => handleShare()}
    >
      Share
    </Button>
  </ButtonGroup>
  <br></br><br></br><br></br>
</div>

<style jsx>{`
  .btn {
    padding: 6px 12px;
    background-color: gray-200;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.2s ease;
  }

  .btn:hover {
    background-color: gray-200;
    transform: scale(1.05);
  }

  .bubble-style {
    border-radius: 20px;
    padding: 40px;
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
  }

  .text-maroon {
    color: #800000;
  }
`}</style>

    </div>
  );
}
