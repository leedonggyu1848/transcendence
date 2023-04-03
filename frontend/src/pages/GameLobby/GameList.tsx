import styled from "@emotion/styled";
import { GameDto } from "../../api/interface";
import RoomInfo from "./RoomInfo";

const GameList = ({
  data,
  clickJoin,
  clickWatch,
}: {
  data: GameDto[];
  clickJoin: React.MouseEventHandler;
  clickWatch: React.MouseEventHandler;
}) => {
  return (
    <GameListContainer>
      {data.length ? (
        <ListContainer>
          {data.map(({ title, cur, private_mode, interrupt_mode }, idx) => (
            <RoomInfo
              title={title}
              cur={cur}
              private_mode={private_mode}
              interrupt_mode={interrupt_mode}
              key={idx}
              clickJoin={clickJoin}
              clickWatch={clickWatch}
            />
          ))}
        </ListContainer>
      ) : (
        <NoGame>열려 있는 게임이 없습니다.</NoGame>
      )}
    </GameListContainer>
  );
};

const ListContainer = styled.div`
  width: 97%;
  height: 95%;
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

const NoGame = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.6);
`;

const GameListContainer = styled.div`
  width: 530px;
  height: 510px;
  background: var(--sub-bg-color);
  border-radius: 10px;
  display: flex;
  overflow: hidden;
  justify-content: center;
  align-items: center;
`;

export default GameList;
