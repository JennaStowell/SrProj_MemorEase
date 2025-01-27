'use client';

import { useState } from 'react';

export default function CommentForm() {
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!comment.trim()) {
      setError('Comment cannot be empty.');
      return;
    }

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment }),
      });

      if (response.ok) {
        setComments([...comments, comment]);
        setComment('');
      } else {
        setError('Failed to add comment');
      }
    } catch (err) {
      setError('Something went wrong.');
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold">Add a Comment</h2>
      <form onSubmit={handleSubmit} className="mt-4">
        <input
          type="text"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="border p-2 w-full"
          placeholder="Enter your comment"
        />
        <button type="submit" className="mt-2 bg-blue-500 text-white px-4 py-2">
          Submit
        </button>
      </form>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      <ul className="mt-4">
        {comments.map((c, index) => (
          <li key={index} className="border-b py-2">{c}</li>
        ))}
      </ul>
    </div>
  );
}
