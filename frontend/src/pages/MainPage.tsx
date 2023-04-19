import styled from "@emotion/styled";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import Menu from "../components/Menu";
import GamePage from "./GamePage";
import ChatPage from "./ChatPage/ChatPage";
import { useCookies } from "react-cookie";
import { useContext, useEffect } from "react";
import GameLobbyContainer from "./GameLobby/Con_GameLobby";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  alertModalState,
  createChatModalToggleState,
  friendRequestListState,
  joinChatToggleState,
  joinGameModalToggleState,
  myInfoState,
  operatorModalToggleState,
  rankWaitModalToggleState,
  settingModalState,
} from "../api/atom";
import RankWaitModal from "../components/Modals/RankWaitModal";
import NormalGamePage from "./NormalGame/NormalGamePage";
import { socket, WebsocketContext } from "../api/WebsocketContext";
import JoinGameModal from "../components/Modals/JoinGameModal";
import HistoryPage from "./HistoryPage/HistoryPage";
import AlertModal from "../components/Modals/AlertModal";
import OperatorModal from "../components/Modals/OperatorModal/OperatorModal";
import SettingModal from "../components/Modals/SettingModal/SettingModal";
import { axiosGetFriendRequestList, axiosGetMyInfo } from "../api/request";
import CreateChatModal from "../components/Modals/CreateChatModal";
import JoinChatModal from "../components/Modals/JoinChatModal";
import { IFriendDto, IFriendRequest } from "../api/interface";

const MainPage = () => {
  const [token, _] = useCookies(["access_token"]);
  const rankWaitModalToggle = useRecoilValue(rankWaitModalToggleState);
  const joinGameModalToggle = useRecoilValue(joinGameModalToggleState);
  const alertModalToggle = useRecoilValue(alertModalState);
  const operatorModalToggle = useRecoilValue(operatorModalToggleState);
  const settingModalToggle = useRecoilValue(settingModalState);
  const createChatModalToggle = useRecoilValue(createChatModalToggleState);
  const joinChatToggle = useRecoilValue(joinChatToggleState);
  const setMyInfo = useSetRecoilState(myInfoState);
  const socket = useContext(WebsocketContext);
  const setFriendRequestList = useSetRecoilState(friendRequestListState);

  const navigate = useNavigate();

  useEffect(() => {
    if (!token.access_token) navigate("/no_auth");
    getMyInfo();

    async function getMyInfo() {
      const myInfo = await axiosGetMyInfo();
      setMyInfo({ ...myInfo });

      socket.emit("first-connection", myInfo.intra_id);
    }
    socket.on("first-connection", () => {
      console.log("연결 성공");
      socket.emit("friend-request-list");
    });
    //socket.on("receive-friend-request", (sender: string) => {});
    socket.on("friend-request-list", (request: IFriendRequest[]) => {
      //console.log(request);
      setFriendRequestList([...request]);
    });

    return () => {
      socket.off("first-connection");
      socket.off("friend-request-list");
    };
  }, []);
  return (
    token.access_token && (
      <MainPageContainer>
        <Menu />
        <Routes>
          <Route path="lobby" element={<GameLobbyContainer />} />
          <Route path="/game" element={<GamePage />} />
          <Route path="/game/normal" element={<NormalGamePage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="*" element={<Navigate to="/not_found" />} />
        </Routes>
        {rankWaitModalToggle && <RankWaitModal />}
        {joinGameModalToggle.toggle && <JoinGameModal />}
        {alertModalToggle.toggle && <AlertModal />}
        {operatorModalToggle && <OperatorModal />}
        {settingModalToggle && <SettingModal />}
        {createChatModalToggle && <CreateChatModal />}
        {joinChatToggle.toggle && <JoinChatModal />}
      </MainPageContainer>
    )
  );
};

const MainPageContainer = styled.div`
  width: 1000px;
  height: 700px;
  background: var(--main-bg-color);
  border-radius: 20px;
  display: flex;
  align-items: center;
`;

export default MainPage;
