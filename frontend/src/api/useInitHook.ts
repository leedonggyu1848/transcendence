import { useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { WebsocketContext } from "../pages/WrapMainPage";
import {
  currentChatState,
  currentGameInfoState,
  gameCountState,
  gameStartCountState,
  gameStartState,
  joinnedChatState,
  myInfoState,
  myNameState,
  rankGameFlagState,
  sideMenuToggle,
} from "./atom";

const useInitHook = () => {
  const [currentGame, setCurrentGame] = useRecoilState(currentGameInfoState);
  const location = useLocation();
  const socket = useContext(WebsocketContext);
  const [count, setCount] = useRecoilState(gameCountState);
  const [start, setStart] = useRecoilState(gameStartState);
  const [startCount, setStartCount] = useRecoilState(gameStartCountState);
  const myName = useRecoilValue(myNameState);
  const setRankGameFlag = useSetRecoilState(rankGameFlagState);
  const [myInfo, setMyInfo] = useRecoilState(myInfoState);
  const setCurrentChat = useSetRecoilState(currentChatState);
  const [toggles, setToggles] = useRecoilState(sideMenuToggle);
  const [joinnedChatList, setJoinnedChatList] =
    useRecoilState(joinnedChatState);
  useEffect(() => {
    setToggles({ alarm: false, friends: false });
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

      setCurrentGame(null);
      setCurrentChat("");
      const temp = {
        ...joinnedChatList,
      };
      delete temp[currentGame.gameDto.title];

      setJoinnedChatList({ ...temp });
    }
    setCount(4);
    setStart(false);
    setStartCount(false);
    setRankGameFlag(false);
  }, [location]);
};

export default useInitHook;
