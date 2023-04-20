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
  friendListState,
  friendRequestListState,
  joinChatToggleState,
  joinGameModalToggleState,
  myInfoState,
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

const MainPage = () => {
  const [token, _] = useCookies(["access_token"]);
  const rankWaitModalToggle = useRecoilValue(rankWaitModalToggleState);
  const joinGameModalToggle = useRecoilValue(joinGameModalToggleState);
  const [alertModalToggle, setAlertInfo] = useRecoilState(alertModalState);
  const operatorModalToggle = useRecoilValue(operatorModalToggleState);
  const settingModalToggle = useRecoilValue(settingModalState);
  const createChatModalToggle = useRecoilValue(createChatModalToggleState);
  const joinChatToggle = useRecoilValue(joinChatToggleState);
  const setMyInfo = useSetRecoilState(myInfoState);
  const socket = useContext(WebsocketContext);
  const [friendRequestList, setFriendRequestList] = useRecoilState(
    friendRequestListState
  );
  const [friendList, setFriendList] = useRecoilState(friendListState);
  const [requestFriendListFlag, setRequestFriendListFlag] = useRecoilState(
    requestFriendListFlagState
  );

  const navigate = useNavigate();

  useEffect(() => {
    if (!token.access_token) navigate("/no_auth");
    getMyInfo();
    if (!requestFriendListFlag) {
      socket.emit("friend-list");
    }

    socket.on("friend-list", (friends: IFriendDto[]) => {
      setFriendList([...friends]);
      setRequestFriendListFlag(true);
    });

    async function getMyInfo() {
      const myInfo = await axiosGetMyInfo();
      setMyInfo({ ...myInfo });

      socket.emit("first-connection", myInfo.intra_id);
    }
    socket.on("first-connection", () => {
      socket.emit("friend-request-list");
    });
    //socket.on("receive-friend-request", (sender: string) => {});
    socket.on("friend-request-list", (request: IFriendRequest[]) => {
      setFriendRequestList([...request]);
    });
    socket.on("cacnel-friend", (userName: string) => {
      setFriendRequestList(
        friendRequestList.filter((friend) => friend.intra_id !== userName)
      );
    });

    socket.on("cancel-friend", ({ userName }: { userName: string }) => {
      setFriendRequestList(
        friendRequestList.filter((request) => request.intra_id !== userName)
      );
    });

    socket.on("delete-friend", ({ username }: { username: string }) => {
      setFriendList(
        friendList.filter((friend) => friend.intra_id !== username)
      );
    });

    socket.on(
      "friend-result",
      ({
        username,
        type,
        profile,
      }: {
        username: string;
        type: boolean;
        profile: string;
      }) => {
        setFriendRequestList(
          friendRequestList.filter((request) => request.intra_id !== username)
        );
        if (type) {
          setFriendList([
            ...friendList,
            { intra_id: username, profile: profile },
          ]);
        }
      }
    );

    socket.on("friend-fail", (message: string) => {
      setAlertInfo({
        type: "failure",
        header: "",
        msg: message,
        toggle: true,
      });
    });

    return () => {
      socket.off("first-connection");
      socket.off("friend-request-list");
      socket.off("cancel-friend");
      socket.off("delete-friend");
      socket.off("friend-fail");
      socket.off("friend-list");
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
