import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { Carousel } from "flowbite-react"

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <div style={{ padding: '20px' }}>
        {/* Top Navigation */}
        <div 
          style={{
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', // Add shadow under the navbar
            padding: '10px 20px', // Added some padding for better appearance
            backgroundColor: '#fff', // Optional: set a background color
          }}
        >
          <h1 style={{ fontFamily: 'cursive', fontSize: '36px' }}>Memorease</h1>
          <div style={{ display: 'flex', gap: '10px' }}> {/* Add gap between buttons */}
            <Link href="/register">
              <button 
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'white',
                  color: 'black',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease', // Smooth transition for hover
                }}

              >
                Register
              </button>
            </Link>
            <Link href="/api/auth/signin">
              <button 
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'white', // Maroon background color
                  color: 'black',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease', // Smooth transition for hover
                }}
                >
                Login
              </button>
            </Link>
          </div>
        </div>
        <br />
      <div className="h-56 sm:h-64 xl:h-80 2xl:h-96">
      <Carousel>
              <div className="flex h-full items-center justify-center bg-gray-200 dark:bg-gray-700 dark:text-white p-10">
          <div className="text-center">
            <h2 className="text-3xl font-semibold mb-4">MemorEase Study Features</h2>
            <br></br>
            <p className="text-lg mb-6">
              MemorEase incorporates <strong>The Theory of Cognitive Learning</strong> to enhance retention
              and understanding, using <strong>four different</strong> study modes!
            </p>
            <br></br>
            <div className="flex justify-center">
          <span className="text-6xl">🧠</span> {/* Brain emoticon */}
        </div>
          </div>
</div>
  <div className="flex h-full items-center justify-center bg-gray-200 dark:bg-gray-700 dark:text-white p-10">
          <div className="text-center">
            <h2 className="text-3xl font-semibold mb-4">Play To Stay Engaged</h2>
            <br></br>
            <p className="text-lg mb-6">
              Play unlimited <strong>Card Matching Games</strong> to interact with your flashcards and inprove long term retention
            </p>
            <br></br>
            <div className="flex justify-center">
      <span className="text-6xl">🎲</span>
    </div>
          </div>
          </div>
          <div className="flex h-full items-center justify-center bg-gray-200 dark:bg-gray-700 dark:text-white p-10">
          <div className="text-center">
            <h2 className="text-3xl font-semibold mb-4">Share Sets</h2>
            <br></br>
            <p className="text-lg mb-6">
            Effortlessly share your study sets with  <strong>friends, classmates, or colleagues</strong> to enhance collaborative learning 
            </p>
            <br></br>
            <div className="flex justify-center">
      <span className="text-6xl">🔗</span>
    </div>
          </div>
          </div>
          <div className="flex h-full items-center justify-center bg-gray-200 dark:bg-gray-700 dark:text-white p-10">
          <div className="text-center">
            <h2 className="text-3xl font-semibold mb-4">For Teachers</h2>
            <br></br>
            <p className="text-lg mb-6">
            Students can now email a <strong>Certificate of Completion</strong> after each study mode showcase their achievements. A perfect way for teachers to monitor student success and provide recognition!
            </p>
            <br></br>
            <div className="flex justify-center">
      <span className="text-6xl">🎓</span>
    </div>
          </div>
</div>
      </Carousel>
    </div>
    <br></br>
    <div className="bg-white dark:bg-gray-700 text-left p-10">
  <div className="flex flex-wrap justify-center gap-10">
    {/* Testimonial 1 */}
    <div className="w-1/2 sm:w-1/4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg relative">
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 w-6 h-6 bg-white dark:bg-gray-800 rotate-45"></div>
      <p className="text-lg mb-4 p-6 relative z-10">&quot;MemorEase helped me retain information like never before! The study modes are so engaging and effective.&quot;</p>
      <p className="font-semibold">John Doe</p>
    </div>
    
    {/* Testimonial 2 */}
    <div className="w-1/2 sm:w-1/4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg relative">
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 w-6 h-6 bg-white dark:bg-gray-800 rotate-45"></div>
      <p className="text-lg mb-4 p-6 relative z-10">&quot;As a teacher, I love how my students can track their progress and even receive certificates!&quot;</p>
      <p className="font-semibold">Jane Smith</p>
    </div>

    {/* Testimonial 3 */}
    <div className="w-1/2 sm:w-1/4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg relative">
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 w-6 h-6 bg-white dark:bg-gray-800 rotate-45"></div>
      <p className="text-lg mb-4 p-6 relative z-10">&quot;MemorEase made studying fun and easy. The card matching game is an awesome way to reinforce learning!&quot;</p>
      <p className="font-semibold">Emily Watson</p>
    </div>

    {/* Testimonial 4 */}
    <div className="w-1/2 sm:w-1/4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg relative">
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 w-6 h-6 bg-white dark:bg-gray-800 rotate-45"></div>
      <p className="text-lg mb-4 p-6 relative z-10">&quot;The study modes are great for both visual and auditory learners. I’ve improved my retention so much!&quot;</p>
      <p className="font-semibold">Michael Brown</p>
    </div>
  </div>
</div>

    </div>
    
    );
  }

  

  return (
    <div style={{ padding: '20px' }}>
      {/* Top Navigation */}
      <div 
        style={{
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', // Add shadow under the navbar
          padding: '10px 20px', // Added some padding for better appearance
          backgroundColor: '#fff', // Optional: set a background color
        }}
      >
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
