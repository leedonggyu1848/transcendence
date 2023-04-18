import styled from "@emotion/styled";
import { useContext, useEffect, useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  allChatFlagState,
  chatListState,
  createChatModalToggleState,
  currentChatState,
  currentChatUserListState,
  joinnedChatFlagState,
  joinnedChatState,
  myNameState,
  operatorModalToggleState,
} from "../../api/atom";
import {
  ChatListDto,
  IChatRoom,
  JoinListDto,
  UserDto,
} from "../../api/interface";
import useInitHook from "../../api/useInitHook";
import { WebsocketContext } from "../../api/WebsocketContext";
import CurrentUserInfo from "../../components/CurrentUserInfo";
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

  useInitHook();

  const LeaveChatRoom = (roomName: string) => {
    console.log("leave room ", roomName);
  };
  console.log(currentChatUserList);

  const joinChatRoom = (
    roomName: string,
    type: number,
    operator: string,
    count: number
  ) => {
    console.log(roomName, currentChatUserList, joinnedChatList);
    if (joinnedChatList.some((chat) => chat.title === roomName)) {
      //current chat setting
      setCurrentChat({
        title: roomName,
        type,
        operator,
        count: count + 1,
      });
      return;
    }
    if (type === 2) {
      // password type 대응
    } else {
      socket.emit("join-chat", { roomName, type, operator, password: "" });
    }
    console.log("hi", roomName, type);
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

    socket.on(
      "create-chat",
      ({
        roomName,
        type,
        operator,
      }: {
        roomName: string;
        type: number;
        operator: string;
      }) => {
        console.log("listen creaet-chat", chatList);
        if (type !== 1) {
          setChatList([
            ...chatList,
            {
              title: roomName,
              type,
              operator,
              count: 1,
            },
          ]);
        }
      }
    );

    socket.on("all-chat", ({ chats }: { chats: IChatRoom[] }) => {
      setChatList(chats.filter((chat) => chat.type !== 1));
    });

    socket.on("chat-list", ({ chats }: { chats: IChatRoom[] }) => {
      console.log(chats);
      setJoinnedChatList([...chats]);
    });

    socket.on(
      "join-chat",
      ({ roomName, userInfo }: { roomName: string; userInfo: UserDto }) => {
        console.log("새로운 방 참여");
        console.log(roomName, userInfo);
      }
    );

    socket.on(
      "join-success",
      ({
        roomName,
        type,
        operator,
        users,
      }: {
        roomName: string;
        type: number;
        operator: string;
        users: UserDto[];
      }) => {
        console.log("in join-success", users);
        setCurrentChat({
          title: roomName,
          type,
          operator,
          count: users.length,
        });
        setCurrentChatUserList(users.slice());
      }
    );

    return () => {
      socket.off("chat-list");
      socket.off("create-chat");
      socket.off("all-chat");
      socket.off("join-chat");
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
      {currentChat && (
        <WapperContainer>
          <HeaderContainer>
            <div>현재 참가 중인 방</div>
            <Leave onClick={() => LeaveChatRoom(currentChat.title)}>
              나가기
            </Leave>
          </HeaderContainer>
          <CurrentChat
            roomName={currentChat.title}
            operator={currentChat.operator === myName}
            myName={myName}
            data={UserDtoToJoinnedUserDto(
              currentChatUserList,
              myName,
              currentChat.operator
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
        <JoinList data={joinnedChatList} />
      </WapperContainer>
    </ChatPageContainer>
  );
};

function UserDtoToJoinnedUserDto(
  data: UserDto[],
  myName: string,
  operator: string
) {
  return data.map(({ intra_id }) => ({
    intra_id,
    type:
      intra_id === operator
        ? "owner"
        : intra_id === myName
        ? "opponent"
        : "watcher",
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
