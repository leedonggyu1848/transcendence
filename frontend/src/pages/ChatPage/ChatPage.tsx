import styled from "@emotion/styled";
import { useContext } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  chatListState,
  createChatModalToggleState,
  currentChatState,
  currentChatUserListState,
  inviteModalToggleState,
  joinChatToggleState,
  joinnedChatState,
  myNameState,
  operatorModalToggleState,
} from "../../api/atom";
import { WebsocketContext } from "../../api/WebsocketContext";
import SideMenu from "../../components/SideMenu/SideMenu";
import ChatList from "./ChatList";
import CurrentChat from "./CurrentChat";
import JoinList from "./JoinList";

const ChatPage = () => {
  const socket = useContext(WebsocketContext);
  const openOperatorModal = useSetRecoilState(operatorModalToggleState);
  const openCreateChatModal = useSetRecoilState(createChatModalToggleState);
  const clickOperatorButton = () => {
    openOperatorModal(true);
  };
  const [currentChat, setCurrentChat] = useRecoilState(currentChatState);
  const chatList = useRecoilValue(chatListState);
  const [joinnedChatList, setJoinChatList] = useRecoilState(joinnedChatState);
  const myName = useRecoilValue(myNameState);
  const setJoinChatToggle = useSetRecoilState(joinChatToggleState);
  const setInviteModalToggle = useSetRecoilState(inviteModalToggleState);

  const LeaveChatRoom = (roomName: string) => {
    socket.emit("leave-chat", roomName);
  };

  const openInviteModal = () => {
    setInviteModalToggle(true);
  };

  const joinChatRoom = (roomName: string, type: number) => {
    if (joinnedChatList[roomName] !== undefined) {
      //current chat setting
      setCurrentChat(roomName);
      setJoinChatList({
        ...joinnedChatList,
        [roomName]: {
          ...joinnedChatList[roomName],
          newMsg: false,
        },
      });
      return;
    }
    if (type === 2) {
      // password type 대응
      setJoinChatToggle({ roomName, toggle: true });
    } else {
      socket.emit("join-chat", { roomName, password: "" });
    }
  };

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
      {currentChat.length > 0 && joinnedChatList[currentChat] && (
        <WapperContainer>
          <HeaderContainer>
            <div>현재 채팅</div>
            <ButtonContainer>
              <Button onClick={openInviteModal}>초대하기</Button>
              <Button
                onClick={() =>
                  LeaveChatRoom(joinnedChatList[currentChat].title)
                }
              >
                나가기
              </Button>
            </ButtonContainer>
          </HeaderContainer>
          <CurrentChat
            roomName={joinnedChatList[currentChat].title}
            operator={joinnedChatList[currentChat].operator === myName}
            myName={myName}
            type={joinnedChatList[currentChat].type}
            data={UserDtoToJoinnedUserDto(
              joinnedChatList[currentChat].userList,
              myName,
              joinnedChatList[currentChat].operator
            )}
            clickOperatorButton={clickOperatorButton}
          />
        </WapperContainer>
      )}
      {(currentChat.length === 0 || !joinnedChatList[currentChat]) && (
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
        <JoinList
          data={joinnedChatList}
          handleLeave={LeaveChatRoom}
          myName={myName}
        />
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
    userName: name,
    type:
      name === operator ? "owner" : name === myName ? "opponent" : "watcher",
  }));
}

const Button = styled.div`
  font-size: 1rem !important;
  background: white;
  color: var(--dark-bg-color) !important;
  border-radius: 5px;
  padding: 3px 7px;
  cursor: pointer;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  & > div:first-of-type {
    margin-right: 15px;
  }
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
