'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';

type SharedEntry = {
  shared_id: string;
  shared_name: string;
  link: string;
};

export default function SharedPage() {
  const [entries, setEntries] = useState<SharedEntry[]>([]);
  const [name, setName] = useState('');
  const [link, setLink] = useState('');
  const [showForm, setShowForm] = useState(false); // toggle form

  useEffect(() => {
    fetch('/api/shared')
      .then(res => res.json())
      .then(data => setEntries(data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch('/api/shared', {
      method: 'POST',
      body: JSON.stringify({ shared_name: name, link }),
      headers: { 'Content-Type': 'application/json' },
    });

    if (res.ok) {
      const newEntry = await res.json();
      setEntries([newEntry, ...entries]);
      setName('');
      setLink('');
      setShowForm(false);
    }
  };

  return (
    <div className="w-full min-h-screen p-6">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          padding: '10px 20px',
          backgroundColor: '#fff',
          width: '100%',
        }}
      >
        <Link href="/">
          <h1 style={{ fontFamily: 'cursive', fontSize: '36px' }}>MemorEase</h1>
        </Link>

        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-8 h-8 text-black cursor-pointer hover:text-gray-700 border-1 border-white shadow-sm"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          role="img"
          aria-label="create study set"
          onClick={() => setShowForm(prev => !prev)}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </div>
      <br></br><br></br>
      <h2 className="text-5xl font-system-ui text-red-900 mb-4 flex justify-center">
                Shared With Me
              </h2><br></br>
      {showForm && (
        <div className="max-w-xl mx-auto p-6">
          <h1 className="text-2xl font-bold mb-4">Add Shared Set</h1>
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <input
              type="text"
              placeholder="Set Name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="url"
              placeholder="Link URL"
              value={link}
              onChange={e => setLink(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
            <button type="submit" className="px-4 py-2 bg-red-900 text-white rounded">
              Add
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
      {entries.map(entry => (
  <div
    key={entry.shared_id}
    className="group relative bg-white shadow-xl rounded-lg p-6 flex items-center justify-center text-center h-48 cursor-pointer transition-transform hover:scale-105"
  >
    <a
      href={entry.link}
      target="_blank"
      rel="noopener noreferrer"
      className="w-full h-full flex items-center justify-center"
    >
      <span className="text-xl font-semibold break-words text-gray-700">
        {entry.shared_name}
      </span>
    </a>
    <button
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const res = await fetch('/api/shared', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: entry.shared_id }),
        });
        if (res.ok) {
          setEntries(entries.filter(e => e.shared_id !== entry.shared_id));
        }
      }}
      className="absolute top-2 right-2 opacity-0 hover:text-red-600 group-hover:opacity-100 transition-opacity duration-200"
    >
      <Trash2 className="w-5 h-5" />
    </button>
  </div>
))}
      </div>
    </div>
  );
}
