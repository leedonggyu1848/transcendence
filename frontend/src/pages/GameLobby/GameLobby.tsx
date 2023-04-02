import styled from "@emotion/styled";
import { GameDto } from "../../api/interface";
import CreateForm from "./CreateForm";
import GameList from "./GameList";

function createDummyData(): GameDto[] {
  let list = [];

  for (let i = 0; i < 20; i++) {
    let ran = Math.floor(Math.random() * 2);
    list.push({
      private_mode: ran ? true : false,
      title: `열심히 하겠습니다. 한수 알려주시면 감사하겠습니다 선생님, 당장 옥상으로 올라오시죠 ${
        i + 1
      }`,
      interrupt_mode: ran ? true : false,
      cur: ran ? 1 : 2,
    });
  }
  return list;
}

const GameLobby = () => {
  return (
    <GameLobbyContainer>
      <LeftContainer>
        <h1>Game Lobby</h1>
        <h2></h2>
        <GameList data={createDummyData()} />
      </LeftContainer>
      <RightContainer>
        <div />
        <Container>
          <Rank>RANK</Rank>
          <CreateForm />
        </Container>
      </RightContainer>
    </GameLobbyContainer>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: column;
  width: 100%;
  height: 510px;
`;

const Rank = styled.div`
  width: 100%;
  background: var(--dark-bg-color);
  height: 90px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2rem;
  border-radius: 10px;
  letter-spacing: 15px;
  cursor: pointer;
  transition: 0.5s;
  &:hover {
    color: var(--gray-color);
  }
`;

const RightContainer = styled.div`
  width: 300px;
  height: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: space-between;
`;

const LeftContainer = styled.div`
  width: 550px;
  height: 100%;
  margin: 0 10px 0 25px;
  & > h1,
  h2 {
    margin-left: 30px;
    height: 45px;
  }
`;

const GameLobbyContainer = styled.div`
  height: 95%;
  display: flex;
  color: white;
  width: 90%;
  display: flex;
  align-items: center;
`;

export default GameLobby;
