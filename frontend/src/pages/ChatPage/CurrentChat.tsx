import styled from "@emotion/styled";
import { useContext, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { currentChatState, joinnedChatState } from "../../api/atom";
import { getRoomNameByType } from "../../api/funcs";
import { JoinnedUserDto } from "../../api/interface";
import { WebsocketContext } from "../../pages/WrapMainPage";
import ChatBox from "../../components/Chat/ChatBox";
import CurrentUserInfo from "../../components/CurrentUserInfo";

const CurrentChat = ({
  roomName,
  data,
  owner,
  clickOperatorButton,
  myName,
  type,
}: {
  roomName: string;
  data: JoinnedUserDto[];
  owner: boolean;
  clickOperatorButton: Function;
  myName: string;
  type: number;
}) => {
  const socket = useContext(WebsocketContext);
  const [msg, setMsg] = useState("");
  const currentChat = useRecoilValue(currentChatState);
  const [joinnedChatList, setJoinnedChatList] =
    useRecoilState(joinnedChatState);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setMsg(e.target.value);

  const onSend = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && msg) {
      setJoinnedChatList({
        ...joinnedChatList,
        [roomName]: {
          ...joinnedChatList[roomName],
          chatLogs: [
            ...joinnedChatList[roomName].chatLogs,
            {
              sender: myName,
              msg,
              time: new Date(),
            },
          ],
        },
      });
      socket.emit("message", {
        roomName,
        userName: myName,
        message: msg,
      });
      setMsg("");
    }
  };

  return (
    <CurrentChatContainer>
      <CurrentUserInfo
        data={data}
        title={getRoomNameByType(type, roomName, myName)}
        owner={owner}
        clickOperatorButton={clickOperatorButton}
      />
      <ChatBox
        height={340}
        myName={myName}
        onChange={onChange}
        onSend={onSend}
        msg={msg}
      />
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
