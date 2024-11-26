"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <h1 className="text-3xl font-bold text-white mb-8 text-center">
          Welcome Back
        </h1>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <input
              type="email"
              placeholder="Email"
              className="w-full p-3 bg-zinc-800/50 rounded-lg border border-zinc-700 text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              className="w-full p-3 bg-zinc-800/50 rounded-lg border border-zinc-700 text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <button
            className="w-full p-3 bg-white text-black rounded-lg font-medium hover:bg-zinc-200 transition-colors"
            onClick={() => setLoading(true)}
          >
            {loading ? "Loading..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-zinc-400">
          Don't have an account?{" "}
          <Link href="/register" className="text-blue-400 hover:text-blue-300">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
