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

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/study/details?setId=${setId}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert("Link copied to clipboard!");
    }).catch((err) => {
      console.error("Failed to copy:", err);
      alert("Failed to copy link.");
    });
  };

  useEffect(() => {
    if (!setId) return;

    const fetchSetDetails = async () => {
      try {
        const res = await fetch(`/api/sets/details?setId=${setId}`);
        if (!res.ok) throw new Error("Failed to fetch terms");

        const data = await res.json();
        setTerms(data.terms);
        setSetName(data.setName);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSetDetails();
  }, [setId]);

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
      {/* Header Section */}
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
        <h1 className="text-maroon text-5xl font-bold"  style={ {fontFamily: "cursive"} }>Set: {setName}</h1>
        {session?.user?.name && (
          <div className="text-lg text-gray-600">
            <span>{session.user.name}!</span>
          </div>
        )}
      </div>
      <br />

      <div className="mb-4 flex items-center justify-between w-full">
        <ButtonGroup>
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
            <Link href={`/study/${mode.toLowerCase()}?setId=${setId}`} className="text-2xl">
              {mode}
            </Link>
          </DropdownItem>
        ))}
          </Dropdown>
        </div>
      </div>
      <br />

      {/* Terms Table */}
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
                </tr>
              </thead>
              <tbody>
                {terms.map((term, index) => (
                  <tr key={index} className="border border-gray-300 hover:bg-gray-100">
                    <td className="p-2">{term.term}</td>
                    <td className="p-2">{term.definition}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
        .text-maroon {
          color: #800000;
        }
      `}</style>
    </div>
  );
}
