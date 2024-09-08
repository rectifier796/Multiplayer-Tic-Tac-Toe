import { useEffect, useState } from "react";
import "./GameLayout.css";
import Square from "./Square/Square";

const renderFrom = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
];

const GameLayout = ({ playerName, opponentName, playingAs, socket }) => {
  const [gameState, setGameState] = useState(renderFrom);
  const [currentPlayer, setCurrentPlayer] = useState("circle");
  const [finishedState, setFinishedState] = useState(false);
  const [finishedArrayState, setFinishedArrayState] = useState([]);

  const checkWinner = () => {
    for (let row = 0; row < gameState.length; row++) {
      if (
        gameState[row][0] === gameState[row][1] &&
        gameState[row][1] === gameState[row][2]
      ) {
        setFinishedArrayState([row * 3 + 0, row * 3 + 1, row * 3 + 2]);
        return gameState[row][0];
      }
    }

    for (let col = 0; col < gameState[0].length; col++) {
      if (
        gameState[0][col] === gameState[1][col] &&
        gameState[1][col] === gameState[2][col]
      ) {
        setFinishedArrayState([col, col + 3, col + 6]);
        return gameState[0][col];
      }
    }

    if (
      gameState[0][0] === gameState[1][1] &&
      gameState[1][1] === gameState[2][2]
    ) {
      setFinishedArrayState([0, 4, 8]);
      return gameState[0][0];
    }

    if (
      gameState[0][2] === gameState[1][1] &&
      gameState[1][1] === gameState[2][0]
    ) {
      setFinishedArrayState([2, 4, 6]);
      return gameState[0][2];
    }

    const isDrawMatch = gameState.flat().every((item) => {
      if (item === "circle" || item === "cross") return true;
    });

    if (isDrawMatch) return "draw";

    return null;
  };

  useEffect(() => {
    const winner = checkWinner();
    if (winner === "circle" || winner === "cross" || winner === "draw") {
      setFinishedState(winner);
    }
  }, [gameState]);

  useEffect(() => {
    socket?.on("playerMoveFromServer", (data) => {
      console.log(data);
      const id = data.state.id;
      setGameState((prevState) => {
        let newSate = [...prevState];
        const rowIndex = Math.floor(id / 3);
        const colIndex = id % 3;
        newSate[rowIndex][colIndex] = data.state.sign;
        return newSate;
      });
      setCurrentPlayer(data.state.sign === "circle" ? "cross" : "circle");
    });

    socket?.on("opponentLeftMatch", () => {
      setFinishedState("OpponentLeftMatch");
    });
  }, []);

  return (
    <div className="main-div">
      <div className="move-detection">
        <div
          className={`left ${
            currentPlayer === playingAs ? "current-move-" + currentPlayer : ""
          }`}
        >
          {playerName}
        </div>
        {!finishedState && (
          <div>
            <h4>
              {currentPlayer === playingAs ? "Your Move" : "Opponent Move"}
            </h4>
          </div>
        )}

        <div
          className={`right ${
            currentPlayer !== playingAs ? "current-move-" + currentPlayer : ""
          }`}
        >
          {opponentName}
        </div>
      </div>
      <div>
        <h1 className="game-heading water-background">Tic Tac Toe</h1>
        <div className="square-wrapper">
          {gameState.map((arr, rowIndex) => {
            return arr.map((e, colIndex) => {
              return (
                <Square
                  key={rowIndex * 3 + colIndex}
                  id={rowIndex * 3 + colIndex}
                  setGameState={setGameState}
                  currentPlayer={currentPlayer}
                  setCurrentPlayer={setCurrentPlayer}
                  finishedState={finishedState}
                  finishedArrayState={finishedArrayState}
                  socket={socket}
                  currentElement={e}
                  playingAs={playingAs}
                />
              );
            });
          })}
        </div>
        {finishedState &&
          (finishedState === "circle" || finishedState === "cross") && (
            <h3 className="finished-state">
              {finishedState === playingAs ? "You won the game" : "You Loose"}
            </h3>
          )}
        {finishedState && finishedState === "draw" && (
          <h3 className="finished-state">Match Draw !!!</h3>
        )}
        <div>
          {!finishedState && opponentName && (
            <h2 className="finished-state" style={{ paddingTop: "10px" }}>
              You are playing against {opponentName}
            </h2>
          )}
        </div>
        <div>
          {finishedState && finishedState === "OpponentLeftMatch" && (
            <h2 className="finished-state" style={{ paddingTop: "10px" }}>
              Opponent Left, You Won
            </h2>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameLayout;
