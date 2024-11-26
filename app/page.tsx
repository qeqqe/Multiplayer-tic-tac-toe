"use client";
import Link from "next/link";
import { motion } from "framer-motion";

const GamePreview = () => {
  return (
    <div className="grid grid-cols-3 gap-2 w-48 h-48 mb-8">
      {[...Array(9)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: i * 0.1 }}
          whileHover={{
            scale: 1.05,
            backgroundColor: "rgba(59, 130, 246, 0.2)",
          }}
          className="bg-zinc-800/50 rounded-md relative group cursor-pointer"
        >
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center text-blue-400 opacity-0 text-2xl font-bold"
          >
            {i % 2 === 0 ? "X" : "O"}
          </motion.div>
          <div className="absolute inset-0 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-blue-500/20 to-purple-500/20" />
        </motion.div>
      ))}
    </div>
  );
};

const Page = () => {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <GamePreview />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-5xl font-bold text-white mb-2">Tic Tac Toe</h1>
        <p className="text-zinc-400 mb-8 text-lg">Play your friends online</p>

        <div className="flex gap-4">
          <Link
            href="/login"
            className="px-8 py-3 bg-white text-black rounded-lg font-medium hover:bg-zinc-200 transition-colors"
          >
            Play Now
          </Link>
          <Link
            href="/register"
            className="px-8 py-3 bg-zinc-800 text-white rounded-lg font-medium hover:bg-zinc-700 transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Page;
