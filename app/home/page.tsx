'use client';

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Set {
  set_id: number;
  set_name: string;
  user_id: string;
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [allSets, setAllSets] = useState<Set[]>([]);
  const [randomSets, setRandomSets] = useState<Set[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSets = async () => {
      try {
        const res = await fetch("/api/sets?userId=" + session?.user?.id); // Fetch all sets for the user
        if (!res.ok) throw new Error("Failed to fetch sets");
        const data = await res.json();
        setAllSets(data);
      } catch (err) {
        console.error("Error loading sets:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (status === "unauthenticated") {
      router.push("/api/auth/signin");
    } else if (status === "authenticated") {
      fetchSets();
    }
  }, [status, session, router]);

  // Randomly select a few sets from the allSets array
  useEffect(() => {
    if (allSets.length > 0) {
      const shuffled = [...allSets].sort(() => 0.5 - Math.random());
      const randomSelection = shuffled.slice(0, 4); // Select 4 random sets
      setRandomSets(randomSelection);
    }
  }, [allSets]);

  if (status === "loading" || isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-xl text-gray-600">Loading sets...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      {/* Top Navigation */}
      <div 
        style={{
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', 
          padding: '10px 20px', 
          backgroundColor: '#fff',
        }}
      >
        <h1 style={{ fontFamily: 'cursive', fontSize: '36px' }}>Memorease</h1>
        <div>
          <span>{session?.user?.name}</span>
          <form action="/api/auth/signout" method="POST" style={{ display: 'inline' }}>
            <button type="submit" style={{ marginLeft: '15px' }}>Log out</button>
          </form>
        </div>
      </div>
      <br />

      <div className="mt-10">
        <Link href="/mysets"><h2 className="text-4xl font-semibold text-red-900 mb-4">Study My Sets</h2></Link> <br></br>
        {randomSets.length === 0 ? (
          <p className="text-gray-600">No sets available yet. Try creating one!</p>
        ) : (
          <div className="flex gap-4 flex-wrap">
            {randomSets.map((set) => (
              <Link key={set.set_id} href={`/mysets/details?setId=${set.set_id}`}>
                <div className="relative w-32 h-32 perspective">
                  <div className="flip-card">
                    <div className="flip-card-inner">
                      <div className="flip-card-front flex items-center justify-center bg-gray-200 border border-gray-400 rounded-md text-center px-2">
                        <span className="text-sm font-semibold">{set.set_name}</span>
                      </div>
                      <div className="flip-card-back flex items-center justify-center bg-red-100 border border-red-400 rounded-md">
                        <span className="text-sm text-red-800 font-semibold">Click to Study</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            {/* "See more" link */}
            <Link href="/mysets" className="ml-4 self-center text-blue-600 font-semibold">
              ...see more
            </Link>
          </div>
        )}
      </div>

      {/* Public Sets Section */}
      <div>
        <br /><br /><br />
        <h2 className="text-4xl font-semibold text-red-900 mb-4">Public Sets</h2> <br></br>

        {/* Placeholder Image Boxes with flip effect */}
        <div style={{ display: 'flex', gap: '20px' }}>
          {[...Array(3)].map((_, index) => (
            <div key={index} className="relative w-32 h-32 perspective">
              <div className="flip-card">
                <div className="flip-card-inner">
                  <div className="flip-card-front flex items-center justify-center bg-gray-200 border border-gray-400 rounded-md text-center px-2">
                    <span className="text-sm font-semibold">Public Set {index + 1}</span>
                  </div>
                  <div className="flip-card-back flex items-center justify-center bg-red-100 border border-red-400 rounded-md">
                    <span className="text-sm text-red-800 font-semibold">Click to Study</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <Link href="/mysets" className="ml-4 self-center text-blue-600 font-semibold">
              ...see more
            </Link>
        </div>
      </div>
      
      <style jsx>{`
        .perspective {
          perspective: 1000px;
        }
        .flip-card {
          width: 100%;
          height: 100%;
        }
        .flip-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          text-align: center;
          transition: transform 0.6s;
          transform-style: preserve-3d;
        }
        .flip-card:hover .flip-card-inner {
          transform: rotateY(180deg);
        }
        .flip-card-front,
        .flip-card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .flip-card-back {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}
