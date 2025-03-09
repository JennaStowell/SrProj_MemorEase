"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function MySetsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [sets, setSets] = useState<{ set_id: number; user_id: string; set_name: string }[]>([]);
  const [selectedSet, setSelectedSet] = useState<{ set_id: number; set_name: string } | null>(null);
  const [terms, setTerms] = useState<{ term: string; definition: string }[]>([]);
  
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/api/auth/signin");
    } else if (status === "authenticated" && session?.user?.id) {
      fetchUserSets();
    }
  }, [status, session]);

  const fetchUserSets = async () => {
    const res = await fetch(`/api/sets?userId=${session?.user?.id}`);
    const data = await res.json();
    setSets(data);
  };

  const fetchSetDetails = async (setId: number, setName: string) => {
    const res = await fetch(`/api/sets/${setId}`, { method: "GET" });
    const data = await res.json();
    setSelectedSet({ set_id: setId, set_name: setName });
    setTerms(data.terms);
  };

  if (status === "loading") return <p>Loading...</p>;

  return (
    <div>
      {selectedSet ? (
        // Show terms when a set is selected
        <>
          <div className="flex justify-center w-full" style={{ padding: '10px' }}>
            <h1 className="text-maroon text-5xl font-bold mx-auto">{selectedSet.set_name}</h1>
          </div>

          <hr style={{ border: '1px solid #ccc', margin: '10px 0' }} />
          
{/* Buttons above table */}
<div className="mb-4 flex justify-center space-x-4">
  <button className="btn text-2xl py-4 px-8">Flashcards</button>
  <button className="btn text-2xl py-4 px-8">Study</button>
  <button className="btn text-2xl py-4 px-8">Test</button>
  <button className="btn text-2xl py-4 px-8">Matching</button>
</div>
<br></br>
<br></br>

  
          {terms.length === 0 ? (
            <p>No terms added yet.</p>
          ) : (
<div className="bg-white rounded-lg shadow-lg p-6 mx-auto my-6 w-full max-w-4xl">
  <table className="table-auto border-collapse w-full text-lg mx-auto">
    <thead>
      <tr>
        <th className="border-b py-2 px-4 text-left">Term</th>
        <th className="border-b py-2 px-4 text-left">Definition</th>
      </tr>
    </thead>
    <tbody>
      {terms.map((term, index) => (
        <tr key={index}>
          <td className="border-b py-2 px-4">{term.term}</td>
          <td className="border-b py-2 px-4">{term.definition}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>



          )}
  
          <button onClick={() => setSelectedSet(null)} className="mt-4 p-2 bg-gray-200 rounded hover:bg-gray-300">Back to All Sets</button>
        </>
      ) : (
        // Show list of sets initially
        <>
          <div className="flex justify-between items-center w-full" style={{ padding: '10px' }}>
            <h1 className="text-maroon text-5xl font-bold mx-auto">My Sets</h1>
            <Link href="/create">
              <button className="ml-auto">+ Create Set</button>
            </Link>
          </div>
          <hr style={{ border: '1px solid #ccc', margin: '10px 0' }} />
          {sets.length === 0 ? (
            <p>No sets created yet.</p>
          ) : (
            <ul>
              {sets.map((set) => (
                <li key={set.set_id} className="my-2 ml-6 flex items-center">
                  {/* Star before the set name */}
                  <span className="text-maroon mr-3">&#9733;</span>

                  <div>
                    <button
                      onClick={() => fetchSetDetails(set.set_id, set.set_name)}
                      className="set-button py-6 px-12 text-2xl bg-white shadow-md rounded-lg hover:border-b-4 hover:border-maroon transition-all duration-300"
                    >
                      {set.set_name}
                    </button>
                  </div>
                </li>
              ))}
            </ul>

          )}
        </>
      )}
      {/* Place your custom styles here */}
      <style jsx>{`
  .btn {
    padding: 12px 24px;  /* Slightly bigger padding for better click area */
    background-color: #800000;  /* Maroon background */
    color: white;  /* White text */
    border-radius: 8px;  /* Smoother, more rounded corners */
    cursor: pointer;  /* Pointer on hover */
    transition: background-color 0.3s ease, transform 0.2s ease;  /* Smooth transition for color and scale */
  }

  .btn:hover {
    background-color: #b30000;  /* Lighter maroon color on hover */
    transform: scale(1.05);  /* Slightly enlarge button on hover for visual effect */
  }

  .btn:focus {
    outline: none;  /* Remove focus outline */
    box-shadow: 0 0 0 3px rgba(128, 0, 0, 0.4);  /* Subtle outline to indicate focus */
  }

  .text-maroon {
    color: #800000;  /* Maroon text color */
  }
`}</style>
    </div>
  );
  
}
