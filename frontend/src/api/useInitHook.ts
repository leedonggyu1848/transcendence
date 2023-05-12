import { useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { WebsocketContext } from "../pages/WrapMainPage";
import {
  alertModalState,
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
  const [currentChat, setCurrentChat] = useRecoilState(currentChatState);
  const [toggles, setToggles] = useRecoilState(sideMenuToggle);
  const setAlertModal = useSetRecoilState(alertModalState);
  const [joinnedChatList, setJoinnedChatList] =
    useRecoilState(joinnedChatState);
  useEffect(() => {
    setToggles({ alarm: false, friends: false });

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
          //let opponent =
          //  currentGame.ownerDto.userName === myName
          //    ? currentGame.opponentDto.userName
          //    : currentGame.ownerDto.userName;
          //socket.emit("end-game", {
          //  userName: opponent,
          //  roomName: currentGame.gameDto.title,
          //});
          setAlertModal({
            type: "failure",
            header: "",
            msg: "게임 도중 나가서 패배했습니다",
            toggle: true,
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
