import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Link from "next/link";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <div>
        <p>You must be logged in.</p>
        <Link href="/register">
          <button>Sign Up</button>
        </Link>
        <Link href="/api/auth/signin">
          <button>Login</button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1>Welcome, {session.user?.email}!</h1>
      <form action="/api/auth/signout" method="POST">
        <button type="submit">Logout</button>
      </form>
    </div>
  );
}
