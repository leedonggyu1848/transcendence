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

const ChatBox = ({ height }: { height: number }) => {
  const opponent = "jpark2";
  return (
    <ChatBoxWrapper h={height}>
      <ChatBoxContainer h={height}>
        {data.map(({ sender, msg, time }, idx) => (
          <Chat key={idx} sender={sender} myName="yooh" msg={msg} time={time} />
        ))}
      </ChatBoxContainer>
      <ChatInput placeholder={`${opponent}와 대화하기`} />
    </ChatBoxWrapper>
  );
};

const ChatInput = styled.input`
  width: 80%;
  height: 30px;
  outline: none;
  border: none;
  border-radius: 20px;
  padding: 0 15px;
  margin-top: 10px;
  &::placeholder {
    color: var(--gray-color);
  }
`;

const ChatBoxContainer = styled.div<{ h: number }>`
  width: 100%;
  height: ${({ h }) => h - 80 + "px"};
  overflow-y: auto;
  color: white;
  display: flex;
  align-items: center;
  flex-direction: column;
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

const ChatBoxWrapper = styled.div<{ h: number }>`
  width: 100%;
  background: var(--sub-bg-color);
  height: ${({ h }) => h + "px"};
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

export default ChatBox;
