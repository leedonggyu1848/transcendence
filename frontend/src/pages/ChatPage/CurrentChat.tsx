import styled from "@emotion/styled";
import { useContext, useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { currentChatLogsState } from "../../api/atom";
import { IChatLog, JoinnedUserDto } from "../../api/interface";
import { WebsocketContext } from "../../api/WebsocketContext";
import ChatBox from "../../components/Chat/ChatBox";
import CurrentUserInfo from "../../components/CurrentUserInfo";

const CurrentChat = ({
  roomName,
  data,
  operator,
  clickOperatorButton,
  myName,
}: {
  roomName: string;
  data: JoinnedUserDto[];
  operator: boolean;
  clickOperatorButton: Function;
  myName: string;
}) => {
  const socket = useContext(WebsocketContext);
  const [msg, setMsg] = useState("");
  const [chatLogs, setChatLogs] = useRecoilState(currentChatLogsState);

  useEffect(() => {
    socket.emit("user-list", roomName);

    socket.on("user-list", ({ users }: { users: any }) => {
      console.log(users);
    });

    socket.on("message", ({ username, message }) => {
      setChatLogs([
        ...chatLogs,
        { sender: username, msg: message, time: new Date() },
      ]);
    });

    return () => {
      socket.off("message");
      socket.off("user-list");
    };
  }, [chatLogs]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setMsg(e.target.value);

  const onSend = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && msg) {
      setChatLogs([...chatLogs, { sender: myName, msg, time: new Date() }]);
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
        title={roomName.slice(1)}
        operator={operator}
        clickOperatorButton={clickOperatorButton}
      />
      <ChatBox
        height={340}
        data={chatLogs}
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
