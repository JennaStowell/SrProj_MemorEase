"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Label, TextInput, Button } from "flowbite-react";
import Link from "next/link";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.ok) {
      router.push("/");
    } else {
      alert("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="w-full p-16 bg-gray dark:bg-gray-800 rounded-lg shadow-sm">

        {/* Heading */}
        <h1 className="text-3xl font-semibold text-center mb-6 text-gray-800 dark:text-white">
          Sign In
        </h1>

        {/* Centered red-bordered container */}
        <div className="flex justify-center p-6">
          <div className="flex w-full max-w-4xl bg-white shadow-2xl rounded-lg overflow-hidden py-8 px-2 border-2 border-white">
            
            {/* Form Section (70%) */}
            <div className="w-[70%] p-8">
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <Label htmlFor="email" className="mb-2 block">Email</Label>
                  <TextInput
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="mb-2 block">Password</Label>
                  <TextInput
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit">Log In</Button>
              </form>

              <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="text-blue-600 hover:underline">
                  Register
                </Link>
              </p>
            </div>

            {/* Image Section (30%) */}
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
