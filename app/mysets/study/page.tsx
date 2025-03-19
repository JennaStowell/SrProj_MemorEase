"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function StudyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const setId = searchParams.get("setId");

  const [chunkedSets, setChunkedSets] = useState<{ term: string; definition: string }[][]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentChunk, setCurrentChunk] = useState(0);
  const [currentTermIndex, setCurrentTermIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | "">("");
  const [attempts, setAttempts] = useState<{ [key: string]: number }>({});
  const [completedChunks, setCompletedChunks] = useState<number[]>([]);
  const [score, setScore] = useState<{ [key: string]: { correct: number; wrong: number } }>({});
  const [chunkStarted, setChunkStarted] = useState(false);
  const [correctCount, setCorrectCount] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    if (!setId) {
      router.push("/mysets");
      return;
    }

    const fetchTerms = async () => {
      try {
        const res = await fetch(`/api/sets/${setId}`);
        if (!res.ok) throw new Error("Failed to fetch terms");
        const data = await res.json();

        const shuffledTerms = [...data.terms].sort(() => Math.random() - 0.5);
        const chunkSize = Math.ceil(shuffledTerms.length / 4);
        const chunks = [];
        for (let i = 0; i < shuffledTerms.length; i += chunkSize) {
          chunks.push(shuffledTerms.slice(i, i + chunkSize));
        }

        setChunkedSets(chunks);
      } catch (error) {
        console.error("Error fetching study set:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTerms();
  }, [setId, router]);

  const handleSubmit = () => {
    const currentTerm = chunkedSets[currentChunk][currentTermIndex];
    if (!currentTerm) return;
    const normalizedInput = userInput.trim().toLowerCase();
    const correctAnswer = currentTerm.term.toLowerCase();

    if (normalizedInput === correctAnswer) {
        setFeedback("correct");
        setCorrectCount((prev) => ({
          ...prev,
          [currentTerm.term]: (prev[currentTerm.term] || 0) + 1,
        }));
      
        setScore((prev) => ({
          ...prev,
          [currentTerm.term]: {
            correct: (prev[currentTerm.term]?.correct || 0) + 1,
            wrong: prev[currentTerm.term]?.wrong || 0,
          },
        }));
      
        setTimeout(() => {
          setFeedback("");
          setUserInput("");
          if (correctCount[currentTerm.term] + 1 >= 2) {
            setCurrentTermIndex((prev) => prev + 1);
          }
        }, 1000);
      } else {
        setFeedback("incorrect");
        setAttempts((prev) => ({
          ...prev,
          [currentTerm.term]: (prev[currentTerm.term] || 0) + 1,
        }));
      
        setScore((prev) => ({
          ...prev,
          [currentTerm.term]: {
            correct: prev[currentTerm.term]?.correct || 0,
            wrong: (prev[currentTerm.term]?.wrong || 0) + 1,
          },
        }));
      }      
  };

  useEffect(() => {
    if (
      chunkStarted &&
      chunkedSets.length > 0 &&
      currentTermIndex >= chunkedSets[currentChunk].length
    ) {
      setCompletedChunks([...completedChunks, currentChunk]);
      setScore((prev) => ({
        ...prev,
        [currentChunk]: Object.values(attempts).reduce((a, b) => a + b, 0),
      }));
      setCurrentChunk((prev) => prev + 1);
      setCurrentTermIndex(0);
      setAttempts({});
      setCorrectCount({});
      setChunkStarted(false);
    }
  }, [currentTermIndex, chunkedSets, currentChunk, completedChunks, attempts, chunkStarted]);

  if (currentChunk >= chunkedSets.length) return (
    <>
      <h2>Great job! See how you did: </h2>
      {chunkedSets.flat().map(({ term }) => (
        <p key={term}>
          {term}: {score[term]?.correct || 0}/{(score[term]?.correct || 0) + (score[term]?.wrong || 0)} 
          {score[term]?.wrong ? ` - Wrong ${score[term]?.wrong} time(s)` : ""}
        </p>
      ))}
      <br></br>
      <Link href='/mysets'>
  <button className="mt-4 p-2 bg-gray-200 rounded hover:bg-gray-300">
    Back to My Set
  </button>
</Link>

    </>
  );
  

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-maroon text-4xl font-bold mb-4 text-center">Study Session</h1>
      {!chunkStarted ? (
        <button
          onClick={() => setChunkStarted(true)}
          className="p-2 bg-green-500 text-white rounded"
        >
          Start Chunk {currentChunk + 1}
        </button>
      ) : !completedChunks.includes(currentChunk) ? (
        <>
          <h2 className="text-lg font-bold">Chunk {currentChunk + 1}</h2>
          <p className="mb-2">Definition: {chunkedSets[currentChunk][currentTermIndex]?.definition}</p>
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => {
                if (e.key === "Enter") {
                handleSubmit();
                }
            }}
            className="border p-2 rounded w-full"
            />
          <button onClick={handleSubmit} className="mt-2 p-2 bg-blue-500 text-white rounded">
            Submit
          </button>
          {feedback === "correct" && <p className="text-green-500">Correct!</p>}
          {feedback === "incorrect" && <p className="text-red-500">Try again!</p>}
        </>
      ) : (
        <div>
          <p>Chunk {currentChunk + 1} completed!</p>
          {/* <p> {currentTerm.term}: {score[currentTerm.term]?.correct || 0}/{score[currentTerm.term]?.correct + (score[currentTerm.term]?.wrong || 0)} - Wrong {score[currentTerm.term]?.wrong || 0} time(s)</p> */}
          {chunkedSets[currentChunk]?.map(({ term }) => (
            <p key={term}>
                {term}: {score[term]?.correct || 0}/{(score[term]?.correct || 0) + (score[term]?.wrong || 0)} 
                {score[term]?.wrong ? ` - Wrong ${score[term]?.wrong} time(s)` : ""}
            </p>
            ))}

          <button
            onClick={() => setChunkStarted(true)}
            className="p-2 bg-gray-500 text-white rounded"
          >
            Start Chunk {currentChunk + 2}
          </button>
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
