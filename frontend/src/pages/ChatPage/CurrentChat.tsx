import styled from "@emotion/styled";
import { JoinnedUserDto } from "../../api/interface";
import ChatBox from "../../components/Chat/ChatBox";
import CurrentUserInfo from "../../components/CurrentUserInfo";

const CurrentChat = ({ data }: { data: JoinnedUserDto[] }) => {
  return (
    <CurrentChatContainer>
      <CurrentUserInfo data={data} />
      <ChatBox height={340} data={[]} myName="" />
    </CurrentChatContainer>
  );
};

const CurrentChatContainer = styled.div`
  width: 100%;
  height: 510px;
  border-radius: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: 0.5s;
  flex-direction: column;
  color: white;
`;

export default CurrentChat;
