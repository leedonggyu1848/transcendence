import styled from "@emotion/styled";

function getDateInfo(time: Date) {
  const m = time.getMonth() + 1;
  const d = time.getDate();
  return `${time.getFullYear() % 100}.${m < 10 ? "0" + m : m}.${
    d < 10 ? "0" + d : d
  }`;
}

function convertTimeInfo(time: Date) {
  const today = new Date();
  const dateStr = getDateInfo(time);
  if (getDateInfo(today) !== dateStr) return dateStr;
  const h = time.getHours();
  const m = time.getMinutes();
  return `${h < 12 ? "AM" : "PM"} ${h % 12 === 0 ? 12 : h < 10 ? "0" + h : h}:${
    m < 10 ? "0" + m : m
  }`;
}

const Record = ({
  type,
  player1,
  player2,
  winner,
  time,
}: {
  type: string;
  player1: string;
  player2: string;
  winner: string;
  time: Date;
}) => {
  return (
    <RecordContainer>
      <Type>{type === "rank" ? "랭크" : "일반"}</Type>
      <Result>{player1 === winner ? "W" : "L"}</Result>
      <PlayerName>{player1}</PlayerName>
      <Result>{player2 === winner ? "W" : "L"}</Result>
      <PlayerName>{player2}</PlayerName>
      <Time>{convertTimeInfo(time)}</Time>
    </RecordContainer>
  );
};

const Type = styled.div`
  width: 8%;
`;

const Result = styled.div`
  background: white;
  color: black;
  width: 30px;
  height: 30px;
  border-radius: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const PlayerName = styled.div`
  width: 20%;
`;

const Time = styled.div`
  width: 15%;
  text-align: right;
`;

const RecordContainer = styled.div`
  background: var(--main-bg-color);
  margin: 10px;
  border-radius: 10px;
  height: 60px;
  display: flex;
  width: 95%;
  align-items: center;
  justify-content: space-around;
  cursor: pointer;
`;

export default Record;
