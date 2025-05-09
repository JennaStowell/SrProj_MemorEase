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
          <h1 style={{ fontFamily: "cursive", fontSize: "36px" }}>MemorEase</h1>
        </Link>
  
       
  
        
        <Link href="/create">
          <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-8 h-8 text-black cursor-pointer hover:text-gray-700 border-1 border-white shadow-sm "
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          role="img"
          aria-label="create study set"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        </Link>
      </div>
      <br></br> 
      <h2 className="text-5xl font-system-ui text-red-900 mb-4 flex justify-center">
                My Sets
              </h2>
      <br></br> <br></br>

      {sets.length === 0 ? (
  <p className="text-center text-gray-600">You haven&apos;t created any sets yet.</p>
) : (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
    {sets.map((set) => (
      <Link
        key={set.set_id}
        href={`/mysets/details?setId=${set.set_id}`}
        passHref
        className="group relative bg-white shadow-xl rounded-lg p-6 flex items-center justify-center text-center h-48 cursor-pointer transition-transform hover:scale-105"
      >
        <span className="text-xl font-semibold break-words text-gray-700">
          {set.set_name}
        </span>
        
        <button
          onClick={(e) => {
            e.preventDefault(); 
            handleDeleteSet(set.set_id);
          }}
          className="absolute top-3 right-3 text-red-600 hover:text-red-800 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          aria-label="Delete set"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </Link>
    ))}
  </div>
)}

<style jsx>{`
  .text-maroon {
    color: #800000;
  }

  .group:hover .text-maroon {
    color: #800000;
  }

  .grid {
    display: grid;
    gap: 1.5rem;
  }

  /* Card adjustments */
  .group {
    position: relative;
    background-color: white;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border-radius: 1rem;
    padding: 1.5rem;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    height: 12rem;
    cursor: pointer;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  .group:hover {
    transform: scale(1.05);
    box-shadow: 0 8px 10px rgba(0, 0, 0, 0.15);
  }

  .group span {
    font-size: 1.125rem;
    color: #2d2d2d;
    word-wrap: break-word;
  }

  .group button {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .group:hover button {
    opacity: 1;
  }
`}</style>

    </div>
  );
}
