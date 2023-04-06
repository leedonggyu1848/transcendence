import styled from "@emotion/styled";
import { UserDto } from "../../api/interface";
import DetailProfile from "./DetailProfile";

function convertTime(time: Date) {
  return `${time.getFullYear() % 100}년 ${
    time.getMonth() + 1
  }월 ${time.getDate()}일 ${time.getHours() < 12 ? "AM" : "PM"} ${
    time.getHours() % 12 === 0 ? 12 : time.getHours()
  }시 ${time.getMinutes()}분`;
}

const GameDetailInfo = ({
  type,
  time,
  player1,
  player2,
  win,
}: {
  type: string;
  time: Date;
  player1: UserDto;
  player2: UserDto;
  win: string;
}) => {
  const winner = player1.intra_id === win ? player1 : player2;
  const loser = player1.intra_id !== win ? player1 : player2;
  return (
    <GameDetailInfoContainer>
      <GameInfo>
        <div>{type === "rank" ? "랭크" : "일반"}</div>
        <div>{convertTime(time)}</div>
      </GameInfo>
      <DetailProfile player={winner} type="W" />
      <DetailProfile player={loser} type="L" />
    </GameDetailInfoContainer>
  );
};

const GameInfo = styled.div`
  background: var(--dark-bg-color);
  width: 95%;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 10px;
  & > div:first-of-type {
    margin-left: 20px;
  }
  & > div:last-of-type {
    margin-right: 20px;
  }
`;

const GameDetailInfoContainer = styled.div`
  width: 100%;
  background: var(--sub-bg-color);
  height: 510px;
  border-radius: 10px;
  display: flex;
  justify-content: space-around;
  flex-direction: column;
  align-items: center;
`;

export default GameDetailInfo;
