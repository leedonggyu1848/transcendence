import styled from "@emotion/styled";
import Chat from "./Chat";

const data = [
  {
    sender: "yooh",
    receiver: "jpark2",
    msg: "hello world",
    time: new Date(),
  },
  {
    sender: "jpark2",
    receiver: "yooh",
    msg: "hello world hello world hello world hello world hello world hello world hello world",
    time: new Date(),
  },
  {
    sender: "yooh",
    receiver: "jpark2",
    msg: "hello world",
    time: new Date(),
  },
  {
    sender: "yooh",
    receiver: "jpark2",
    msg: "hello worldhello worldhello worldhello worldhello worldhello worldhello worldhello worldhello worldhello worldhello world",
    time: new Date(),
  },
  {
    sender: "yooh",
    receiver: "jpark2",
    msg: "hello world",
    time: new Date(),
  },
  {
    sender: "yooh",
    receiver: "jpark2",
    msg: "hello world",
    time: new Date(),
  },
  {
    sender: "yooh",
    receiver: "jpark2",
    msg: "hello world",
    time: new Date(),
  },
];

const ChatBox = () => {
  return (
    <ChatBoxContainer>
      {data.map(({ sender, msg, time }, idx) => (
        <Chat key={idx} sender={sender} myName="yooh" msg={msg} time={time} />
      ))}
    </ChatBoxContainer>
  );
};

const ChatBoxContainer = styled.div`
  width: 100%;
  height: 400px;
  background: var(--sub-bg-color);
  border-radius: 20px;
  overflow-y: auto;
  color: white;
`;

export default ChatBox;
