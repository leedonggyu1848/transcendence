import styled from "@emotion/styled";
import { useContext, useEffect, useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  alertModalState,
  allChatFlagState,
  banUserListState,
  chatListState,
  createChatModalToggleState,
  currentChatState,
  currentChatUserListState,
  joinChatToggleState,
  joinnedChatFlagState,
  joinnedChatState,
  myNameState,
  operatorModalToggleState,
} from "../../api/atom";
import { IChatRoom } from "../../api/interface";
import {
  chatSocketOff,
  listenAlert,
  listenBanUser,
  listenChangeOperator,
  listenCreateChat,
  listenJoinSucces,
  listenKickUser,
  listenLeaveSuccess,
  listenRequestAllChat,
  listenSomeoneJoinned,
  listenSomeoneLeave,
} from "../../api/socket/chat-socket";
import useInitHook from "../../api/useInitHook";
import { WebsocketContext } from "../../api/WebsocketContext";
import SideMenu from "../../components/SideMenu/SideMenu";
import ChatList from "./ChatList";
import CurrentChat from "./CurrentChat";
import JoinList from "./JoinList";

const ChatPage = () => {
  const socket = useContext(WebsocketContext);
  const openOperatorModal = useSetRecoilState(operatorModalToggleState);
  const openCreateChatModal = useSetRecoilState(createChatModalToggleState);
  const [allChatFlag, setAllChatFlag] = useRecoilState(allChatFlagState);
  const [joinnedChatFlag, setJoinnedChatFlag] =
    useRecoilState(joinnedChatFlagState);
  const clickOperatorButton = () => {
    openOperatorModal(true);
  };
  const [currentChat, setCurrentChat] = useRecoilState(currentChatState);
  const [chatList, setChatList] = useRecoilState(chatListState);
  const [currentChatUserList, setCurrentChatUserList] = useRecoilState(
    currentChatUserListState
  );
  const [joinnedChatList, setJoinnedChatList] =
    useRecoilState(joinnedChatState);
  const myName = useRecoilValue(myNameState);
  const setAlertInfo = useSetRecoilState(alertModalState);
  const setJoinChatToggle = useSetRecoilState(joinChatToggleState);

  const hooks: any = {
    socket,
    myName,
    setAlertInfo,
    setJoinChatToggle,
    currentChat,
    setCurrentChat,
    chatList,
    setChatList,
    currentChatUserList,
    setCurrentChatUserList,
    joinnedChatList,
    setJoinnedChatList,
  };

  useInitHook();
  const LeaveChatRoom = (roomName: string) => {
    socket.emit("leave-chat", roomName);
  };
  const joinChatRoom = (roomName: string, type: number) => {
    if (joinnedChatList[roomName] !== undefined) {
      //current chat setting
      setCurrentChat(roomName);
      return;
    }
    if (type === 2) {
      // password type 대응
      setJoinChatToggle({ roomName, toggle: true });
    } else {
      socket.emit("join-chat", { roomName, password: "" });
    }
  };

  useEffect(() => {
    if (!allChatFlag) {
      socket.emit("all-chat");
      setAllChatFlag(true);
    }

    if (!joinnedChatFlag) {
      socket.emit("chat-list");
      setJoinnedChatFlag(true);
    }

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

    socket.on("all-list", ({ chats }: { chats: IChatRoom[] }) => {
      setChatList([...chats]);
    });

    return () => {
      chatSocketOff(
        socket,
        "chat-list",
        "create-chat",
        "all-chat",
        "join-chat",
        "chat-success",
        "leave-chat",
        "chat-fail",
        "leave-chat-success",
        "join-chat-success",
        "kick-user",
        "ban-user",
        "chat-operator"
      );

      setAllChatFlag(true);
      setJoinnedChatFlag(true);

      // 얘네는 다른 페이지로 갔을 때 초기화 하는 로직으로 해야할 듯
      //setCurrentChat(null);
      //setCurrentChatUserList([]);
    };
  }, [chatList, joinnedChatList, currentChat, currentChatUserList]);

  return (
    <ChatPageContainer>
      <WapperContainer>
        <h1>Chatting</h1>
        <HeaderContainer>
          <div>전체 채팅 방 목록</div>
          <AddButton onClick={() => openCreateChatModal(true)} />
        </HeaderContainer>
        <ChatList joinChatRoom={joinChatRoom} data={chatList}></ChatList>
      </WapperContainer>
      {currentChat && joinnedChatList[currentChat] && (
        <WapperContainer>
          <HeaderContainer>
            <div>현재 참가 중인 방</div>
            <Leave
              onClick={() => LeaveChatRoom(joinnedChatList[currentChat].title)}
            >
              나가기
            </Leave>
          </HeaderContainer>
          <CurrentChat
            roomName={joinnedChatList[currentChat].title}
            operator={joinnedChatList[currentChat].operator === myName}
            myName={myName}
            data={UserDtoToJoinnedUserDto(
              joinnedChatList[currentChat].userList,
              myName,
              joinnedChatList[currentChat].operator
            )}
            clickOperatorButton={clickOperatorButton}
          />
        </WapperContainer>
      )}
      {!currentChat && (
        <WapperContainer>
          <HeaderContainer></HeaderContainer>
          <NotInChatRoom>채팅방을 선택해주세요</NotInChatRoom>
        </WapperContainer>
      )}
      <WapperContainer>
        <SideMenu w={285} />
        <HeaderContainer>
          <div>참여 중인 방 목록</div>
        </HeaderContainer>
        <JoinList data={joinnedChatList} handleLeave={LeaveChatRoom} />
      </WapperContainer>
    </ChatPageContainer>
  );
};

function UserDtoToJoinnedUserDto(
  data: string[],
  myName: string,
  operator: string
) {
  return data.map((name) => ({
    intra_id: name,
    type:
      name === operator ? "owner" : name === myName ? "opponent" : "watcher",
  }));
}

const Leave = styled.div`
  font-size: 1rem !important;
  background: white;
  color: var(--dark-bg-color) !important;
  border-radius: 5px;
  padding: 3px 7px;
  cursor: pointer;
`;
const NotInChatRoom = styled.div`
  width: 100%;
  height: 510px;
  background: var(--sub-bg-color);
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 1.25rem;
  border-radius: 10px;
`;

const AddButton = styled.div`
  cursor: pointer;
  width: 22px;
  height: 22px;
  background: url("/src/assets/addButton.png");
  background-size: 100% 100%;
`;

const HeaderContainer = styled.div`
  width: 100%;
  height: 50px;
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  & > div {
    margin: 5px;
    margin-bottom: 15px;
    color: white;
    font-size: 1.25rem;
  }
`;

const WapperContainer = styled.div`
  width: 285px;
  height: 100%;
  margin-left: 15px;
  display: flex;
  flex-direction: column;
  & > h1 {
    color: white;
    margin-top: 5px;
    font-size: 2.5rem;
  }
`;

const ChatPageContainer = styled.div`
  height: 95%;
  display: flex;
`;

export default ChatPage;
