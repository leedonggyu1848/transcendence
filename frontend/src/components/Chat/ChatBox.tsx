import styled from "@emotion/styled";
import { useEffect, useRef } from "react";
import { useRecoilValue } from "recoil";
import {
  blockUserListState,
  currentChatState,
  joinnedChatState,
} from "../../api/atom";
import Chat from "./Chat";

const ChatBox = ({
  height,
  myName,
  onChange,
  onSend,
  msg,
}: {
  height: number;
  myName: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onSend: React.KeyboardEventHandler<HTMLInputElement>;
  msg: string;
}) => {
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const joinChatList = useRecoilValue(joinnedChatState);
  const currentChat = useRecoilValue(currentChatState);
  const blockList = useRecoilValue(blockUserListState);
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [currentChat, joinChatList, blockList]);
  return (
    <ChatBoxWrapper h={height}>
      <ChatBoxContainer ref={chatBoxRef} h={height}>
        {joinChatList[currentChat] &&
          joinChatList[currentChat].chatLogs.map((info, idx) => (
            <Chat key={idx} {...info} myName={myName} />
          ))}
      </ChatBoxContainer>
      <ChatInput
        maxLength={50}
        value={msg}
        onChange={onChange}
        onKeyUp={onSend}
        placeholder={
          joinChatList[currentChat] && joinChatList[currentChat].isMuted
            ? "음소거 중입니다."
            : "채팅하기"
        }
        disabled={
          joinChatList[currentChat] && joinChatList[currentChat].isMuted
        }
      />
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
