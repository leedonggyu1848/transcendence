import styled from "@emotion/styled";
import { useEffect } from "react";
import { IGameHistory } from "../../api/interface";
import useInitHook from "../../api/useInitHook";
import GameDetailInfo from "./GameDetailInfo";
import Records from "./Records";

const data = {
  time: new Date(),
  type: "rank",
  win: "yooh",
  player1: {
    user_id: 23,
    intra_id: "yooh",
    profile: "",
    introduce: "",
    normal_win: 14,
    normal_lose: 8,
    rank_win: 11,
    rank_lose: 9,
  },
  player2: {
    user_id: 25,
    intra_id: "jpark2",
    profile: "",
    introduce: "",
    normal_win: 55,
    normal_lose: 11,
    rank_win: 2,
    rank_lose: 18,
  },
};

const HistoryPage = () => {
  useInitHook();
  return (
    <HistoryPageContainer>
      <GameContainer>
        <h1>게임 기록</h1>
        <h2></h2>
        <Records data={createDummyData()} />
      </GameContainer>
      <SubContainer>
        <Empty />
        <GameDetailInfo {...data} />
      </SubContainer>
    </HistoryPageContainer>
  );
};

function createDummyData() {
  const result: IGameHistory[] = [];

  for (let i = 0; i < 100; i++) {
    const ran = Math.floor(Math.random() * 2);
    const temp: IGameHistory = {
      type: ran ? "rank" : "normal",
      player1: ran ? "yooh" : "jpark2",
      player2: !ran ? "yooh" : "jpark2",
      winner: ran ? "yooh" : "jpark2",
      time: new Date(),
    };
    result.push(temp);
  }
  return result;
}

const Empty = styled.div`
  width: 100%;
  height: 100px;
`;

const HistoryPageContainer = styled.div`
  height: 95%;
  display: flex;
  color: white;
  width: 90%;
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

export default HistoryPage;
