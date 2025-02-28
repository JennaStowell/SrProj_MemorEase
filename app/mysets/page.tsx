"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function MySetsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sets, setSets] = useState<{ set_id: number; user_id: string; set_name: string }[]>([]);


  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/api/auth/signin");
    } else if (status === "authenticated") {
      fetchUserSets();
    }
  }, [status]);

  const fetchUserSets = async () => {
    console.log("Fetching sets for user:", session?.user?.id); // Debugging log
    
    const res = await fetch(`/api/sets?userId=${session?.user?.id}`);
    const data = await res.json();
    
    console.log("Fetched Sets:", data); // Debugging log
    setSets(data);
  };
  

  if (status === "loading") return <p>Loading...</p>;

  return (
    <div>
      <h1>My Sets</h1>
      {sets.length === 0 ? (
        <p>No sets created yet.</p>
      ) : (
        <ul>
          {sets.map((set) => (
            <li key={set.set_id}>
              <Link href={`/mysets/${set.set_id}`}>
                <span className="set-name">{set.set_name}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
  
}
