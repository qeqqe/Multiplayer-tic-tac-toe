"use client";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const { user, loading, error } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-zinc-800 bg-zinc-900/50"
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">3T</h1>
          <div className="flex items-center space-x-4">
            <span className="text-zinc-400">{user.username}</span>
            <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden">
              <img
                src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.username}`}
                alt="profile"
                width={40}
                height={40}
              />
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* quick play */}
          <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700 hover:border-zinc-600 transition-colors">
            <h2 className="text-xl font-semibold mb-4">Quick Play</h2>
            <p className="text-zinc-400 mb-4">
              Join a random match with another player
            </p>
            <button className="w-full p-3 bg-white text-black rounded-lg font-medium hover:bg-zinc-200 transition-colors">
              Find Match
            </button>
          </div>

          {/* room sec */}
          <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700 hover:border-zinc-600 transition-colors">
            <h2 className="text-xl font-semibold mb-4">Create Room</h2>
            <p className="text-zinc-400 mb-4">
              Start a private game with a friend
            </p>
            <button className="w-full p-3 bg-zinc-700 text-white rounded-lg font-medium hover:bg-zinc-600 transition-colors">
              Create Room
            </button>
          </div>
        </motion.div>

        {/* stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 bg-zinc-800/50 rounded-lg p-6 border border-zinc-700"
        >
          <h2 className="text-xl font-semibold mb-4">Your Stats</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4">
              <div className="text-2xl font-bold text-blue-400">0</div>
              <div className="text-zinc-400">Wins</div>
            </div>
            <div className="p-4">
              <div className="text-2xl font-bold text-red-400">0</div>
              <div className="text-zinc-400">Losses</div>
            </div>
            <div className="p-4">
              <div className="text-2xl font-bold text-purple-400">0</div>
              <div className="text-zinc-400">Draws</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
