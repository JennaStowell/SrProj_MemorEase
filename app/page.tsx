import Link from "next/link";

export default function Home() {
  return (
    <main>
      <h1>Deployed by Stoli</h1>
      <Link href="/sets">Sets</Link>
      <br></br>
      <Link href="/terms">Form Test</Link>
      </main>
  )
}