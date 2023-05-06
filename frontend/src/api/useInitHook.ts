import { useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { WebsocketContext } from "../pages/WrapMainPage";
import { currentGameInfoState } from "./atom";

const useInitHook = () => {
  const currentGame = useRecoilValue(currentGameInfoState);
  const location = useLocation();
  const socket = useContext(WebsocketContext);
  useEffect(() => {
    if (location.pathname !== "/main/game" && currentGame) {
      console.log(currentGame);
      socket.emit("leave-game", currentGame.gameDto.title);
    }
  }, [location]);
};

export default useInitHook;
