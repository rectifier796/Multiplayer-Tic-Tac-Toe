import { useEffect, useState } from "react";
import GameLayout from "./GameLayout";
import "./App.css";
import { io } from "socket.io-client";
import Swal from "sweetalert2";

const App = () => {
  const [playOnline, setPlayOnline] = useState(false);
  const [socket, setSocket] = useState(null);
  const [playerName, setPlayerName] = useState("");
  const [opponentName, setOpponentName] = useState(null);
  const [playingAs, setPlayingAs] = useState(null);

  const handleClick = async () => {
    const result = await takePlayerName();

    if (!result.isConfirmed) {
      return;
    }

    const username = result.value;
    setPlayerName(username);

    const newSocket = io("http://localhost:3000", {
      autoConnect: true,
    });

    newSocket?.emit("request_to_play", {
      playerName: username,
    });

    setSocket(newSocket);
  };

  useEffect(() => {
    if (socket) {
      socket.on("connect", () => {
        setPlayOnline(true);
      });

      socket.on("OpponentNotFound", () => {
        setOpponentName(false);
      });

      socket.on("OpponentFound", (data) => {
        console.log(data);
        setOpponentName(data.playerName);
        setPlayingAs(data.playingAs);
      });
    }

    return () => {
      return socket?.disconnect();
    };
  }, [socket]);

  const takePlayerName = async () => {
    return await Swal.fire({
      title: "Enter Your Name",
      input: "text",
      inputLabel: "Your Name",
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return "Name is required";
        }
      },
    });
  };

  if (playOnline && !opponentName) {
    return (
      <div className="waiting">
        <p>Waiting for Opponent...</p>
      </div>
    );
  }

  return (
    <div className="main-div">
      {playOnline ? (
        <GameLayout playerName = {playerName} opponentName = {opponentName} playingAs = {playingAs} socket={socket}/>
      ) : (
        <button onClick={handleClick} className="play-online">
          Play Online
        </button>
      )}
    </div>
  );
};

export default App;
