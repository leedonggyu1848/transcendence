import styled from "@emotion/styled";
import { useContext, useEffect, useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  allChatFlagState,
  chatListState,
  createChatModalToggleState,
  currentChatState,
  joinnedChatFlagState,
  joinnedChatState,
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
  const [joinnedChatList, setJoinnedChatList] =
    useRecoilState(joinnedChatState);

  useInitHook();

  const joinChatRoom = (
    roomName: string,
    type: number,
    operator: string,
    count: number
  ) => {
    console.log(roomName, joinnedChatList);
    if (joinnedChatList.some((chat) => chat.title === roomName)) {
      //current chat setting
      setCurrentChat({
        title: roomName,
        type,
        operator,
        count: count + 1,
      });
      socket.emit("join-chat", roomName);
      return;
    }
    if (type === 2) {
      // password type 대응
    }
    console.log("hi", roomName, type);
  };

  useEffect(() => {
    if (!allChatFlag) {
      socket.emit("all-chat");
    }

    if (!joinnedChatFlag) {
      socket.emit("chat-list");
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
      setAllChatFlag(true);
    });

    socket.on("chat-list", ({ chats }: { chats: IChatRoom[] }) => {
      console.log(chats);
      setJoinnedChatList([...chats]);
      setJoinnedChatFlag(true);
    });

    socket.on(
      "join-chat",
      ({ roomName, userInfo }: { roomName: string; userInfo: UserDto }) => {
        console.log(roomName, userInfo);
        if (joinnedChatList.some((chat) => chat.title === roomName)) {
          console.log("이미 참여한 방입니다", userInfo);
        } else {
          console.log("새로운 방 참여");
          console.log(roomName, userInfo);
        }
      }
    );

    return () => {
      socket.off("chat-list");
      socket.off("create-chat");
      socket.off("all-chat");
      socket.off("chat-list");
      socket.off("join-chat");
      socket.off("chat-list");
    };
  }, [chatList, joinnedChatList]);

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
          </HeaderContainer>
          <CurrentChat
            roomName={currentChat.title}
            data={[]}
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

function createDummyChatList() {
  const result: ChatListDto[] = [];

  for (let i = 0; i < 100; i++) {
    const ran = Math.floor(Math.random() * 2);
    const cur = Math.floor(Math.random() * 100);
    result.push({
      title:
        "안녕하세요 잘부탁드립니다. 열심히하겠습니다. 충성 충성 충성" + (i + 1),
      private_mode: ran ? true : false,
      cur,
    });
  }

  return result;
}

function createDummyJoinList() {
  const result: JoinListDto[] = [];
  for (let i = 0; i < 100; i++) {
    const ran = Math.floor(Math.random() * 2);
    const newMessage = Math.floor(Math.random() * 2);
    result.push({
      title:
        "톰과 제리의 환상적인 콜라보레이션 보고싶은 분들은 이 방으로 들어오세요 시간이 없습니다~!" +
        (i + 1),
      private_mode: ran ? true : false,
      newMessage,
    });
  }
  return result;
}

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
