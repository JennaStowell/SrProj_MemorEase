"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function FlashcardPage() {
  const searchParams = useSearchParams();
  const setId = searchParams.get("setId");
  const [setName, setSetName] = useState<string>("");
  const [terms, setTerms] = useState<{ term: string; definition: string }[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [seeAll, setSeeAll] = useState(false); // 👈 new state

  useEffect(() => {
    async function fetchTerms() {
      if (!setId) return;
      try {
        const res = await fetch(`/api/sets/details?setId=${setId}`);
        if (!res.ok) throw new Error("Failed to fetch terms");
        const data = await res.json();
        setTerms(data.terms);
        setSetName(data.setName);
      } catch (error) {
        console.error("Error fetching terms:", error);
      }
    }
    fetchTerms();
  }, [setId]);

  const nextCard = () => {
    setFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % terms.length);
  };

  const prevCard = () => {
    setFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + terms.length) % terms.length);
  };

  const toggleFlip = () => setFlipped((prev) => !prev);
  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded((prev) => !prev);
  };

  if (terms.length === 0) return (
    <div className="flex justify-center items-center h-64">
      <p className="text-xl text-gray-600">Loading your set...</p>
    </div>
  );

  const maxLength = 350;
  const definition = terms[currentIndex].definition;

  return (
    <div>
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          padding: "10px 20px",
          backgroundColor: "#fff",
          width: "100%",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <h1 className="text-black text-3xl font-system-ui" style={{ fontFamily: "cursive" }}>
        MemorEase
      </h1>

        <div className="flex items-center gap-4">
          {/* See All / Return button */}
          <button
            className="bg-white shadow-xl p-4 hover:text-red-900"
            onClick={() => {
              setSeeAll((prev) => !prev);
              setExpanded(false); // reset expanded when switching views
              setFlipped(false);
            }}
          >
            {seeAll ? "Return to Single View" : "See All"}
          </button>

          <Link href={`/study/details?setId=${setId}`} className="return-link">
            Exit
          </Link>
        </div>
      </div>

      {/* Main area */}
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        {!seeAll ? (
          // Single Card View
          <>
            <div
              className="flashcard-container"
              onMouseEnter={() => !expanded && toggleFlip()}
              onMouseLeave={() => !expanded && toggleFlip()}
            >
              <div className={`flashcard ${flipped ? "flipped" : ""}`}>
                <div className="flashcard-side flashcard-front">{terms[currentIndex].term}</div>
                <div className="flashcard-side flashcard-back">
                  {expanded || definition.length <= maxLength ? (
                    definition
                  ) : (
                    <>
                      {definition.slice(0, maxLength)}...
                      <button onClick={toggleExpand} className="read-more-btn">
                        Read More
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            <br />

            {/* Buttons */}
            <div className="mt-6 flex space-x-4 pb-4">
              <button onClick={prevCard} className="font-bold py-2 bg-red-900 rounded text-white border-2 border-white shadow-md px-6">←</button>
              <button onClick={nextCard} className="font-bold py-2 bg-red-900 rounded text-white border-2 border-white shadow-md px-6">→</button>
            </div>

            <div className="mt-4 p-1 shadow-md">
              <button onClick={toggleFlip} aria-label="Flip card">
              ↺
              </button>
            </div>
          </>
        ) : (
          // See All View
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {terms.map((term, index) => (
              <div
                key={index}
                className="flashcard-container"
                onMouseEnter={(e) => {
                  const card = e.currentTarget.querySelector(".flashcard");
                  if (card) card.classList.add("flipped");
                }}
                onMouseLeave={(e) => {
                  const card = e.currentTarget.querySelector(".flashcard");
                  if (card) card.classList.remove("flipped");
                }}
              >
                <div className="flashcard">
                  <div className="flashcard-side flashcard-front">{term.term}</div>
                  <div className="flashcard-side flashcard-back">
                    {term.definition.length <= maxLength ? (
                      term.definition
                    ) : (
                      <>
                        {term.definition.slice(0, maxLength)}...
                        {/* No "read more" button in all view */}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Styles */}
      <style jsx>{`
        .return-link {
          font-size: 1.2rem;
          color: #800000;
          text-decoration: none;
          font-weight: bold;
        }
        .return-link:hover {
          text-decoration: underline;
        }
        .flashcard-container {
          perspective: 1000px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .flashcard {
          width: 500px;
          height: 300px;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.5s;
        }
        .flipped {
          transform: rotateY(180deg);
        }
        .flashcard-side {
          position: absolute;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          text-align: center;
          background: white;
          border: 2px solid white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          font-size: clamp(1rem, 2vw, 1.3rem);
          font-weight: bold;
          backface-visibility: hidden;
          overflow-wrap: break-word;
          overflow-y: auto;
          flex-direction: column;
        }
        .flashcard-back {
          transform: rotateY(180deg);
          background: white;
          color: black;
        }
        .btn {
          padding: 10px 20px;
          font-size: 1.1rem;
          background-color: #800000;
          color: white;
          border-radius: 6px;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }
        .btn:hover {
          background-color: #b30000;
        }
        .read-more-btn {
          margin-top: 10px;
          padding: 5px 10px;
          background-color: #800000;
          color: white;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1rem;
          transition: background-color 0.3s ease;
        }
        .read-more-btn:hover {
          background-color: #b30000;
        }
      `}</style>
    </div>
  );
}
