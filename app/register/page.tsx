"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react"; 


export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (res.ok) {
      // Auto-login the user after successful registration
      const loginRes = await signIn("credentials", {
        email,
        password,
        redirect: false, // Prevent NextAuth from redirecting immediately
      });

      if (loginRes?.error) {
        setError("Registration successful, but auto-login failed. Please sign in.");
      } else {
        window.location.href = "/"; // Redirect after successful login
      }
    } else {
      const errorData = await res.json();
      setError(errorData.message || "Error signing up");
    }
  };

  return (
    <div>
      <h1>Sign Up</h1>
      <form onSubmit={handleSubmit}>
      <input
          type="text"
          placeholder="Username"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Register</button>
      </form>
      <p>
        Already have an account? <Link href="/api/auth/signin">Sign in</Link>
      </p>
    </div>
  );
}
