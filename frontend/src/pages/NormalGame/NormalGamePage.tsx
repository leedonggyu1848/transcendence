import styled from "@emotion/styled";
import ChatBox from "../../components/Chat/ChatBox";
import OpponentInfo from "../../components/OpponentInfo";

const NormalGamePage = () => {
  return (
    <NormalGamePageContainer>
      <GameContainer>
        <h1>Normal Game</h1>
        <h2></h2>
        <GameBox />
      </GameContainer>
      <SubContainer>
        <OpponentInfo />
        <ChatBox />
      </SubContainer>
    </NormalGamePageContainer>
  );
};

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
  height: 95%;
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
