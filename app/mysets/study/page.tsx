"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import jsPDF from "jspdf";
import { useSession } from "next-auth/react";

export default function StudyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const setId = searchParams.get("setId");
  const { data: session } = useSession();
  const username = session?.user?.name || "Anonymous";
  const [setName, setSetName] = useState<string>(""); 

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
  const [logoBase64, setLogoBase64] = useState<string>('');

useEffect(() => {
  const loadLogo = async () => {
    const imagePath = '/images/MemorEase_Logo.png';
    const response = await fetch(imagePath);
    const imageBlob = await response.blob();
    const base64Image = await blobToBase64(imageBlob);
    setLogoBase64(base64Image);
  };
  loadLogo();
}, []);

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};


  useEffect(() => {
    if (!setId) {
      router.push("/mysets");
      return;
    }

    const fetchTerms = async () => {
      try {
        const res = await fetch(`/api/sets/details?setId=${setId}`);
        if (!res.ok) throw new Error("Failed to fetch terms");
        const data = await res.json();
        setSetName(data.setName);
        

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
  
  const generatePDF = () => {
    if (!logoBase64) return;
  
    const doc = new jsPDF('p', 'pt');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;
    let currentY = margin;
  
    const certificateId = Math.random().toString(36).substring(2, 10).toUpperCase();
  
    const img = new Image();
    img.src = logoBase64;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        console.error("Failed to get 2D context for canvas");
        return;
      }
  
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.globalAlpha = 0.5;
      ctx.drawImage(img, 0, 0);
      const adjustedLogoBase64 = canvas.toDataURL("image/png");
  
      const logoX = pageWidth - 180;
      const logoY = 30;
      const logoWidth = 150;
      const logoHeight = 85;
  
      doc.addImage(adjustedLogoBase64, 'PNG', logoX, logoY, logoWidth, logoHeight);
  
      doc.setFont('courier');
      doc.setFontSize(24);
      doc.setTextColor(40);
      doc.text("Study Mode Certificate", pageWidth / 2, currentY, { align: 'center' });
      currentY += 30;
  
      doc.setFont('Times');
      doc.setFontSize(12);
      doc.text(`User: ${username}`, margin, currentY);
      currentY += 20;
      doc.text(`Set: ${setName}`, margin, currentY);
      currentY += 30;
  
      doc.setFont('Times', 'Bold');
      doc.text("Results:", margin, currentY);
      doc.setFont('Times', 'Normal');
      currentY += 20;
  
      const allTerms = chunkedSets.flat();
      allTerms.forEach(({ term }, index) => {
        const correct = score[term]?.correct || 0;
        const wrong = score[term]?.wrong || 0;
        const total = correct + wrong;
        const resultLine = `${index + 1}. ${term} — ${correct}/${total} correct`;
  
        const lines = doc.splitTextToSize(resultLine, pageWidth - margin * 2);
        const blockHeight = lines.length * doc.getFontSize() * doc.getLineHeightFactor();
  
        if (currentY + blockHeight > pageHeight - margin) {
          addFooter(doc);
          doc.addPage();
          currentY = margin;
        }
  
        doc.text(lines, margin, currentY);
        currentY += blockHeight + 10;
      });
  
      addFooter(doc);
      doc.save(`${username}_study_certificate.pdf`);
  
      function addFooter(doc: jsPDF) {
        doc.setFontSize(10);
        doc.setTextColor(150);
        const footerY = pageHeight - 20;
        doc.text(`Certificate ID: ${certificateId}`, margin, footerY);
        doc.text("Generated by MemorEase", pageWidth - margin, footerY, { align: 'right' });
        doc.setFontSize(12);
        doc.setTextColor(0);
      }
    };
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

  if (!isLoading && currentChunk >= chunkedSets.length)
    return (
      <div className="flex flex-col items-center mt-24 text-center px-6">
        <div className="border-2 border-white shadow-2xl py-8 px-60">
        <h2 className="text-4xl font-system-ui text-gray-800 mb-8">Performance Breakdown</h2><br></br><br></br>
  
        <div className="w-full max-w-2xl space-y-8 shadow-2xl rounded">
          {chunkedSets.flat().map(({ term }) => {
            const correct = score[term]?.correct || 0;
            const wrong = score[term]?.wrong || 0;
            const total = correct + wrong;
            const isCorrect = correct === total && total > 0;
  
            return (
              <div
                key={term}
                className="bg-white shadow-md rounded-xl px-6 py-4 flex justify-between items-start border-l-4"
                style={{
                  borderColor: isCorrect ? "#16a34a" : "#b91c1c", 
                }}
              >
                <div>
                  <p className="text-lg font-semibold text-gray-700">{term}</p>
                  <p className="text-md text-gray-600">
                    <span className={isCorrect ? "text-green-600" : "text-red-600 font-medium"}>
                      {correct}/{total > 0 ? total : ""}
                    </span>
                    {wrong > 0 && (
                      <span className="ml-2 text-red-700 font-medium">
                        — Wrong {wrong} {wrong === 1 ? "time" : "times"}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <br></br>
  
        <div className="mt-10 flex flex-wrap gap-4">
          {!isLoading && (
            <button
              onClick={generatePDF}
              className="px-6 py-3 bg-white text-black font-system-ui rounded-lg shadow-xl hover:bg-purple-200 transition focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              Download Certificate
            </button>
          )}
  
          <Link href={`/mysets/details?setId=${setId}`}>
            <button className="px-6 py-3 bg-white text-black font-system-ui rounded-lg shadow-xl hover:bg-gray-300 transition focus:outline-none focus:ring-2 focus:ring-gray-500">
              Back to My Set
            </button>
          </Link>
          </div>
        </div>
      </div>
      
    );

  return (
    <div className="min-h-screen w-full bg-white ">
      <nav><div
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
      <Link href={`/mysets/details?setId=${setId}`} className="text-gray-200 underline">
        Exit
      </Link>
    </div></nav><br></br> <br></br>

  <div className="w-full flex justify-center p-6 ">
  <div className="max-w-3xl w-full border-2 rounded-2xl border-white shadow-xl p-6">
    
    <h1 className="text-maroon text-4xl font-system-ui mb-4 text-center">Study Session</h1><br></br>
    <Suspense fallback={<div>Loading...</div>}>
      {!chunkStarted ? (
        <div className="flex flex-col items-center space-y-6 mt-8">
          <h2 className="text-xl text-center p-4 rounded bg-white">
            We&rsquo;ve chunked your study set into four sections. Get each term correct twice to move on!
          </h2>
          <br></br>
          <button
            onClick={() => setChunkStarted(true)}
            className="p-2 px-6 bg-green-500 text-white rounded shadow hover:bg-green-600 transition"
          >
            Start Chunk {currentChunk + 1}
          </button>
        </div>
      ) : !completedChunks.includes(currentChunk) ? (
          <>
            <h2 className="text-lg font-bold">Section {currentChunk + 1}:</h2><br></br>
            {chunkedSets[currentChunk] && chunkedSets[currentChunk][currentTermIndex] ? (
  <p className="mb-2 text-2xl">
    Definition: {chunkedSets[currentChunk][currentTermIndex].definition}
  </p>
) : (
  <p className="mb-2 text-gray-500 italic">Loading term...</p>
)}


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
            <button onClick={handleSubmit} className="mt-2 p-2 bg-red-800 text-white rounded">
              Submit
            </button>
            {feedback === "correct" && <p className="text-green-500">Correct!</p>}
            {feedback === "incorrect" && <p className="text-red-500">Try again!</p>}
          </>
        ) : (
          <div>
            <p>Section {currentChunk + 1} completed!</p>
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
              Start Section {currentChunk + 2}
            </button>
          </div>
        )}
      </Suspense>
      <br></br><br></br>
      <h2 className="text1x1 text-gray-400">Progress...</h2>
      <div className="w-full bg-gray-200 rounded-full h-4 mt-6">
  <div
    className="bg-green-500 h-4 rounded-full transition-all duration-500"
    style={{ width: `${(completedChunks.length / 4) * 100}%` }}
  />
</div>
      </div>
      <style jsx>{`
        .text-maroon {
          color: #800000;
        }
      `}</style>
    </div>
    </div>
  );
}
