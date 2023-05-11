import { useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { WebsocketContext } from "../pages/WrapMainPage";
import {
  currentGameInfoState,
  gameCountState,
  gameStartCountState,
  gameStartState,
  myInfoState,
  myNameState,
  rankGameFlagState,
} from "./atom";

const useInitHook = () => {
  const currentGame = useRecoilValue(currentGameInfoState);
  const location = useLocation();
  const socket = useContext(WebsocketContext);
  const [count, setCount] = useRecoilState(gameCountState);
  const [start, setStart] = useRecoilState(gameStartState);
  const [startCount, setStartCount] = useRecoilState(gameStartCountState);
  const myName = useRecoilValue(myNameState);
  const setRankGameFlag = useSetRecoilState(rankGameFlagState);
  const [myInfo, setMyInfo] = useRecoilState(myInfoState);
  useEffect(() => {
    console.log(count, start, startCount);
    if (location.pathname !== "/main/game" && currentGame) {
      if (sessionStorage.getItem("opponentLeavingWhileGame")) {
        sessionStorage.removeItem("opponentLeavingWhileGame");
      } else {
        if (
          count !== 4 ||
          start ||
          (startCount && myName === currentGame.ownerDto.userName)
        ) {
          setMyInfo({
            ...myInfo,
            normalLose:
              currentGame.gameDto.type === 1
                ? myInfo.normalLose
                : myInfo.normalLose + 1,
            rankLose:
              currentGame.gameDto.type === 1
                ? myInfo.rankLose + 1
                : myInfo.rankLose,
          });
        }
        socket.emit("leave-game", currentGame.gameDto.title);
      }
    }
    setCount(4);
    setStart(false);
    setStartCount(false);
    setRankGameFlag(false);
  }, [location]);
};

export default useInitHook;
