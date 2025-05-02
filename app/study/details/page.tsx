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
        setOwnerId(data.userId);
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
      router.push("/mysets");
    }
  }, [ownerId, session, router]);

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/study/details?setId=${setId}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert("Link copied to clipboard!");
    }).catch((err) => {
      console.error("Failed to copy:", err);
      alert("Failed to copy link.");
    });
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
        <Link href="/shared">
          <h1 style={{ fontFamily: "cursive", fontSize: "36px" }}>MemorEase</h1>
        </Link>
        {session?.user?.name && (
          <div className="text-lg text-gray-600">
            <span>{session.user.name}!</span>
          </div>
        )}
      </div>
      <br />
      <h1 className="text-maroon text-5xl font-system-ui">Set: {setName}</h1>

      <div className="flex justify-between mb-4">
        <div className="ml-4">
          <br />
          <Dropdown label={<span className="text-1xl">Study Modes</span>} dismissOnClick={false} color="alternative" className="hover:text-red-800">
            {["Flashcards", "Study", "Test", "Matching"].map((mode) => (
              <DropdownItem key={mode} className="text-5xl py-6 px-6">
                <Link href={`/study/${mode.toLowerCase()}?setId=${setId}`} className="text-2xl">
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
          <div className="rounded-lg shadow-lg p-6 w-full max-w-4xl bg-white bubble-style">
            <table className="w-full border-collapse border-2 border-white shadow-sm">
              <tbody>
                {terms.map((term, index) => (
                  <tr key={index} className="group hover:bg-gray-100">
                    <td className="p-4 text-center text-xl border-t border-b border-2 border-white shadow-sm">
                      {term.term}
                    </td>
                    <td className="p-4 text-center text-xl border-2 border-white shadow-sm">
                      {term.definition}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <br />
      <div className="flex justify-center mt-4">
        <ButtonGroup>
          <Button
            color="alternative"
            className="m-2 text-xl px-6 py-3 bg-white hover:text-red-800"
            onClick={() => router.push("/shared")}
          >
            Back
          </Button>
          <Button
            color="alternative"
            className="m-2 text-xl px-6 py-3 bg-white hover:text-red-800"
            onClick={handleShare}
          >
            Share
          </Button>
        </ButtonGroup>
      </div>
      <br /><br /><br />

      <style jsx>{`
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
