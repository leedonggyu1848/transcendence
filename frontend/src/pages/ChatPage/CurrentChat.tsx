import styled from "@emotion/styled";
import { useContext, useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { muteCountState, myNameState } from "../../api/atom";
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
  const [muteCountList, setMuteCountList] = useRecoilState(muteCountState);

  useEffect(() => {
    socket.on("message", ({ userName, message, roomName: target }) => {
      console.log(userName, roomName, target);
      //setChatDB({
      //  ...chatDB,
      //  [target]: [
      //    ...chatDB[target],
      //    { sender: userName, msg: message, time: new Date() },
      //  ],
      //});
    });

    socket.on("chat-muted", (roomName: string) => {
      setMuteCountList({ ...muteCountList, [roomName]: 30 });
    });
    let timer: NodeJS.Timeout;
    if (muteCountList[roomName] > 0) {
      timer = setTimeout(() => {}, 1000);
    }

    return () => {
      socket.off("message");
      socket.off("chat-muted");
      clearTimeout(timer);
    };
  }, [muteCountList]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setMsg(e.target.value);

  const onSend = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && msg) {
      //setChatDB({
      //  ...chatDB,
      //  [roomName]: [
      //    ...chatDB[roomName],
      //    { sender: myName, msg, time: new Date() },
      //  ],
      //});
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
        data={[]}
        myName={myName}
        onChange={onChange}
        onSend={onSend}
        msg={msg}
        muteCount={muteCountList[roomName]}
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
