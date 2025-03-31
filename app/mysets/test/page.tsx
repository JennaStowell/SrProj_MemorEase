"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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

  useEffect(() => {
    if (!setId) return;

    const fetchTerms = async () => {
      try {
        const res = await fetch(`/api/sets/details?setId=${setId}`);
        if (!res.ok) throw new Error("Failed to fetch terms");
        const data = await res.json();
        setTerms(data.terms);
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
      <div className="flex flex-col items-center p-6">
        <h1 className="text-3xl font-bold mb-4">Select Test Type</h1>
        <button className="btn" onClick={() => setTestType("multiple-choice")}>Multiple Choice</button>
        <button className="btn mt-2" onClick={() => setTestType("written")}>Written Answer</button>
        <button className="btn mt-4" onClick={() => router.push("/mysets")}>Need to keep studying?</button>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="flex flex-col items-center p-6">
        <h1 className="text-3xl font-bold">Test Results</h1>
        <p className="text-xl mt-4">
          Score: {questions.filter((q, i) => q.correctAnswer.toLowerCase() === (userAnswers[i] || "").toLowerCase()).length} / {questions.length}
        </p>

        <div className="mt-6 text-left">
          {questions.map((q, i) => (
            <div key={i} className="mb-4">
              <p className="font-semibold">{q.question}</p>
              <p>Your answer: <span className={userAnswers[i]?.toLowerCase() === q.correctAnswer.toLowerCase() ? "text-green-600" : "text-red-600"}>{userAnswers[i] || "No answer"}</span></p>
              <p>Correct answer: <span className="text-blue-600">{q.correctAnswer}</span></p>
            </div>
          ))}
        </div>

        <button className="btn mt-4" onClick={restartTest}>Retry</button>
        <button className="btn mt-2" onClick={() => router.push("/mysets")}>Need to keep studying?</button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  if (!currentQuestion) {
    return (
      <div className="flex flex-col items-center p-6">
        <h1 className="text-2xl font-bold mb-4">Loading Questions...</h1>
        <p className="text-lg">Please wait while we generate your test.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold mb-4">Question {currentQuestionIndex + 1} / {questions.length}</h1>
      <p className="text-lg mb-4">{currentQuestion.question}</p>

      {testType === "multiple-choice" ? (
        <div className="flex flex-col space-y-2">
          {currentQuestion.options.map((option: string, i: number) => (
            <button key={i} className="btn-answer" onClick={() => { handleAnswer(option); nextQuestion(); }}>
              <span className="star">★</span> {option}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <input
            className="border p-2 w-64 text-center"
            type="text"
            value={userAnswers[currentQuestionIndex] || ""}
            onChange={(e) => handleAnswer(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className="btn mt-4" onClick={nextQuestion}>Next</button>
        </div>
      )}

      <style jsx>{`
        .btn {
          padding: 10px 20px;
          background-color: #800000;
          color: white;
          border-radius: 8px;
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
          background: none;
          border: none;
          font-size: 1.2rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .star {
          color: maroon;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
}
