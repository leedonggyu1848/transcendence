import styled from "@emotion/styled";
import { useContext, useEffect } from "react";
import { useRecoilState } from "recoil";
import {
  blockUserListState,
  requestBlockUserListFlagState,
} from "../../../api/atom";
import { WebsocketContext } from "../../../api/WebsocketContext";

const data = [
  "yooh",
  "jpark2",
  "yooh",
  "jpark2",
  "yooh",
  "jpark2",
  "yooh",
  "jpark2",
  "yooh",
  "jpark2",
  "yooh",
  "jpark2",
  "yooh",
  "jpark2",
];

const BlockList = () => {
  const socket = useContext(WebsocketContext);
  const [blockList, setBlockList] = useRecoilState(blockUserListState);
  const [requestBlockListFlag, setRequestBlockListFlag] = useRecoilState(
    requestBlockUserListFlagState
  );
  useEffect(() => {
    if (!requestBlockListFlag) {
      socket.emit('request-block')
    }

  }, []);
  return (
    <BlockListContainer>
      <h1>차단 목록</h1>
      <BlockedUsers>
        {data.map((name) => (
          <BlockedUser key={name}>
            <Name>{name}</Name>
            <Button>해제</Button>
          </BlockedUser>
        ))}
      </BlockedUsers>
    </BlockListContainer>
  );
};

const Name = styled.div`
  margin-left: 15px;
`;

const Button = styled.div`
  margin-right: 15px;
  color: var(--dark-bg-color);
  background: white;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
`;

const BlockedUser = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 95%;
  height: 50px;
  background: var(--dark-bg-color);
  margin: 10px auto;
  border-radius: 10px;
`;

const BlockedUsers = styled.div`
  width: 80%;
  height: 350px;
  background: var(--sub-bg-color);
  border-radius: 10px;
  margin-top: 25px;
  overflow-y: auto;
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

const BlockListContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  & > h1 {
    width: 80%;
  }
`;

export default BlockList;
