import { useState } from "react";
import "./Square.css";
import { circleSvg, crossSvg } from "./Svg";

const Square = ({
  setGameState,
  id,
  currentPlayer,
  setCurrentPlayer,
  finishedState,
  finishedArrayState,
  socket,
  currentElement,
  playingAs
}) => {
  const [icon, setIcon] = useState(null);

  const clickOnSquare = () => {

    if(currentPlayer !== playingAs){
      return;
    }

    if (finishedState) {
      return;
    }

    if (!icon) {
      if (currentPlayer == "circle") setIcon(circleSvg);
      else setIcon(crossSvg);

      const myCurrentPlayer = currentPlayer;
    
      socket?.emit("playerMoveFromClient",{
        state: {
          id,
          sign: currentPlayer
        }
      });

      setCurrentPlayer((prev) => (prev === "circle" ? "cross" : "circle"));

      setGameState((prevState) => {
        let newSate = [...prevState];
        const rowIndex = Math.floor(id / 3);
        const colIndex = id % 3;
        newSate[rowIndex][colIndex] = myCurrentPlayer;
        // console.log(newSate);
        return newSate;
      });

    }
  };

  return (
    <div
      className={`square ${finishedState || currentPlayer !== playingAs ? "not-allowed" : ""} ${
        finishedArrayState.includes(id) ? finishedState + "-won" : ""} ${
        finishedArrayState.includes(id) && finishedState && finishedState !== playingAs ? "grey-background" : ""
      }`}
      onClick={clickOnSquare}
    >
      {currentElement === "circle" ? circleSvg : currentElement === "cross" ? crossSvg : ""}
    </div>
  );
};

export default Square;
