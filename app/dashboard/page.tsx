"use client";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  const handleCreateRoom = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3001/create-room", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to create room");
      }

      const data = await res.json();
      router.push(`/game/${data.code}`);
    } catch (error) {
      console.error("Error creating room:", error);
    }
  };

  const handleJoinRoom = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3001/room/${roomCode}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        setError("Invalid room code");
        return;
      }

      router.push(`/game/${roomCode}`);
    } catch (error) {
      setError("Failed to join room");
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (loading) {
    return <div>Loading...</div>;
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
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors"
            >
              Logout
            </button>
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
          {/* Replace quick play with join room */}
          <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700 hover:border-zinc-600 transition-colors">
            <h2 className="text-xl font-semibold mb-4">Join Room</h2>
            <p className="text-zinc-400 mb-4">Join a game using a room code</p>
            <button
              onClick={() => setShowModal(true)}
              className="w-full p-3 bg-white text-black rounded-lg font-medium hover:bg-zinc-200 transition-colors"
            >
              Join Room
            </button>
          </div>

          {/* room sec */}
          <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700 hover:border-zinc-600 transition-colors">
            <h2 className="text-xl font-semibold mb-4">Create Room</h2>
            <p className="text-zinc-400 mb-4">
              Start a private game with a friend
            </p>
            <button
              onClick={handleCreateRoom}
              className="w-full p-3 bg-zinc-700 text-white rounded-lg font-medium hover:bg-zinc-600 transition-colors"
            >
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

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-zinc-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Join Room</h2>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="Enter room code"
              className="w-full p-3 bg-zinc-700 rounded-md text-white mb-4"
              maxLength={6}
            />
            {error && <p className="text-red-400 mb-4 text-sm">{error}</p>}
            <div className="flex space-x-3">
              <button
                onClick={handleJoinRoom}
                className="flex-1 p-3 bg-white text-black rounded-lg font-medium hover:bg-zinc-200 transition-colors"
              >
                Join
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setError("");
                  setRoomCode("");
                }}
                className="flex-1 p-3 bg-zinc-700 text-white rounded-lg font-medium hover:bg-zinc-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
