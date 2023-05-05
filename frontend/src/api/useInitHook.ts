import { useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useRecoilState, useSetRecoilState } from "recoil";
import { WebsocketContext } from "../pages/WrapMainPage";
import {
  currentGameInfoState,
  joinnedChatState,
  joinSocketState,
} from "./atom";

const useInitHook = () => {
  const [currentGame, setCurrentGame] = useRecoilState(currentGameInfoState);
  const [joinChat, setJoinChatList] = useRecoilState(joinnedChatState);
  const navigate = useNavigate();
  const location = useLocation();
  const socket = useContext(WebsocketContext)
  useEffect(() => {
    if(location.pathname !== '/main/game' && currentGame) {
      socket
    }
    console.log(navigate, location);
  }, []);
};

export default useInitHook;
