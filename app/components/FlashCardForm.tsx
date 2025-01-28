'use client';

import { useState } from 'react';

export function FlashCardForm() {
  const [term, setTerm] = useState('');
  const [definition, setDefinition] = useState('');
  const [flashcards, setFlashcards] = useState<{ term: string; definition: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Input validation
    if (!term.trim() || !definition.trim()) {
      setError('Both term and definition are required.');
      return;
    }

    try {
      // POST request to add the term and definition to the database
      const response = await fetch('/api/terms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ term, definition }),
      });

      if (response.ok) {
        setFlashcards([...flashcards, { term, definition }]); // Update local state
        setTerm(''); // Reset input fields
        setDefinition('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to add flashcard.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold">Add a Flashcard</h2>
      <form onSubmit={handleSubmit} className="mt-4">
        <input
          type="text"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          className="border p-2 w-full mb-2"
          placeholder="Enter term"
        />
        <textarea
          value={definition}
          onChange={(e) => setDefinition(e.target.value)}
          className="border p-2 w-full mb-2"
          placeholder="Enter definition"
        />
        <button type="submit" className="mt-2 bg-blue-500 text-white px-4 py-2">
          Submit
        </button>
      </form>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      <ul className="mt-4">
        {flashcards.map((card, index) => (
          <li key={index} className="border-b py-2">
            <strong>{card.term}:</strong> {card.definition}
          </li>
        ))}
      </ul>
    </div>
  );
}
