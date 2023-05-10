import styled from "@emotion/styled";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
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
  gameCountState,
  gameListState,
  gameStartCountState,
  gameStartState,
  getMyInfoFlagState,
  inviteModalToggleState,
  joinChatToggleState,
  joinGameModalToggleState,
  joinnedChatState,
  myInfoState,
  myNameState,
  operatorModalToggleState,
  profileModalState,
  rankWaitModalToggleState,
  requestFriendListFlagState,
  settingModalState,
} from "../api/atom";
import RankWaitModal from "../components/Modals/RankWaitModal";
import { WebsocketContext } from "../pages/WrapMainPage";
import JoinGameModal from "../components/Modals/JoinGameModal";
import HistoryPage from "./HistoryPage/HistoryPage";
import AlertModal from "../components/Modals/AlertModal";
import OperatorModal from "../components/Modals/OperatorModal/OperatorModal";
import SettingModal from "../components/Modals/SettingModal/SettingModal";
import { axiosGetMyInfo } from "../api/request";
import CreateChatModal from "../components/Modals/CreateChatModal";
import JoinChatModal from "../components/Modals/JoinChatModal";
import ConfirmModal from "../components/Modals/ConfirmModal";
import {
  chatSocketOff,
  listenAlert,
  listenBlockList,
  listenChangeProfile,
  listenCheckConnection,
  listenFirstConnection,
  listenFriendConnection,
  listenFriendList,
  listenFriendRequestList,
  listenGameList,
  listenNameChange,
  listenRequestAllChat,
  listenUserAlert,
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
  listenChatInvite,
  listenChatMuted,
  listenChatReject,
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
  listenDisconnectUser,
  listenGameAccept,
  listenGameFail,
  listenGameInvite,
  listenGameReject,
  listenJoinGame,
  listenLeaveGame,
  listenLeaveWhilePlaying,
  listenMatchRank,
  listenNewGame,
  listenUserInGame,
  listenUserJoinGame,
  listenUserLeaveGame,
  listenUserWatchGame,
  listenWatchGame,
} from "../api/socket/game";
import InviteModal from "../components/Modals/InviteModal";
import ProfileModal from "../components/Modals/ProfileModal";

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
  const profileModal = useRecoilValue(profileModalState);
  const [friendList, setFriendList] = useRecoilState(friendListState);
  const [joinnedChatList, setJoinnedChatList] =
    useRecoilState(joinnedChatState);
  const [getMyInfoFlag, setGetMyInfoFlag] = useRecoilState(getMyInfoFlagState);
  const [requestFriendListFlag, setRequestFriendListFlag] = useRecoilState(
    requestFriendListFlagState
  );
  const navigate = useNavigate();

  const myName = useRecoilValue(myNameState);
  const setJoinChatToggle = useSetRecoilState(joinChatToggleState);
  const [currentChat, setCurrentChat] = useRecoilState(currentChatState);
  const [chatList, setChatList] = useRecoilState(chatListState);
  const confirmModalState = useRecoilValue(confirmModalToggleState);
  const [blockList, setBlockList] = useRecoilState(blockUserListState);
  const [currentGame, setCurrentGame] = useRecoilState(currentGameInfoState);
  const [gameList, setGameList] = useRecoilState(gameListState);
  const inviteModalToggle = useRecoilValue(inviteModalToggleState);
  const location = useLocation();
  const [rankWaitModal, setRankWaitModal] = useRecoilState(
    rankWaitModalToggleState
  );
  const setStartCount = useSetRecoilState(gameStartCountState);
  const setStart = useSetRecoilState(gameStartState);
  const setCount = useSetRecoilState(gameCountState);

  const hooks: any = {
    socket,
    myName,
    setAlertInfo,
    setJoinChatToggle,
    currentChat,
    setMyInfo,
    setCurrentChat,
    chatList,
    setChatList,
    joinnedChatList,
    setJoinnedChatList,
    setFriendRequestList,
    setFriendList,
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
    requestFriendListFlag,
    setRequestFriendListFlag,
    location,
    setStart,
    setCount,
    setStartCount,
  };

  useEffect(() => {
    if (!token.access_token) navigate("/no_auth");
    if (!getMyInfoFlag) {
      getMyInfo();
      setGetMyInfoFlag(true);
    }
    if (sessionStorage.getItem("data")) {
      const {
        myInfo,
        currentChat,
        joinnedChatList,
        chatList,
        currentGame,
        friendList,
        gameList,
        friendRequestList,
      } = JSON.parse(sessionStorage.getItem("data"));

      if (currentChat) setCurrentChat(currentChat);
      if (joinnedChatList) setJoinnedChatList(joinnedChatList);
      if (chatList) setChatList(chatList);
      if (friendList) setFriendList(friendList);
      if (gameList) setGameList(gameList);
      if (friendRequestList) setFriendRequestList(friendRequestList);
      if (sessionStorage.getItem("refreshWhilePlaying")) {
        const { userName, roomName, type } = JSON.parse(
          sessionStorage.getItem("refreshWhilePlaying")
        );
        if (type === 1) {
          navigate("/main/lobby");
          setAlertInfo({
            type: "failure",
            header: "",
            msg: "새로고침 해서 패배 처리 됩니다.",
            toggle: true,
          });
          setMyInfo({
            ...myInfo,
            rankLose: myInfo.rankLose + 1,
          });
        } else {
          navigate("/main/lobby");
          setAlertInfo({
            type: "failure",
            header: "",
            msg: "새로고침 해서 패배 처리 됩니다.",
            toggle: true,
          });
          setCurrentGame(null);
          setMyInfo({
            ...myInfo,
            normalLose: myInfo.normalLose + 1,
          });
        }
        sessionStorage.removeItem("refreshWhilePlaying");
      } else {
        if (currentGame) setCurrentGame(currentGame);
        if (myInfo) setMyInfo(myInfo);
      }
      sessionStorage.removeItem("data");
    }

    window.addEventListener("beforeunload", () => {
      const temp = {
        myInfo,
        currentChat,
        joinnedChatList,
        friendList,
        gameList,
        friendRequestList,
        chatList,
        currentGame,
      };
      sessionStorage.setItem("data", JSON.stringify(temp));
    });

    //Connection apis
    listenFirstConnection(hooks);
    listenFriendConnection(hooks);
    listenFriendRequestList(hooks);
    listenFriendList(hooks);
    listenRequestAllChat(hooks);
    listenBlockList(hooks);
    listenGameList(hooks);
    listenDisconnectUser(hooks);
    listenUserAlert(hooks);

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
    listenChatInvite(hooks);
    listenChatReject(hooks);

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
    listenNameChange(hooks);
    listenUserInGame(hooks);
    listenChangeProfile(hooks);
    listenGameInvite(hooks);
    listenGameAccept(hooks);
    listenGameReject(hooks);
    listenLeaveWhilePlaying(hooks);

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
        "user-fail",
        "disconnect-user",
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
        "chat-invite",
        "chat-reject",
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
        "game-invite",
        "game-accept",
        "game-reject",
        "match-rank",
        "user-name",
        "user-ingame",
        "user-profile",
        "refresh-while-playing",
        "leave-while-playing"
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
        {inviteModalToggle.toggle && <InviteModal />}
        {profileModal.toggle && <ProfileModal />}
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
