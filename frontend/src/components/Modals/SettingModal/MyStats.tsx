import styled from "@emotion/styled";
import { useRecoilValue } from "recoil";
import { myInfoState } from "../../../api/atom";

const MyStats = () => {
  const myInfo = useRecoilValue(myInfoState);
  const cal = (a: number, b: number) =>
    a + b === 0 ? 0 : ((a / (a + b)) * 100).toFixed(1);
  return (
    <MyStatsContainer>
      <h1>내 전적</h1>
      <InfoContainer>
        <div>
          <TypeInfo>일반 게임</TypeInfo>
          <div>Win : {myInfo.normalWin}승</div>
          <div>Lose : {myInfo.normalLose}패</div>
          <div>승률 : {cal(myInfo.normalWin, myInfo.normalLose)}%</div>
        </div>
        <div>
          <TypeInfo>랭크 게임</TypeInfo>
          <div>Win : {myInfo.rankWin}승</div>
          <div>Lose : {myInfo.rankLose}패</div>
          <div>승률 : {cal(myInfo.rankWin, myInfo.rankLose)}%</div>
        </div>
      </InfoContainer>
    </MyStatsContainer>
  );
};

const TypeInfo = styled.div`
  font-weight: bold;
  font-size: 1.25rem;
  margin-bottom: 10px;
`;

const InfoContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-around;
  width: 100%;
`;

const MyStatsContainer = styled.div`
  width: 100%;
  height: 30%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  & > h1 {
    width: 80%;
  }
`;

export default MyStats;
