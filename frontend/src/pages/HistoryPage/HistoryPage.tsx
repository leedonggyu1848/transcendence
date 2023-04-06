import styled from "@emotion/styled";
import { useEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import { selectedGameRecord } from "../../api/atom";
import { IGameHistory } from "../../api/interface";
import { axiosGetHistory } from "../../api/request";
import useInitHook from "../../api/useInitHook";
import GameDetailInfo from "./GameDetailInfo";
import Records from "./Records";

const HistoryPage = () => {
  useInitHook();
  const [list, setList] = useState<IGameHistory[]>([]);
  const setSelectedGameRecord = useSetRecoilState(selectedGameRecord);
  useEffect(() => {
    async function getData() {
      const result = await axiosGetHistory(1);
      console.log(result);
      setList([...result]);
    }
    getData();
    return () => {
      setSelectedGameRecord({
        record: {
          gameType: -1,
          id: -1,
          loser: "",
          winner: "",
          time: "",
        },
        winner: {
          user_id: -1,
          intra_id: "",
          profile: "",
          introduce: "",
          normal_win: -1,
          normal_lose: -1,
          rank_win: -1,
          rank_lose: -1,
        },
        loser: {
          user_id: -1,
          intra_id: "",
          profile: "",
          introduce: "",
          normal_win: -1,
          normal_lose: -1,
          rank_win: -1,
          rank_lose: -1,
        },
      });
    };
  }, []);
  return (
    <HistoryPageContainer>
      <GameContainer>
        <h1>게임 기록</h1>
        <h2></h2>
        <Records data={list} />
      </GameContainer>
      <SubContainer>
        <Empty />
        <GameDetailInfo />
      </SubContainer>
    </HistoryPageContainer>
  );
};

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
