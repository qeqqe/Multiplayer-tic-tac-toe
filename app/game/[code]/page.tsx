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
  winner?: string | null;
  isDraw?: boolean;
  disconnected?: boolean;
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
          board: data.room.board || Array(9).fill(null), // Ensure board is set
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

    if (!socket) {
      socket = io("http://localhost:3001", {
        auth: {
          token: localStorage.getItem("token"),
          roomCode: code,
        },
      });

      socket.on("connect", () => {
        socket?.emit("joinRoom", {
          roomCode: code,
          token: localStorage.getItem("token"),
        });
      });

      socket.on("error", (error) => {
        console.error(error);
        router.push("/dashboard");
      });

      socket.on("gameUpdate", (newState) => {
        setGameState((prev) => ({
          ...prev,
          ...newState,
          board: newState.board || Array(9).fill(null), // Ensure board is always an array
        }));
      });

      // Remove the playerMove event listener as we're handling moves in gameUpdate
    }

    return () => {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    };
  }, [code, router]);

  const handleCellClick = (index: number) => {
    if (
      !socket ||
      !user ||
      gameState.board[index] ||
      gameState.status !== "playing" ||
      gameState.currentPlayer !== user.id
    ) {
      return;
    }

    socket.emit("makeMove", {
      index,
      roomCode: code,
      userId: user.id,
    });
  };

  const getGameStatus = () => {
    if (gameState.status === "finished") {
      if (gameState.disconnected) {
        return `${gameState.winner} wins by disconnection!`;
      }
      if (gameState.isDraw) {
        return "Game Draw!";
      }
      return `${gameState.winner} wins!`;
    }

    if (gameState.status === "waiting") {
      return "Waiting for opponent...";
    }

    // Check if it's the current user's turn
    const isCurrentUserTurn = gameState.currentPlayer === user?.id;
    return isCurrentUserTurn ? "Your turn" : "Opponent's turn";
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="text-white mb-8">
        <h1 className="text-2xl font-bold text-center">Room Code: {code}</h1>
        <p className="text-zinc-400 text-center mt-2">{getGameStatus()}</p>
      </div>

      <div className="grid grid-cols-3 gap-2 w-72 h-72">
        {(gameState.board || Array(9).fill(null)).map((cell, index) => (
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

      {gameState.status === "finished" && (
        <button
          onClick={() => router.push("/dashboard")}
          className="mt-4 px-6 py-2 bg-zinc-700 text-white rounded-md hover:bg-zinc-600 transition-colors"
        >
          Back to Dashboard
        </button>
      )}
    </div>
  );
}
