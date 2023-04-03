import styled from "@emotion/styled";
import { ChatListDto, JoinListDto } from "../../api/interface";
import ChatBox from "../../components/Chat/ChatBox";
import ChatList from "./ChatList";
import JoinList from "./JoinList";

const ChatPage = () => {
  return (
    <ChatPageContainer>
      <WapperContainer>
        <h1>Chatting</h1>
        <HeaderContainer>
          <div>전체 채팅 방 목록</div>
          <AddButton />
        </HeaderContainer>
        <ChatList data={createDummyChatList()}></ChatList>
      </WapperContainer>
      <WapperContainer>
        <HeaderContainer></HeaderContainer>
        <ChatBox height={510}></ChatBox>
      </WapperContainer>
      <WapperContainer>
        <HeaderContainer></HeaderContainer>
        <JoinList data={createDummyJoinList()} />
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
    const newMessage = Math.floor(Math.random() * 150);
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

const Container = styled.div`
  width: 100%;
  height: 510px;
  background: var(--sub-bg-color);
  border-radius: 10px;
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
