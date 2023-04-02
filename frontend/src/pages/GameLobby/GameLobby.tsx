import styled from "@emotion/styled";
import { GameDto } from "../../api/interface";
import CreateForm from "./CreateForm";
import GameList from "./GameList";

const GameLobby = ({
  data,
  myName,
  onCreateRoom,
  clickRankGame,
}: {
  data: GameDto[];
  myName: string;
  onCreateRoom: React.FormEventHandler<HTMLFormElement>;
  clickRankGame: React.MouseEventHandler;
}) => {
  return (
    <GameLobbyContainer>
      <LeftContainer>
        <h1>Game Lobby</h1>
        <h2></h2>
        <GameList data={data} />
      </LeftContainer>
      <RightContainer>
        <div />
        <Container>
          <Rank onClick={clickRankGame}>RANK</Rank>
          <CreateForm myName={myName} onCreateRoom={onCreateRoom} />
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
