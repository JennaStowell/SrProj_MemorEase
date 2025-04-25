"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { jsPDF } from 'jspdf';
import { useSession } from "next-auth/react";


type Term = { term: string; definition: string };

export default function TestPage() {
  const searchParams = useSearchParams();
  const setId = searchParams.get("setId");
  const router = useRouter();

  const [terms, setTerms] = useState<Term[]>([]);
  const [testType, setTestType] = useState<"multiple-choice" | "written" | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [setName, setSetName] = useState("Unknown Set");
  const { data: session } = useSession();
  const username = session?.user?.name || "Anonymous";
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

  // Blob to base64 function declared here
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  useEffect(() => {
    if (!setId) return;

    const fetchTerms = async () => {
      try {
        const res = await fetch(`/api/sets/details?setId=${setId}`);
        if (!res.ok) throw new Error("Failed to fetch terms");
        const data = await res.json();
        setTerms(data.terms);
        setSetName(data.setName);
      } catch (error) {
        console.error(error);
      }
    };

    fetchTerms();
  }, [setId]);

  useEffect(() => {
    if (terms.length === 0 || !testType) return;

    if (testType === "multiple-choice") {
      setQuestions(generateMultipleChoiceQuestions(terms));
    } else {
      setQuestions(generateWrittenQuestions(terms));
    }
  }, [testType, terms]);



  function generateMultipleChoiceQuestions(terms: Term[]) {
    return terms.map((termObj) => {
      const isTermQuestion = Math.random() > 0.5;
      const correctAnswer = isTermQuestion ? termObj.definition : termObj.term;

      const incorrectAnswers = terms
        .filter((t) => (isTermQuestion ? t.definition !== correctAnswer : t.term !== correctAnswer))
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((t) => (isTermQuestion ? t.definition : t.term));

      const options = [correctAnswer, ...incorrectAnswers].sort(() => Math.random() - 0.5);

      return { question: isTermQuestion ? termObj.term : termObj.definition, correctAnswer, options };
    });
  }

  function generatePDF({
    title,
    username,
    setName,
    score,
    certificateId,
    results,
  }: {
    title: string;
    username: string;
    setName: string;
    score: string;
    certificateId: string;
    results: { question: string; userAnswer: string; correctAnswer: string }[];
  }) {
    if (!logoBase64) return;

    const doc = new jsPDF('p', 'pt');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;
    let currentY = margin;

    const img = new Image();
  img.src = logoBase64;
  img.onload = () => {
    // Create a canvas to adjust opacity
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("Failed to get 2D context for canvas");
      return;
    }

    canvas.width = img.width;
    canvas.height = img.height;

    // Set opacity here (0.0 = transparent, 1.0 = fully opaque)
    ctx.globalAlpha = 0.5; // Set opacity (adjust as needed)
    ctx.drawImage(img, 0, 0);

    // Convert the canvas to a base64 string
    const adjustedLogoBase64 = canvas.toDataURL("image/png");

    // Now add the image to the PDF using the adjusted logo
    const logoX = pageWidth - 180;
    const logoY = 30;
    const logoWidth = 150;
    const logoHeight = 85;

    doc.addImage(adjustedLogoBase64, 'PNG', logoX, logoY, logoWidth, logoHeight);

    // Continue with the rest of your PDF content...
    doc.setFont('courier');
    doc.setFontSize(24);
    doc.setTextColor(40);
    doc.text(title, pageWidth / 2, currentY, { align: 'center' });
    currentY += 30;

    doc.setFont('Times');
    doc.setFontSize(12);
    doc.text(`User: ${username}`, margin, currentY);
    currentY += 20;
    doc.text(`Set: ${setName}`, margin, currentY);
    currentY += 20;
    doc.setFont('Times', 'Bold');
    doc.text(`Score: ${score}`, margin, currentY, { align: 'left' });
    doc.setFont('Times', 'Normal');
    currentY += 30;

    results.forEach((item, index) => {
      const questionText = `Q${index + 1}. ${item.question}`;
      const qLines = doc.splitTextToSize(questionText, pageWidth - margin * 2);
      const qHeight = qLines.length * doc.getFontSize() * doc.getLineHeightFactor();
      if (currentY + qHeight > pageHeight - margin) {
        addFooter(doc);
        doc.addPage();
        currentY = margin;
      }
      doc.text(qLines, margin, currentY);
      currentY += qHeight + 5;

      const yourAnswerText = `Your answer: ${item.userAnswer}`;
      const aLines = doc.splitTextToSize(yourAnswerText, pageWidth - margin * 2);
      const aHeight = aLines.length * doc.getFontSize() * doc.getLineHeightFactor();
      if (currentY + aHeight > pageHeight - margin) {
        addFooter(doc);
        doc.addPage();
        currentY = margin;
      }
      doc.text(aLines, margin, currentY);
      currentY += aHeight + 5;

      const correctAnswerText = `Correct answer: ${item.correctAnswer}`;
      const cLines = doc.splitTextToSize(correctAnswerText, pageWidth - margin * 2);
      const cHeight = cLines.length * doc.getFontSize() * doc.getLineHeightFactor();
      if (currentY + cHeight > pageHeight - margin) {
        addFooter(doc);
        doc.addPage();
        currentY = margin;
      }
      doc.text(cLines, margin, currentY);
      currentY += cHeight + 15;
    });

    addFooter(doc);
    doc.save(`${username}_certificate.pdf`);

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

  function generateWrittenQuestions(terms: Term[]) {
    return terms.map((termObj) => {
      const isTermQuestion = Math.random() > 0.5;
      return {
        question: isTermQuestion ? `Define: ${termObj.term}` : `What term matches: ${termObj.definition}`,
        correctAnswer: isTermQuestion ? termObj.definition : termObj.term,
      };
    });
  }

  function handleAnswer(answer: string) {
    setUserAnswers((prev) => ({ ...prev, [currentQuestionIndex]: answer }));
  }

  function nextQuestion() {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setShowResults(true);
    }
  }

  function restartTest() {
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setShowResults(false);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      nextQuestion();
    }
  }

  if (!testType) {
    return (
      <div className="flex flex-col items-center mt-[33vh] text-center p-6">
        <h1 className="text-5xl font-bold mb-6">Select Test Type</h1>
        <button className="btn text-2xl" onClick={() => setTestType("multiple-choice")}>Multiple Choice</button>
        <button className="btn mt-4 text-2xl" onClick={() => setTestType("written")}>Written Answer</button>
        <Link href={`/mysets/details?setId=${setId}`} className="return-link mt-6 text-lg underline">
          Need to keep studying?
        </Link>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="flex flex-col items-center mt-[33vh] text-center p-6">
        <h1 className="text-5xl font-bold text-gray-800">Test Results</h1>
        <p className="text-2xl mt-6 text-gray-600">
          Score: {questions.filter((q, i) => q.correctAnswer.toLowerCase() === (userAnswers[i] || "").toLowerCase()).length} / {questions.length}
        </p>

        <div className="mt-10 w-full max-w-3xl space-y-6">
          {questions.map((q, i) => {
            const isCorrect = userAnswers[i]?.toLowerCase() === q.correctAnswer.toLowerCase();
            return (
              <div
                key={i}
                className={`relative p-5 rounded-2xl shadow-lg ${isCorrect ? "bg-green-50 border-l-8 border-green-500" : "bg-red-50 border-l-8 border-red-500"
                  }`}
              >
                <div className="absolute top-0 left-[-10px] w-5 h-5 bg-white rounded-full border border-gray-300"></div>
                <p className="font-semibold text-lg text-gray-800 mb-2">{q.question}</p>

                <div className="flex flex-col gap-1 text-md">
                  <div className="flex items-start">
                    <div className="mr-2 w-4 h-4 bg-gray-300 rounded-full mt-1"></div>
                    <p>
                      <span className="font-semibold">Your answer: </span>
                      <span className={isCorrect ? "text-green-700 font-medium" : "text-red-700 font-medium"}>
                        {userAnswers[i] || "No answer"}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-start">
                    <div className="mr-2 w-4 h-4 bg-blue-300 rounded-full mt-1"></div>
                    <p>
                      <span className="font-semibold">Correct answer: </span>
                      <span className="text-blue-700 font-medium">{q.correctAnswer}</span>
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>


        <button className="btn mt-6 text-2xl" onClick={restartTest}>Retry</button>
        <Link href={`/mysets/details?setId=${setId}`}>
          <button className="btn mt-4 text-xl">Need to keep studying?</button>
        </Link>
        <button
          className="btn mt-6 text-xl"
          onClick={() =>
            generatePDF({
              title: "MemorEase Completion Certificate",
              username,
              setName,
              score: `${questions.filter((q, i) => q.correctAnswer.toLowerCase() === (userAnswers[i] || "").toLowerCase()).length} / ${questions.length}`,
              certificateId: `CERT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
              results: questions.map((q, i) => ({
                question: q.question,
                correctAnswer: q.correctAnswer,
                userAnswer: userAnswers[i] || "No answer",
              })),
            })
          }
        >
          Download Certificate
        </button>


      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  if (!currentQuestion) {
    return (
      <div className="flex flex-col items-center mt-[33vh] text-center p-6">
        <h1 className="text-4xl font-bold mb-4">Loading Questions...</h1>
        <p className="text-xl">Please wait while we generate your test.</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-2xl rounded-3xl p-10 max-w-2xl w-full mx-4 text-center">
        <h1 className="text-4xl font-bold mb-6">
          Question {currentQuestionIndex + 1} / {questions.length}
        </h1> <br></br><br></br>
        <p className="text-2xl mb-8">{currentQuestion.question} ?</p><br></br>

        {testType === "multiple-choice" ? (
          <div className="flex flex-col space-y-4">
            {currentQuestion.options.map((option: string, i: number) => (
              <button
                key={i}
                className="btn-answer text-xl"
                onClick={() => {
                  handleAnswer(option);
                  nextQuestion();
                }}
              >
                {option}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <input
              className="border p-3 w-72 text-xl text-center rounded-lg"
              type="text"
              value={userAnswers[currentQuestionIndex] || ""}
              onChange={(e) => handleAnswer(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button className="btn mt-6 text-xl" onClick={nextQuestion}>
              Next
            </button>
          </div>
        )}

        <style jsx>{`
          .btn {
            padding: 12px 24px;
            background-color: #800000;
            color: white;
            border-radius: 12px;
            cursor: pointer;
            transition: background-color 0.3s ease, transform 0.2s ease;
          }
          .btn:hover {
            background-color: #b30000;
            transform: scale(1.05);
          }
          .btn:focus {
            outline: none;
            box-shadow: 0 0 0 3px rgba(128, 0, 0, 0.4);
          }
          .btn-answer {
            background-color: #f9fafb;
            border: 2px solid #800000;
            border-radius: 10px;
            padding: 12px 20px;
            font-size: 1.25rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .btn-answer:hover {
            background-color: #800000;
            color: white;
            transform: scale(1.03);
          }
          .star {
            color: #800000;
            margin-right: 8px;
          }
        `}</style>
      </div>
    </div>
  );
}  