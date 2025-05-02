"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react"; 
import { Button, Label, TextInput } from "flowbite-react";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (res.ok) {
      const loginRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (loginRes?.error) {
        setError("Registration successful, but auto-login failed. Please sign in.");
      } else {
        window.location.href = "/";
      }
    } else {
      const errorData = await res.json();
      setError(errorData.message || "Error signing up");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="w-full p-16 bg-gray dark:bg-gray-800 rounded-lg shadow-sm">
        
        
        <h1 className="text-3xl font-semibold text-center mb-6 text-gray-800 dark:text-white">Sign Up</h1>
  
        
        {error && (
          <div className="mb-4 text-sm text-red-600 dark:text-red-400 text-center">{error}</div>
        )}
  
        
        <div className="flex justify-center p-6 ">
          
          
          <div className="flex w-full max-w-4xl bg-white shadow-2xl rounded-lg overflow-hidden py-8 px-2 border-2 border-white">
            
            <div className="w-[70%] p-8">
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <Label htmlFor="username" className="mb-2 block">Username</Label>
                  <TextInput
                    id="username"
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
  
                <div>
                  <Label htmlFor="email" className="mb-2 block">Email address</Label>
                  <TextInput
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
  
                <div>
                  <Label htmlFor="password" className="mb-2 block">Password</Label>
                  <TextInput
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
  
                <Button type="submit" disabled={loading}>
                  {loading ? "Registering..." : "Register"}
                </Button>
              </form>
  
              <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{" "}
                <Link href="/api/auth/signin" className="text-blue-600 hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
  
            {/* Image Section - 30% */}
            <div className="w-[30%] bg-gray-100 relative">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-30"
                style={{ backgroundImage: 'url(/images/study.png)' }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
}
