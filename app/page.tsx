import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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
    <div style={{ padding: '20px' }}>
      {/* Top Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontFamily: 'cursive', fontSize: '36px' }}>Memorease</h1>
        <div>
          <span>{session.user?.name}</span>
          <form action="/api/auth/signout" method="POST" style={{ display: 'inline' }}>
            <button type="submit" style={{ marginLeft: '15px' }}>Log out</button>
          </form>
        </div>
      </div>

      <br />

      {/* My Sets Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
        <Link href="/mysets"><h1 style={{ color: 'maroon', fontWeight: 'bold', fontSize: '32px' }}>My Sets</h1></Link>
          <Link href="/create">
            <button style={{ marginLeft: '20px' }}>+ Create Set</button>
          </Link>
        </div>

        {/* Line under My Sets */}
        <hr style={{ border: '1px solid #ccc', margin: '10px 0' }} />

        <p>display recently made sets here</p>

        {/* Placeholder Image Boxes */}
        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ width: '100px', height: '100px', border: '1px solid black', backgroundColor: 'lightgray' }}></div>
          <div style={{ width: '100px', height: '100px', border: '1px solid black', backgroundColor: 'lightgray' }}></div>
          <div style={{ width: '100px', height: '100px', border: '1px solid black', backgroundColor: 'lightgray' }}></div>
        </div>
      </div>

      {/* My Public Section */}
      <div>
      <br></br>
      <br></br>
      <br></br>
        <div style={{ display: 'flex', alignItems: 'center' }}>
        <h1 style={{ color: 'maroon', fontWeight: 'bold', fontSize: '32px' }}>Public Sets</h1>
        </div>

        {/* Line under My Sets */}
        <hr style={{ border: '1px solid #ccc', margin: '10px 0' }} />

        <p>display recently made sets here</p>

        {/* Placeholder Image Boxes */}
        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ width: '100px', height: '100px', border: '1px solid black', backgroundColor: 'lightgray' }}></div>
          <div style={{ width: '100px', height: '100px', border: '1px solid black', backgroundColor: 'lightgray' }}></div>
          <div style={{ width: '100px', height: '100px', border: '1px solid black', backgroundColor: 'lightgray' }}></div>
        </div>
      </div>

    </div>
  );
}
