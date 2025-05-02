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
  const [sharedSets, setSharedSets] = useState<{ shared_name: string; link: string }[]>([]);
const [randomSharedSets, setRandomSharedSets] = useState<{ shared_name: string; link: string }[]>([]);


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

  useEffect(() => {
    const fetchSharedSets = async () => {
      try {
        const res = await fetch("/api/shared");
        if (!res.ok) throw new Error("Failed to fetch shared sets");
        const data = await res.json();
        setSharedSets(data);
      } catch (err) {
        console.error("Error loading shared sets:", err);
      }
    };
  
    fetchSharedSets();
  }, []);

  useEffect(() => {
    if (sharedSets.length > 0) {
      const shuffled = [...sharedSets].sort(() => 0.5 - Math.random());
      setRandomSharedSets(shuffled.slice(0, 3));
    }
  }, [sharedSets]);
  

  if (status === "loading" || isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-xl text-gray-600">Loading sets...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
  <main className="flex-grow px-5 py-5">
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
        <h1 style={{ fontFamily: 'cursive', fontSize: '36px' }}>MemorEase</h1>

        {/* Right section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span>{session?.user?.name}</span>

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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </Link>

          <form action="/api/auth/signout" method="POST">
  <button type="submit" aria-label="Log out">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-8 h-8 text-black cursor-pointer hover:text-gray-700 border-1 border-white shadow-sm"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"
      />
    </svg>
  </button>
</form>
        </div>
      </div>
    </div>

          <br />
  
          <div className="mt-10">
            <Link href="/mysets">
              <h2 className="text-4xl font-system-ui text-red-900 mb-4 flex justify-center">
                Study My Sets
              </h2>
            </Link> 
            <br />
            <div className="flex justify-center">
              {randomSets.length === 0 ? (
                <p className="text-gray-600">
                  No sets available yet. <span className="underline text-blue-500"><Link href='/create'>Try creating one!</Link></span>
                </p>
              ) : (
                <div className="flex gap-4 flex-wrap">
                  {randomSets.map((set) => (
                    <Link key={set.set_id} href={`/mysets/details?setId=${set.set_id}`}>
                      <div className="relative w-50 h-50 perspective">
                        <div className="flip-card">
                          <div className="flip-card-inner">
                            <div className="flip-card-front flex items-center justify-center bg-white border border-white rounded-md text-center shadow-xl px-2">
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
  
                  <Link href="/mysets">
                    <div className="relative w-50 h-50 perspective">
                      <div className="flip-card">
                        <div className="flip-card-inner">
                          <div className="flip-card-front flex items-center justify-center bg-white border border-white rounded-md text-center shadow-xl px-2">
                            <span className="text-sm font-semibold text-red-800">...see all</span>
                          </div>
                          <div className="flip-card-back flex items-center justify-center bg-red-100 border border-red-400 rounded-md">
                            <span className="text-sm text-red-800 font-semibold">View All Sets</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </div>
  
          {/* Shared with me Section */}
          <div>
            <br /><br /><br />
            <div className="flex justify-center">
              <h2 className="text-4xl font-system-ui text-red-900 mb-4 pb-5">Shared With Me</h2>
            </div>
            <div className="flex justify-center" style={{ display: 'flex', gap: '20px' }}>
  {randomSharedSets.map((set, index) => (
    <Link key={index} href={set.link}>
      <div className="relative w-50 h-50 perspective">
        <div className="flip-card">
          <div className="flip-card-inner">
            <div className="flip-card-front flex items-center justify-center bg-white border border-white rounded-md shadow-xl text-center px-2">
              <span className="text-sm font-semibold">{set.shared_name}</span>
            </div>
            <div className="flip-card-back flex items-center justify-center bg-red-100 border border-red-400 rounded-md">
              <span className="text-sm text-red-800 font-semibold">Click to Study</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  ))}
  <Link href="/shared">
    <div className="relative w-50 h-50 perspective">
      <div className="flip-card">
        <div className="flip-card-inner">
          <div className="flip-card-front flex items-center justify-center bg-white border border-white rounded-md text-center shadow-xl px-2">
            <span className="text-sm font-semibold text-red-800">...see all</span>
          </div>
          <div className="flip-card-back flex items-center justify-center bg-red-100 border border-red-400 rounded-md">
            <span className="text-sm text-red-800 font-semibold">View All Sets</span>
          </div>
        </div>
      </div>
    </div>
  </Link>
</div>
</div>
      </main>
  
      {/* Footer */}
      <footer className="bg-gray-100 text-gray-800 p-2">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          <div className="flex items-center space-x-3">
            <img src='images/MemorEase_Logo_NoWords.png' alt="Memorease Logo" className="h-10 w-10 object-contain" />
            <span className="text-1xl font-system-ui text-black">Memorease</span>
          </div>
          <div className="text-center md:text-left text-sm text-gray-700">
            <p>Created by Jenna Stowell</p>
            <p>www.linkedin.com/in/jenna-m-stowell</p>
          </div>
          <div className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Memorease. All rights reserved.
          </div>
        </div>
      </footer>

  
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