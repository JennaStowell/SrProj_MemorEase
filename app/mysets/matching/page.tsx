"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";

interface Card {
  id: string;
  text: string;
  type: "term" | "definition";
  matched: boolean;
}

export default function MatchingGame() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const setId = searchParams.get("setId");

  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [matches, setMatches] = useState(0);
  const [misses, setMisses] = useState(0);
  const [columns, setColumns] = useState(4);
  const [gameStarted, setGameStarted] = useState(false); // Track game start

  const fetchAndShuffleCards = useCallback(async () => {
    if (!setId) return;
    try {
      const res = await fetch(`/api/sets/details?setId=${setId}`);
      if (!res.ok) throw new Error("Failed to fetch terms");
      const data = await res.json();
  
      const termCards = data.terms.map((t: any) => ({
        id: `t-${t.term}`,
        text: t.term,
        type: "term",
        matched: false
      }));
      const definitionCards = data.terms.map((t: any) => ({
        id: `d-${t.term}`,
        text: t.definition.length > 30 ? t.definition.slice(0, 27) + "..." : t.definition,
        type: "definition",
        matched: false
      }));
  
      const shuffledCards = [...termCards, ...definitionCards].sort(() => Math.random() - 0.5);
      setCards(shuffledCards);
      setColumns(shuffledCards.length > 24 ? 6 : 4);
      setMatches(0);
      setMisses(0);
      setSelectedCards([]);
      setGameStarted(true);
    } catch (error) {
      console.error("Error fetching terms:", error);
    }
  }, [setId]); // ← dependency here

  useEffect(() => {
    fetchAndShuffleCards();
  }, [fetchAndShuffleCards]);
  
  useEffect(() => {
    if (!setId) {
      console.warn("Missing setId from URL");
    }
  }, [setId]);
  
  

  const handleCardClick = (card: Card) => {
    if (selectedCards.length === 2 || card.matched || selectedCards.includes(card)) return;

    const newSelected = [...selectedCards, card];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      const [first, second] = newSelected;
      if (first.type !== second.type && first.id.split("-")[1] === second.id.split("-")[1]) {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === first.id || c.id === second.id ? { ...c, matched: true } : c
            )
          );
          setMatches((m) => m + 1);
        }, 1000);

        setTimeout(() => {
          setSelectedCards([]);
        }, 1500);
      } else {
        setTimeout(() => {
          setMisses((m) => m + 1);
          setSelectedCards([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="game-container">
      <h2>Find a match!</h2>
      <div className="grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {cards.map((card) => (
          <div
            key={card.id}
            className={`card ${card.matched ? "matched" : ""} ${selectedCards.includes(card) ? "flipped" : ""}`}
            onClick={() => handleCardClick(card)}
          >
            <div className="card-inner">
              <div className="card-front">❔</div>
              <div className="card-back">{card.matched ? "✅" : card.text}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="scoreboard">
        <p>Matched: {matches}</p>
        <p>Missed Attempts: {misses}</p>
      </div>
      {gameStarted && matches * 2 === cards.length && (
        <div className="buttons">
          <button className="return-button" onClick={() => router.push("/mysets")}>
            Return to My Sets
          </button>
          <button className="play-again-button" onClick={fetchAndShuffleCards}>
            Play Again
          </button>
        </div>
      )}
      <style jsx>{`
        .game-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px;
        }
        .grid {
          display: grid;
          gap: 10px;
          margin-top: 20px;
        }
        .card {
          width: 100px;
          height: 100px;
          position: relative;
          perspective: 1000px;
          cursor: pointer;
        }
        .card-inner {
          width: 100%;
          height: 100%;
          position: absolute;
          transform-style: preserve-3d;
          transition: transform 0.5s;
        }
        .card.flipped .card-inner {
          transform: rotateY(180deg);
        }
        .card-front,
        .card-back {
          width: 100%;
          height: 100%;
          position: absolute;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          font-size: 1rem;
          backface-visibility: hidden;
          padding: 5px;
          word-wrap: break-word;
        }
        .card-front {
          background: #800000;
          color: white;
        }
        .card-back {
          background: white;
          color: black;
          transform: rotateY(180deg);
        }
        .card.matched .card-inner {
          transform: rotateY(180deg);
        }
        .card.matched .card-back {
          background: transparent;
          color: green;
          font-size: 1.5rem;
          font-weight: bold;
          cursor: default;
        }
        .scoreboard {
          margin-top: 20px;
          font-size: 1.2rem;
        }
        .buttons {
          margin-top: 20px;
          display: flex;
          gap: 10px;
        }
        .return-button,
        .play-again-button {
          padding: 10px 20px;
          font-size: 1rem;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          transition: background 0.3s;
        }
        .return-button {
          background: #0070f3;
        }
        .return-button:hover {
          background: #005bb5;
        }
        .play-again-button {
          background: #28a745;
        }
        .play-again-button:hover {
          background: #218838;
        }
      `}</style>
    </div>
  );
}
