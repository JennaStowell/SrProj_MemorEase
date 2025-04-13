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
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserSets = useCallback(async () => {
    if (!session?.user?.id) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/sets?userId=${session.user.id}`);
      if (!res.ok) throw new Error("Failed to fetch user sets");
      const data = await res.json();
      setSets(data);
    } catch (err) {
      console.error("Error fetching sets:", err);
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

  const handleDeleteSet = async (setId: number) => {
    if (!session?.user?.id) return;
    const confirmDelete = confirm("Are you sure you want to delete this set?");
    if (!confirmDelete) return;

    try {
      const res = await fetch("/api/sets", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ setId, userId: session.user.id }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Error deleting set:", errorData.error || "Unknown error");
        return;
      }

      setSets((prev) => prev.filter((set) => set.set_id !== setId));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-xl text-gray-600">Loading your sets...</p>
      </div>
    );
  }

  return (
    <div className="p-6 w-full">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", // Add shadow under the navbar
          padding: "10px 20px", // Added some padding for better appearance
          backgroundColor: "#fff", // Optional: set a background color
          width: "100%", // Ensures the container takes full width
        }}
      >
        <Link href="/">
          <h1 style={{ fontFamily: "cursive", fontSize: "36px" }}>Memorease</h1>
        </Link>
  
        {/* Centered 'My Sets' */}
        <h1 className="text-6xl font-bold text-maroon mx-auto">My Sets</h1>
  
        {/* Create emoticon on the right */}
        <Link href="/create">
        <span className="text-4xl cursor-pointer" role="img" aria-label="create study set">
  ➕
</span>

        </Link>
      </div>
      {sets.length === 0 ? (
        <p className="text-center text-gray-600">You haven&apos;t created any sets yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sets.map((set) => (
            <div
              key={set.set_id}
              className="relative bg-white shadow-md rounded-lg p-4 group flex items-center justify-between"
            >
              <Link href={`/mysets/details?setId=${set.set_id}`} passHref>
                <span className="text-xl font-medium cursor-pointer hover:underline">
                  {set.set_name}
                </span>
              </Link>

              <button
                onClick={() => handleDeleteSet(set.set_id)}
                className="text-red-600 hover:text-red-800 transition-colors duration-200 opacity-0 group-hover:opacity-100"
                aria-label="Delete set"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .text-maroon {
          color: #800000;
        }
      `}</style>
    </div>
  );
}
