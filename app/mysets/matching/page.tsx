"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";

interface Card {
  id: string; // unique card ID
  pairId: string; // shared between matching term/definition
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
  const [gameStarted, setGameStarted] = useState(false);

  const fetchAndShuffleCards = useCallback(async () => {
    if (!setId) return;

    try {
      const res = await fetch(`/api/sets/details?setId=${setId}`);
      if (!res.ok) throw new Error("Failed to fetch terms");
      const data = await res.json();

      const pairs: Card[] = [];

      data.terms.forEach((t: any) => {
        const pairId = uuidv4();
        pairs.push(
          {
            id: uuidv4(),
            pairId,
            text: t.term,
            type: "term",
            matched: false
          },
          {
            id: uuidv4(),
            pairId,
            text: t.definition.length > 30 ? t.definition.slice(0, 27) + "..." : t.definition,
            type: "definition",
            matched: false
          }
        );
      });

      const shuffled = pairs.sort(() => Math.random() - 0.5);

      setCards(shuffled);
      setColumns(shuffled.length > 24 ? 6 : 4);
      setMatches(0);
      setMisses(0);
      setSelectedCards([]);
      setGameStarted(true);
    } catch (error) {
      console.error("Error fetching terms:", error);
    }
  }, [setId]);

  useEffect(() => {
    fetchAndShuffleCards();
  }, [fetchAndShuffleCards]);

  const handleCardClick = (card: Card) => {
    if (selectedCards.length === 2 || card.matched || selectedCards.includes(card)) return;

    const newSelected = [...selectedCards, card];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      const [first, second] = newSelected;

      const isMatch = first.pairId === second.pairId && first.type !== second.type;

      if (isMatch) {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.pairId === first.pairId ? { ...c, matched: true } : c
            )
          );
          setMatches((m) => m + 1);
          setSelectedCards([]);
        }, 1000);
      } else {
        setTimeout(() => {
          setMisses((m) => m + 1);
          setSelectedCards([]);
        }, 1000);
      }
    }
  };

  return (
    <div>
      <nav>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            padding: "10px 20px",
            backgroundColor: "#fff",
            width: "100%",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <h1 className="text-black text-3xl" style={{ fontFamily: "cursive" }}>
            MemorEase{" "}
            <span className="font-mono text-3xl text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-700 to-red-900">
              Play
            </span>
          </h1>
          <Link href={`/mysets/details?setId=${setId}`} className="text-gray-200 underline">
            Exit
          </Link>
        </div>
      </nav>
      <br /><br />
      <div className="game-container">
        <h2>Find a match!</h2>
        <div className="grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {cards.map((card, index) => (
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
            <button className="return-button" onClick={() => router.push(`/mysets/details?setId=${setId}`)}>
              Return to My Set
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
            width: 150px;
            height: 150px;
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
            color: black;
            background-color: white;
            box-shadow: 0 10px 15px rgba(0, 0, 0, 0.15);
            border: none;
            border-radius: 5px;
            cursor: pointer;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          .return-button:hover,
          .play-again-button:hover {
            transform: translateY(-5px) scale(1.05);
            box-shadow: 0 20px 25px rgba(0, 0, 0, 0.2);
          }
        `}</style>
      </div>
    </div>
  );
}
