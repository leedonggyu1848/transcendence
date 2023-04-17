import styled from "@emotion/styled";
import { useContext, useEffect } from "react";
import { JoinnedUserDto } from "../../api/interface";
import { WebsocketContext } from "../../api/WebsocketContext";
import ChatBox from "../../components/Chat/ChatBox";
import CurrentUserInfo from "../../components/CurrentUserInfo";

const CurrentChat = ({
  roomName,
  data,
  clickOperatorButton,
}: {
  roomName: string;
  data: JoinnedUserDto[];
  clickOperatorButton: Function;
}) => {
  const socket = useContext(WebsocketContext);

  useEffect(() => {
    socket.emit("user-list", roomName);

    socket.on("user-list", ({ users }: { users: any }) => {
      console.log(users);
    });

    return () => {
      socket.off("user-list");
    };
  }, []);

  return (
    <CurrentChatContainer>
      <CurrentUserInfo
        data={data}
        title={roomName.slice(1)}
        operator
        clickOperatorButton={clickOperatorButton}
      />
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
