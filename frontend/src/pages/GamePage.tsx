import styled from "@emotion/styled";

const GamePage = () => {
  return (
    <GamePageContainer>
      <GameContainer>
        <h1>Normal Game</h1>
        <h2>yooh vs jpark2</h2>
        <GameBox />
      </GameContainer>
      <SubContainer></SubContainer>
    </GamePageContainer>
  );
};

const GameBox = styled.div`
  width: 530px;
  height: 530px;
  background: black;
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
  }
`;

const SubContainer = styled.div`
  width: 300px;
  height: 100%;
`;

const GamePageContainer = styled.div`
  height: 95%;
  background: green;
  display: flex;
  color: white;
`;

export default GamePage;
