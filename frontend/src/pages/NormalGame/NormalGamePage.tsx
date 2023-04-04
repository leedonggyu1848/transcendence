import styled from "@emotion/styled";
import { useContext, useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  chatLogState,
  currentNormaGameUsersState,
  currentNormalGameInfoState,
  myNameState,
} from "../../api/atom";
import { JoinnedUserDto } from "../../api/interface";
import { WebsocketContext } from "../../api/WebsocketContext";
import ChatBox from "../../components/Chat/ChatBox";
import CurrentUserInfo from "../../components/CurrentUserInfo";
import WaitRoom from "./WaitRoom";

const NormalGamePage = () => {
  const [start, setStart] = useState(false);
  const gameInfo = useRecoilValue(currentNormalGameInfoState);
  const usersInfo = useRecoilValue(currentNormaGameUsersState);
  const [chatLogs, setChatLogs] = useRecoilState(chatLogState);
  const myName = useRecoilValue(myNameState);
  const socket = useContext(WebsocketContext);

  console.log(gameInfo);

  useEffect(() => {
    if (gameInfo.ownerDto.intra_id === myName) {
      socket.emit("create-room", gameInfo.gameDto.title);
    } else {
      socket.emit("join-room", myName);
    }
    socket.on("message", (message: string) => console.log(message));
  }, []);
  return (
    <NormalGamePageContainer>
      <GameContainer>
        <h1>일반 게임</h1>
        <h2>{gameInfo.gameDto.title}</h2>
        {!start ? <WaitRoom /> : <GameBox />}
      </GameContainer>
      <SubContainer>
        <Options>
          <Button className="active">시작하기</Button>
          <Button className="active">나가기</Button>
        </Options>
        <CurrentUserInfo data={usersInfo} />
        <ChatBox height={350} data={chatLogs} myName={myName} />
      </SubContainer>
    </NormalGamePageContainer>
  );
};

const Button = styled.div`
  border-radius: 5px;
  padding: 5px 10px;
  margin: 0 10px;
  &.active {
    border: 1px solid white;
    cursor: pointer;
  }
  &.notActive {
    border: 1px solid var(--gray-color);
    color: var(--gray-color);
    cursor: not-allowed;
  }
`;

const Options = styled.div`
  width: 100%;
  height: 60px;
  background: var(--sub-bg-color);
  border-radius: 10px;
  margin-bottom: 95px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const GameBox = styled.div`
  width: 530px;
  height: 510px;
  background: var(--sub-bg-color);
  border-radius: 20px;
  margin: 0 auto;
`;

const GameContainer = styled.div`
  width: 550px;
  height: 100%;
  margin: 0 25px;
  & > h1,
  h2 {
    margin-left: 30px;
    height: 45px;
    color: white;
  }
`;

const SubContainer = styled.div`
  width: 300px;
  height: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: space-between;
`;

const NormalGamePageContainer = styled.div`
  height: 95%;
  display: flex;
  color: white;
  width: 90%;
`;

export default NormalGamePage;
