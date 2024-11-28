"use client";
import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import io, { Socket } from "socket.io-client";

interface GameState {
  board: (string | null)[];
  xIsNext: boolean;
  status: "waiting" | "playing" | "finished";
  winner: string | null;
  isDraw: boolean;
  players: {
    host: { id: string; name: string } | null;
    guest: { id: string; name: string } | null;
  };
}

export default function Game() {
  const { code } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const socketRef = useRef<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    board: Array(9).fill(null),
    xIsNext: true,
    status: "waiting",
    winner: null,
    isDraw: false,
    players: { host: null, guest: null },
  });

  useEffect(() => {
    if (!user) return;

    socketRef.current = io("http://localhost:3001");
    const token = localStorage.getItem("token");

    socketRef.current.emit("joinRoom", { roomCode: code, token });

    socketRef.current.on("gameState", (state: GameState) => {
      setGameState(state);
    });

    socketRef.current.on("error", (error: string) => {
      console.error("Socket error:", error);
      router.push("/dashboard");
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [code, user]);

  const handleClick = (index: number) => {
    if (!socketRef.current || !user || gameState.status !== "playing") return;
    if (gameState.board[index]) return;

    const isHost = gameState.players.host?.id === user.id;
    const isGuest = gameState.players.guest?.id === user.id;
    if ((isHost && !gameState.xIsNext) || (isGuest && gameState.xIsNext))
      return;

    socketRef.current.emit("move", {
      roomCode: code,
      index,
      token: localStorage.getItem("token"),
    });
  };

  const getStatus = () => {
    if (gameState.status === "finished") {
      if (gameState.winner) {
        return gameState.winner === user?.id
          ? "You won! 🎉"
          : "Opponent won! 😢";
      }
      return "Draw game! 🤝";
    }
    if (gameState.status === "waiting") return "Waiting for opponent...";

    const isHost = gameState.players.host?.id === user?.id;
    const isGuest = gameState.players.guest?.id === user?.id;

    if ((isHost && gameState.xIsNext) || (isGuest && !gameState.xIsNext)) {
      return "Your turn!";
    }
    return "Opponent's turn";
  };

  const getPlayerLabel = (playerId: string | undefined) => {
    if (!playerId) return "Waiting...";
    return playerId === user?.id ? "You" : "Opponent";
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      {/* Room info */}
      <div className="text-white mb-4">
        <h1 className="text-2xl font-bold text-center">Room: {code}</h1>
        <div className="flex justify-center items-center gap-4 mt-2">
          <div
            className={`text-blue-400 ${gameState.xIsNext ? "font-bold" : ""}`}
          >
            X: {getPlayerLabel(gameState.players.host?.id || "")}
          </div>
          <div>vs</div>
          <div
            className={`text-red-400 ${!gameState.xIsNext ? "font-bold" : ""}`}
          >
            O:{" "}
            {gameState.players.guest
              ? getPlayerLabel(gameState.players.guest.id)
              : "Waiting..."}
          </div>
        </div>
        <p className="text-zinc-400 text-center mt-2">{getStatus()}</p>
      </div>

      {/* Game board */}
      <div className="grid grid-cols-3 gap-2 w-72 h-72">
        {gameState.board.map((square, i) => (
          <button
            key={i}
            onClick={() => handleClick(i)}
            disabled={gameState.status !== "playing"}
            className={`
              bg-zinc-800/50 hover:bg-zinc-700/50 rounded-md 
              flex items-center justify-center text-4xl font-bold
              w-full h-24 transition-colors
              ${square === "X" ? "text-blue-400" : "text-red-400"}
              ${gameState.status === "playing" ? "hover:bg-zinc-700/80" : ""}
            `}
          >
            {square}
          </button>
        ))}
      </div>

      {/* Game controls */}
      {gameState.status === "finished" && (
        <div className="mt-6 space-x-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-2 bg-zinc-700 text-white rounded-md hover:bg-zinc-600"
          >
            Back to Lobby
          </button>
        </div>
      )}
    </div>
  );
}
