import styled from "@emotion/styled";
import React from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import { currentChatState, joinnedChatState } from "../../api/atom";
import { IChatRoom, IJoinnedChat, JoinListDto } from "../../api/interface";

const JoinList = ({
  data,
  handleLeave,
}: {
  data: IJoinnedChat;
  handleLeave: Function;
}) => {
  const setCurrentChat = useSetRecoilState(currentChatState);
  const [joinnedChatList, setJoinnedChatList] =
    useRecoilState(joinnedChatState);

  const joinChat = (roomName: string) => {
    setCurrentChat(roomName);
    setJoinnedChatList({
      ...joinnedChatList,
      [roomName]: {
        ...joinnedChatList[roomName],
        newMsg: false,
      },
    });
  };
  return (
    <JoinListContainer>
      {Object.keys(data).map((roomName, idx) => (
        <Room key={idx} onClick={() => joinChat(data[roomName].title)}>
          {data[roomName].newMsg ? <NewMessage /> : <Empty />}
          <Private private_mode={data[roomName].type} />
          <Title title={data[roomName].title.slice(1)}>
            {data[roomName].title.slice(1, 10)}
            {data[roomName].title.length > 10 ? "..." : ""}
          </Title>
          <LeaveButton
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              handleLeave(data[roomName].title);
            }}
          >
            나가기
          </LeaveButton>
        </Room>
      ))}
    </JoinListContainer>
  );
};

const Empty = styled.div`
  width: 7px;
  height: 7px;
  margin-left: 10px;
`;

const NewMessage = styled.div`
  width: 7px;
  height: 7px;
  border-radius: 10px;
  background: #ff4a4a;
  margin-left: 10px;
`;

const LeaveButton = styled.div`
  padding: 5px 8px;
  color: white;
  border: 1px solid white;
  border-radius: 10px;
  cursor: pointer;
  margin-right: 15px;
`;

const Private = styled.div<{ private_mode: number }>`
  width: 15px;
  height: 15px;
  background-image: ${({ private_mode }) =>
    private_mode === 2
      ? 'url("/src/assets/lockIcon.png")'
      : private_mode === 1
      ? 'url("/src/assets/privateIcon.png")'
      : "none"};
  background-size: 100% 100%;
`;

const Title = styled.div`
  width: 55%;
`;

const Room = styled.div`
  width: 95%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 50px;
  margin: 5px;
  border-radius: 10px;
  border: 2px solid transparent;
  transition: 0.3s;
  &:hover {
    border: 2px solid white;
  }
`;

const JoinListContainer = styled.div`
  width: 100%;
  height: 510px;
  background: var(--sub-bg-color);
  border-radius: 10px;
  overflow-y: auto;
  color: white;
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

export default JoinList;
