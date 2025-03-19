// "use client";

// import { useSession } from "next-auth/react";
// import { useRouter, useParams } from "next/navigation";
// import { useEffect, useState } from "react";

// export default function SetDetailsPage() {
//   const { data: session, status } = useSession();
//   const router = useRouter();
//   const { setId } = useParams();
//   const [setDetails, setSetDetails] = useState<{ set_id: number; user_id: string; set_name: string } | null>(null);

//   const [terms, setTerms] = useState<{ term: string; definition: string }[]>([]);

//   useEffect(() => {
//     if (status === "unauthenticated") {
//       router.push("/api/auth/signin");
//     } else if (status === "authenticated") {
//       fetchSetDetails();
//     }
//   }, [status]);

//   const fetchSetDetails = async () => {
//     const res = await fetch(`/api/sets/${setId}`);
//     if (res.ok) {
//       const data = await res.json();
//       setSetDetails(data.set);
//       setTerms(data.terms);
//     }
//   };

//   if (status === "loading" || !setDetails) return <p>Loading set details...</p>;


//   return (
//     <div>
//       {setDetails ? (
//         <>
//           <h1>{setDetails.set_name}</h1>
//           <h2>Terms & Definitions</h2>
//           {terms.length === 0 ? (
//             <p>No terms added yet.</p>
//           ) : (
//             <ul>
//               {terms.map((term, index) => (
//                 <li key={index}>
//                   <strong>{term.term}</strong>: {term.definition}
//                 </li>
//               ))}
//             </ul>
//           )}
//         </>
//       ) : (
//         <p>Loading set details...</p>
//       )}
//     </div>
//   );
// }
