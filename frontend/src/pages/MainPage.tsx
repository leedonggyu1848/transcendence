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
  allChatFlagState,
  chatListState,
  confirmModalToggleState,
  createChatModalToggleState,
  currentChatState,
  friendListState,
  friendRequestListState,
  getMyInfoFlagState,
  joinChatToggleState,
  joinGameModalToggleState,
  joinnedChatState,
  myInfoState,
  myNameState,
  operatorModalToggleState,
  rankWaitModalToggleState,
  requestFriendListFlagState,
  settingModalState,
} from "../api/atom";
import RankWaitModal from "../components/Modals/RankWaitModal";
import NormalGamePage from "./NormalGame/NormalGamePage";
import { WebsocketContext } from "../api/WebsocketContext";
import JoinGameModal from "../components/Modals/JoinGameModal";
import HistoryPage from "./HistoryPage/HistoryPage";
import AlertModal from "../components/Modals/AlertModal";
import OperatorModal from "../components/Modals/OperatorModal/OperatorModal";
import SettingModal from "../components/Modals/SettingModal/SettingModal";
import { axiosGetMyInfo } from "../api/request";
import CreateChatModal from "../components/Modals/CreateChatModal";
import JoinChatModal from "../components/Modals/JoinChatModal";
import { IFriendDto, IFriendRequest } from "../api/interface";
import {
  chatSocketOff,
  listenAlert,
  listenBanUser,
  listenCancelFriend,
  listenChangeOperator,
  listenCreateChat,
  listenDeleteFriend,
  listenFirstConnection,
  listenFriendFail,
  listenFriendList,
  listenFriendRequestList,
  listenFriendResult,
  listenJoinSucces,
  listenKickUser,
  listenLeaveSuccess,
  listenMessage,
  listenNewFriend,
  listenRequestAllChat,
  listenRequestFriend,
  listenResponseFriend,
  listenSomeoneJoinned,
  listenSomeoneLeave,
} from "../api/socket/chat-socket";
import ConfirmModal from "../components/Modals/ConfirmModal";

const MainPage = () => {
  const [token, _] = useCookies(["access_token"]);
  const rankWaitModalToggle = useRecoilValue(rankWaitModalToggleState);
  const joinGameModalToggle = useRecoilValue(joinGameModalToggleState);
  const [alertModalToggle, setAlertInfo] = useRecoilState(alertModalState);
  const operatorModalToggle = useRecoilValue(operatorModalToggleState);
  const settingModalToggle = useRecoilValue(settingModalState);
  const createChatModalToggle = useRecoilValue(createChatModalToggleState);
  const joinChatToggle = useRecoilValue(joinChatToggleState);
  const [myInfo, setMyInfo] = useRecoilState(myInfoState);
  const socket = useContext(WebsocketContext);
  const [friendRequestList, setFriendRequestList] = useRecoilState(
    friendRequestListState
  );
  const [friendList, setFriendList] = useRecoilState(friendListState);
  const [requestFriendListFlag, setRequestFriendListFlag] = useRecoilState(
    requestFriendListFlagState
  );
  const [joinnedChatList, setJoinnedChatList] =
    useRecoilState(joinnedChatState);
  const [getMyInfoFlag, setGetMyInfoFlag] = useRecoilState(getMyInfoFlagState);

  const navigate = useNavigate();

  const myName = useRecoilValue(myNameState);
  const setJoinChatToggle = useSetRecoilState(joinChatToggleState);
  const [currentChat, setCurrentChat] = useRecoilState(currentChatState);
  const [chatList, setChatList] = useRecoilState(chatListState);
  const confirmModalState = useRecoilValue(confirmModalToggleState);

  const hooks: any = {
    socket,
    myName,
    setAlertInfo,
    setJoinChatToggle,
    currentChat,
    setCurrentChat,
    chatList,
    setChatList,
    joinnedChatList,
    setJoinnedChatList,
    setFriendRequestList,
    setFriendList,
    setRequestFriendListFlag,
    friendRequestList,
    friendList,
  };

  useEffect(() => {
    if (!token.access_token) navigate("/no_auth");
    if (!getMyInfoFlag) {
      getMyInfo();
      setGetMyInfoFlag(true);
    }

    listenRequestAllChat(hooks);
    listenFirstConnection(hooks);
    listenFriendRequestList(hooks);
    listenFriendList(hooks);
    listenCancelFriend(hooks);
    listenDeleteFriend(hooks);
    listenFriendResult(hooks);
    listenFriendFail(hooks);
    listenResponseFriend(hooks);
    listenNewFriend(hooks);
    listenRequestFriend(hooks);

    listenMessage(hooks);
    listenCreateChat(hooks);
    listenRequestAllChat(hooks);
    listenSomeoneJoinned(hooks);
    listenJoinSucces(hooks);
    listenSomeoneLeave(hooks);
    listenLeaveSuccess(hooks);
    listenAlert(hooks);
    listenKickUser(hooks);
    listenBanUser(hooks);
    listenChangeOperator(hooks);

    async function getMyInfo() {
      const myInfo = await axiosGetMyInfo();
      setMyInfo({ ...myInfo });
      localStorage.setItem("info", JSON.stringify(myInfo));

      socket.emit("first-connection", myInfo.userName);
    }

    return () => {
      chatSocketOff(
        socket,
        "all-chat",
        "chat-list",
        "create-chat",
        "join-chat",
        "chat-success",
        "leave-chat",
        "chat-fail",
        "leave-chat-success",
        "join-chat-success",
        "kick-user",
        "ban-user",
        "chat-operator",
        "first-connection",
        "request-friend",
        "friend-request-list",
        "cancel-friend",
        "delete-friend",
        "friend-fail",
        "new-friend",
        "friend-list",
        "message"
      );
    };
  }, [myInfo, joinnedChatList, chatList]);
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
        {confirmModalState.toggle && <ConfirmModal />}
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
