import styled from "@emotion/styled";
import { IChatRoom } from "../../api/interface";

const ChatList = ({ data }: { data: IChatRoom[] }) => {
  return (
    <ChatListContainer>
      {data.map(({ title, type, count }, idx) => (
        <Chat key={idx}>
          <Title title={title}>
            {title.slice(0, 10)}
            {title.length > 10 ? "..." : ""}
          </Title>
          <Private
            private_mode={
              type === 0 ? "public" : type === 1 ? "private" : "password"
            }
          />
          <Current>
            <PersonIcon />
            <div>{count}</div>
          </Current>
        </Chat>
      ))}
    </ChatListContainer>
  );
};

const Title = styled.div``;

const Private = styled.div<{ private_mode: string }>`
  width: 15px;
  height: 18px;
  background-image: ${({ private_mode }) =>
    private_mode === "password" ? 'url("/src/assets/lockIcon.png")' : "none"};
  background-size: 100% 100%;
`;

const Current = styled.div`
  display: flex;
  align-items: center;
  width: 45px;
  justify-content: space-between;
`;

const PersonIcon = styled.div`
  background-image: url("/src/assets/userIcon.png");
  background-size: 100% 100%;
  width: 15px;
  height: 15px;
  margin-right: 10px;
`;

const Chat = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 85%;
  height: 50px;
  background: var(--main-bg-color);
  color: white;
  border-radius: 10px;
  padding: 10px;
  margin: 5px 10px;
`;

const ChatListContainer = styled.div`
  width: 100%;
  height: 510px;
  background: var(--sub-bg-color);
  border-radius: 10px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  &::-webkit-scrollbar {
    border-radius: 10px;
    width: 10px;
  }
  &::-webkit-scrollbar-track {
    background: white;
    border-radius: 10px;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--gray-color);
    width: 2px;
    border-radius: 10px;
  }
`;

export default ChatList;
