import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { Carousel } from "flowbite-react"
import { PlusCircle } from 'lucide-react';
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/home");
  }


  if (!session) {
    return (
      <div className="min-h-screen flex flex-col">
      <main className="flex-grow px-5 py-5">
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
</main>
    <div>
    <footer className="bg-gray-100 text-gray-800 py-8 px-4">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
      <div className="flex items-center space-x-3">
        <img src='images/MemorEase_Logo_NoWords.png' alt="Memorease Logo" className="h-10 w-10 object-contain" />
        <span className="text-1xl font-system-ui text-black">Memorease</span>
      </div>
      <div className="text-center md:text-left text-sm text-gray-700">
        <p>Created by Jenna Stowell</p>
        <p>www.linkedin.com/in/jenna-m-stowell</p>
      </div>
      <div className="text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Memorease. All rights reserved.
      </div>
    </div>
  </footer> 
  </div>   
    </div>
    
    );}}