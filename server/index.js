import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome To Home Page",
  });
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: "http://localhost:5173",
});

const allUsers = {};
const allRooms = [];

io.on("connection", (socket) => {
  console.log("Player Joined : ", socket.id);

  allUsers[socket.id] = {
    socket: socket,
    online: true,
    playerName: null,
    playing: false,
  };

  // console.log(allUsers);

  socket.on("request_to_play", (data) => {
    // console.log(data);
    const currentUser = allUsers[socket.id];
    currentUser.playerName = data.playerName;
    // console.log(allUsers);

    let opponentPlayer;

    for (const key in allUsers) {
      const user = allUsers[key];
      if (key !== socket.id && user.online && !user.playing) {
        opponentPlayer = user;
        break;
      }
    }

    if (opponentPlayer) {

        allRooms.push({
            player1 : opponentPlayer,
            player2 : currentUser
        })

      currentUser.socket.emit("OpponentFound", {
        playerName: opponentPlayer.playerName,
        playingAs: "circle",
      });
      opponentPlayer.socket.emit("OpponentFound", {
        playerName: currentUser.playerName,
        playingAs: "cross",
      });

      currentUser.socket.on("playerMoveFromClient",(data)=>{
        console.log("hello",data);
        opponentPlayer.socket.emit("playerMoveFromServer",data)
      })

      opponentPlayer.socket.on("playerMoveFromClient",(data)=>{
        currentUser.socket.emit("playerMoveFromServer",data)
      })

    } else {
      currentUser.socket.emit("OpponentNotFound");
    }
  });

  socket.on("disconnect", () => {
    console.log("Disconnected : ", socket.id);
    allUsers[socket.id].online = false;
    allUsers[socket.id].playing = false;
    
    for (let index = 0; index < allRooms.length; index++) {
        const {player1, player2} = allRooms[index];
        
        if(player1.socket.id === socket.id){
            player2.socket.emit("opponentLeftMatch");
            break;
        }

        if(player2.socket.id === socket.id){
            player1.socket.emit("opponentLeftMatch");
            break;
        }
    }

  });
});

const PORT = 3000;
httpServer.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
