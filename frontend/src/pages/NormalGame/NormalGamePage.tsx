import styled from "@emotion/styled";
import { useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  chatLogState,
  currentNormalGameInfoState,
  myNameState,
} from "../../api/atom";
import { JoinnedUserDto } from "../../api/interface";
import ChatBox from "../../components/Chat/ChatBox";
import CurrentUserInfo from "../../components/CurrentUserInfo";
import WaitRoom from "./WaitRoom";

const NormalGamePage = () => {
  const [start, setStart] = useState(false);
  const gameInfo = useRecoilValue(currentNormalGameInfoState);
  const [chatLogs, setChatLogs] = useRecoilState(chatLogState);
  const myName = useRecoilValue(myNameState);

  console.log(gameInfo);
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
        <CurrentUserInfo data={createDummyData()} />
        <ChatBox height={350} data={chatLogs} myName={myName} />
      </SubContainer>
    </NormalGamePageContainer>
  );
};

function createDummyData() {
  const result: JoinnedUserDto[] = [];

  result.push({ name: "yooh", type: "owner" });
  result.push({ name: "jpark2", type: "opponent" });

  for (let i = 0; i < 50; i < i++) {
    let temp: JoinnedUserDto = {
      name: "User " + (i + 1),
      type: "watcher",
    };
    result.push(temp);
  }
  return result;
}

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
