import styled from "@emotion/styled";
import { useState } from "react";
import ChatBox from "../../components/Chat/ChatBox";
import OpponentInfo from "../../components/OpponentInfo";
import WaitRoom from "./WaitRoom";

const NormalGamePage = () => {
  const [start, setStart] = useState(false);
  return (
    <NormalGamePageContainer>
      <GameContainer>
        <h1>Normal Game</h1>
        <h2>yooh의 일반 게임</h2>
        {!start ? <WaitRoom /> : <GameBox />}
      </GameContainer>
      <SubContainer>
        <Options></Options>
        <CurrentUserInfo />
        <ChatBox height={350} />
      </SubContainer>
    </NormalGamePageContainer>
  );
};

const Options = styled.div`
  width: 100%;
  height: 60px;
  background: var(--sub-bg-color);
  border-radius: 10px;
  margin-bottom: 95px;
`;

const CurrentUserInfo = styled.div`
  width: 100%;
  height: 150px;
  border-radius: 10px;
  margin-bottom: 20px;
  background: var(--sub-bg-color);
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
