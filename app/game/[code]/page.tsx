"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import io, { Socket } from "socket.io-client";

interface Player {
  username: string;
  id: string;
}

interface GameState {
  board: (string | null)[];
  currentPlayer: string | null;
  status: "waiting" | "playing" | "finished";
  players: {
    host: Player | null;
    guest: Player | null;
  };
}

let socket: Socket | null = null;

export default function GamePage() {
  const { code } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState>({
    board: Array(9).fill(null),
    currentPlayer: null,
    status: "waiting",
    players: {
      host: null,
      guest: null,
    },
  });

  useEffect(() => {
    // Verify room exists and get initial state
    const fetchRoom = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:3001/room/${code}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          router.push("/dashboard");
          return;
        }
        const data = await res.json();
        setGameState((prev) => ({
          ...prev,
          status: data.room.status,
          players: {
            host: data.room.host,
            guest: data.room.guest,
          },
        }));
      } catch (error) {
        console.error("Error fetching room:", error);
        router.push("/dashboard");
      }
    };

    fetchRoom();

    // Setup socket connection
    if (!socket) {
      socket = io("http://localhost:3001", {
        auth: {
          token: localStorage.getItem("token"),
          roomCode: code,
        },
      });

      socket.on("gameUpdate", (newState) => {
        setGameState(newState);
      });

      socket.on("playerMove", ({ index, player }) => {
        setGameState((prev) => {
          const newBoard = [...prev.board];
          newBoard[index] = player;
          return { ...prev, board: newBoard };
        });
      });
    }

    return () => {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    };
  }, [code, router]);

  const handleCellClick = (index: number) => {
    if (!socket || gameState.board[index] || gameState.status !== "playing")
      return;
    socket.emit("makeMove", { index, roomCode: code });
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="text-white mb-8">
        <h1 className="text-2xl font-bold text-center">Room Code: {code}</h1>
        <p className="text-zinc-400 text-center mt-2">
          {gameState.status === "waiting"
            ? "Waiting for opponent..."
            : `Current player: ${gameState.currentPlayer}`}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 w-72 h-72">
        {gameState.board.map((cell, index) => (
          <button
            key={index}
            onClick={() => handleCellClick(index)}
            className="bg-zinc-800/50 hover:bg-zinc-700/50 rounded-md flex items-center justify-center text-4xl font-bold text-white transition-colors"
          >
            {cell}
          </button>
        ))}
      </div>

      <div className="mt-8 text-white text-center">
        <p className="text-zinc-400">
          {gameState.players.host?.username} vs{" "}
          {gameState.players.guest?.username || "Waiting..."}
        </p>
      </div>
    </div>
  );
}
