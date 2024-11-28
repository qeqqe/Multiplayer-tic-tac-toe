"use client";
import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import io, { Socket } from "socket.io-client";

export default function Game() {
  const { code } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const socketRef = useRef<Socket | null>(null);
  const [game, setGame] = useState({
    board: Array(9).fill(null),
    xIsNext: true,
    status: "waiting",
    players: { host: null, guest: null },
  });

  useEffect(() => {
    socketRef.current = io("http://localhost:3001");

    socketRef.current.emit("joinRoom", {
      roomCode: code,
      token: localStorage.getItem("token"),
    });

    socketRef.current.on("gameState", setGame);
    socketRef.current.on("error", () => router.push("/dashboard"));

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [code]);

  const handleClick = (index: number) => {
    if (!socketRef.current || !user || game.status !== "playing") return;
    if (game.board[index]) return;

    const isHost = game.players.host?.id === user.id;
    const isGuest = game.players.guest?.id === user.id;

    if ((isHost && !game.xIsNext) || (isGuest && game.xIsNext)) return;

    socketRef.current.emit("move", {
      roomCode: code,
      index,
      token: localStorage.getItem("token"),
    });
  };

  const getStatus = () => {
    if (game.status === "finished") return "Game Over";
    if (game.status === "waiting") return "Waiting for opponent...";

    const isHost = game.players.host?.id === user?.id;
    const isGuest = game.players.guest?.id === user?.id;

    if ((isHost && game.xIsNext) || (isGuest && !game.xIsNext)) {
      return "Your turn";
    }
    return "Opponent's turn";
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h2 className="text-xl mb-4 text-center">{getStatus()}</h2>
      <div className="grid grid-cols-3 gap-2 max-w-md mx-auto">
        {game.board.map((square, i) => (
          <button
            key={i}
            onClick={() => handleClick(i)}
            className="bg-zinc-800 h-24 text-4xl"
          >
            {square}
          </button>
        ))}
      </div>
    </div>
  );
}
