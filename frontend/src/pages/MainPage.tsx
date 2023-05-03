import styled from "@emotion/styled";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import Menu from "../components/Menu";
import ChatPage from "./ChatPage/ChatPage";
import GamePage from "./Game/GamePage";
import { useCookies } from "react-cookie";
import { useContext, useEffect } from "react";
import GameLobbyContainer from "./GameLobby/Con_GameLobby";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  alertModalState,
  blockUserListState,
  chatListState,
  confirmModalToggleState,
  createChatModalToggleState,
  currentChatState,
  currentGameInfoState,
  friendListState,
  friendRequestListState,
  gameListState,
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
import { WebsocketContext } from "../api/WebsocketContext";
import JoinGameModal from "../components/Modals/JoinGameModal";
import HistoryPage from "./HistoryPage/HistoryPage";
import AlertModal from "../components/Modals/AlertModal";
import OperatorModal from "../components/Modals/OperatorModal/OperatorModal";
import SettingModal from "../components/Modals/SettingModal/SettingModal";
import { axiosGetGameList, axiosGetMyInfo } from "../api/request";
import CreateChatModal from "../components/Modals/CreateChatModal";
import JoinChatModal from "../components/Modals/JoinChatModal";
import ConfirmModal from "../components/Modals/ConfirmModal";
import {
  chatSocketOff,
  listenAlert,
  listenBlockList,
  listenCheckConnection,
  listenFirstConnection,
  listenFriendConnection,
  listenFriendList,
  listenFriendRequestList,
  listenGameList,
  listenRequestAllChat,
} from "../api/socket/connect";
import {
  listenCancelFriend,
  listenDeleteFriend,
  listenFriendFail,
  listenFriendResult,
  listenNewFriend,
  listenReceiveDM,
  listenRequestFriend,
  listenResponseFriend,
  listenSendDM,
} from "../api/socket/friend";
import {
  listenBanCancel,
  listenBanUser,
  listenBlockUser,
  listenChangeOperator,
  listenChatMuted,
  listenCreateChat,
  listenJoinSucces,
  listenKickUser,
  listenLeaveSuccess,
  listenMessage,
  listenMuteUser,
  listenSomeoneJoinned,
  listenSomeoneLeave,
  listenUnBlockUser,
} from "../api/socket/chat";
import {
  listenCreateGame,
  listenGameFail,
  listenGameResult,
  listenJoinGame,
  listenLeaveGame,
  listenMatchRank,
  listenNewGame,
  listenUserJoinGame,
  listenUserLeaveGame,
  listenUserWatchGame,
  listenWatchGame,
} from "../api/socket/game";
import NormalGamePage from "./Game/GamePage";

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
  const [blockList, setBlockList] = useRecoilState(blockUserListState);
  const [currentGame, setCurrentGame] = useRecoilState(currentGameInfoState);
  const [gameList, setGameList] = useRecoilState(gameListState);
  const [rankWaitModal, setRankWaitModal] = useRecoilState(
    rankWaitModalToggleState
  );

  interface PerformanceEntryWithOptionalType extends PerformanceEntry {
    type?: string;
  }
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
    blockList,
    setBlockList,
    myInfo,
    currentGame,
    setCurrentGame,
    gameList,
    setGameList,
    navigate,
    setRankWaitModal,
  };

  useEffect(() => {
    if (!token.access_token) navigate("/no_auth");
    if (!getMyInfoFlag) {
      getMyInfo();
      setGetMyInfoFlag(true);
    }
    if (sessionStorage.getItem("myInfo")) {
      setMyInfo(JSON.parse(sessionStorage.getItem("myInfo")));
      sessionStorage.removeItem("myInfo");
    }
    if (sessionStorage.getItem("currentChat")) {
      setCurrentChat(sessionStorage.getItem("currentChat"));
      sessionStorage.removeItem("currentChat");
    }
    if (sessionStorage.getItem("joinnedChat")) {
      setJoinnedChatList(JSON.parse(sessionStorage.getItem("joinnedChat")));
      sessionStorage.removeItem("joinnedChat");
    }
    if (sessionStorage.getItem("chatList")) {
      setChatList(JSON.parse(sessionStorage.getItem("chatList")));
      sessionStorage.removeItem("chatList");
    }
    if (sessionStorage.getItem("currentGame")) {
      setCurrentGame(JSON.parse(sessionStorage.getItem("currentGame")));
      sessionStorage.removeItem("currentGame");
    }

    const navigationEntry = performance.getEntriesByType(
      "navigation"
    )[0] as PerformanceEntryWithOptionalType;
    if (navigationEntry?.type === "navigate") {
      sessionStorage.clear();
    }

    window.addEventListener("beforeunload", () => {
      sessionStorage.setItem("myInfo", JSON.stringify(myInfo));
      sessionStorage.setItem("currentChat", currentChat);
      sessionStorage.setItem("joinnedChat", JSON.stringify(joinnedChatList));
      sessionStorage.setItem("chatList", JSON.stringify(chatList));
      if (currentGame)
        sessionStorage.setItem("currentGame", JSON.stringify(currentGame));
    });

    //Connection apis
    listenFirstConnection(hooks);
    listenFriendConnection(hooks);
    listenFriendRequestList(hooks);
    listenFriendList(hooks);
    listenRequestAllChat(hooks);
    listenBlockList(hooks);
    listenGameList(hooks);

    //friends apis
    listenCancelFriend(hooks);
    listenRequestFriend(hooks);
    listenNewFriend(hooks);
    listenDeleteFriend(hooks);
    listenFriendResult(hooks);
    listenResponseFriend(hooks);
    listenCheckConnection(hooks);
    listenFriendFail(hooks);

    //chat apis
    listenMessage(hooks);
    listenCreateChat(hooks);
    listenSomeoneJoinned(hooks);
    listenJoinSucces(hooks);
    listenSomeoneLeave(hooks);
    listenLeaveSuccess(hooks);
    listenAlert(hooks);
    listenKickUser(hooks);
    listenBanUser(hooks);
    listenBanCancel(hooks);
    listenSendDM(hooks);
    listenReceiveDM(hooks);
    listenChangeOperator(hooks);
    listenBlockUser(hooks);
    listenUnBlockUser(hooks);
    listenMuteUser(hooks);
    listenChatMuted(hooks);

    //game apis
    listenCreateGame(hooks);
    listenNewGame(hooks);
    listenJoinGame(hooks);
    listenUserJoinGame(hooks);
    listenWatchGame(hooks);
    listenUserWatchGame(hooks);
    listenLeaveGame(hooks);
    listenUserLeaveGame(hooks);
    listenMatchRank(hooks);
    listenGameFail(hooks);
    listenGameResult(hooks);

    async function getMyInfo() {
      const myInfo = await axiosGetMyInfo();
      setMyInfo({ ...myInfo });
      //const gameList = await axiosGetGameList();
      //setGameList(gameList);

      socket.emit("first-connection", myInfo.userName);
    }

    return () => {
      chatSocketOff(
        socket,
        "first-connection",
        "connect-user",
        "friend-request-list",
        "friend-list",
        "game-list",
        "cancel-friend",
        "request-friend",
        "new-friend",
        "delete-friend",
        "friend-result",
        "response-friend",
        "check-connection",
        "friend-fail",
        "message",
        "create-chat",
        "all-chat",
        "join-chat",
        "join-chat-success",
        "leave-chat",
        "leave-chat-success",
        "chat-fail",
        "kick-user",
        "ban-user",
        "ban-cancel",
        "send-dm",
        "receive-dm",
        "chat-operator",
        "block-list",
        "block-user",
        "block-cancel",
        "mute-user",
        "chat-muted",
        "game-fail",
        "new-game",
        "create-game",
        "join-game",
        "user-join-game",
        "watch-game",
        "user-watch-game",
        "leave-game",
        "user-leave-game",
        "match-rank",
        "game-result"
      );
    };
  }, [
    myInfo,
    gameList,
    joinnedChatList,
    chatList,
    friendList,
    friendRequestList,
  ]);
  return (
    token.access_token && (
      <MainPageContainer>
        <Menu />
        <Routes>
          <Route path="lobby" element={<GameLobbyContainer />} />
          {/*<Route path="/game" element={<GamePage />} />*/}
          <Route path="/game" element={<GamePage />} />
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
