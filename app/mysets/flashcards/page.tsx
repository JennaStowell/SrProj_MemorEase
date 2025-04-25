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
    setFlipped(false); // Reset flip state when moving to next card
    setCurrentIndex((prev) => (prev + 1) % terms.length);
  };

  const prevCard = () => {
    setFlipped(false); // Reset flip state when moving to previous card
    setCurrentIndex((prev) => (prev - 1 + terms.length) % terms.length);
  };

  const toggleFlip = () => setFlipped((prev) => !prev);

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card flip from being triggered when clicking "Read More"
    setExpanded((prev) => !prev);
  };

  if (terms.length === 0) return (
    <div className="flex justify-center items-center h-64">
      <p className="text-xl text-gray-600">Loading your set...</p>
    </div>
  );

  const maxLength = 350; // Maximum length of text to display before "Read More"
  const definition = terms[currentIndex].definition;

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
          position: "sticky",  
          top: 0,
          zIndex: 10,  
        }}
      >
        <h1 className="text-red-900 text-5xl font-bold" style={{ fontFamily: "cursive" }}>
          Set: {setName}
        </h1>

        <div className="text-lg text-gray-600">
          <Link href={`/mysets/details?setId=${setId}`} className="return-link">
            Exit 
          </Link>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div
        className="flashcard-container"
        onMouseEnter={() => !expanded && toggleFlip()} // Prevent flip if expanded
        onMouseLeave={() => !expanded && toggleFlip()} // Prevent flip if expanded
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
      <br></br>

      <div className="mt-6 flex space-x-4">
        <button onClick={prevCard} className="btn">← Previous</button>
        <button onClick={nextCard} className="btn">Next →</button>
      </div>

      <div className="mt-4">
        <button onClick={toggleFlip} aria-label="Flip card">
            🔄
        </button>
        </div>

        </div>

      <style jsx>{`
        .return-link {
        position: absolute;
        top: 20px;
        left: 20px;
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
        }
        .flashcard {
          width: 400px; /* Increased width */
          height: 250px; /* Increased height */
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
          padding: 20px; /* Increased padding */
          text-align: center;
          background: white;
          border: 2px solid #800000;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          font-size: clamp(1rem, 2vw, 1.5rem);
          font-weight: bold;
          backface-visibility: hidden;
          word-wrap: break-word;
          overflow-wrap: break-word;
          overflow-y: auto; /* Enables scrolling if needed */
          padding-bottom: 20px; /* Set default padding */
          padding-top: 20px; /* Set default padding */
          flex-direction: column; /* Makes the definition scrollable while keeping the card layout intact */
        }
        .flashcard-back {
          transform: rotateY(180deg);
          background: white;
          color: black;
          overflow-y: auto;
          max-height: 100%; /* Ensure the back card doesn’t overflow */
          display: flex;
          flex-direction: column;
          justify-content: flex-start; /* Align top of definition */
        }
        .btn {
          padding: 12px 24px; /* Slightly larger buttons */
          font-size: 1.2rem;
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

        /* New styles for the flip button */
        .flip-btn {
          padding: 8px 16px;
          font-size: 1rem;
          background-color: #d3d3d3; /* Gray background */
          color: black;
          border-radius: 6px;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }
        .flip-btn:hover {
          background-color: #a8a8a8; /* Darker gray on hover */
        }
      `}</style>
    </div>
  );
}