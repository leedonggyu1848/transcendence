import styled from "@emotion/styled";
import { useMemo } from "react";

const UserInfo = ({
  profile,
  userName,
  normalWin,
  normalLose,
  rankWin,
  rankLose,
  introduce,
}: {
  profile: string;
  userName: string;
  normalWin: number;
  normalLose: number;
  rankWin: number;
  rankLose: number;
  introduce: string;
}) => {
  const normalRate = (normalWin / (normalLose + normalWin)) * 100;
  const rankRate = (rankWin / (rankLose + rankWin)) * 100;
  return (
    <UserInfoContainer>
      {useMemo(
        () => (
          <Profile profile={profile} />
        ),
        [profile]
      )}
      <Info>
        <div>{userName}</div>
        <div>
          <div>일반 게임</div>
          <div>
            {normalWin}승 {normalLose}패{" "}
            {isNaN(normalRate) ? 0 : normalRate.toFixed(1)}%
          </div>
        </div>
        <div>
          <div>랭크 게임</div>
          <div>
            {rankWin}승 {rankLose}패 {isNaN(rankRate) ? 0 : rankRate.toFixed(1)}
            %
          </div>
        </div>
      </Info>
      <IntroduceContainer>
        <div>인삿말</div>
        <Introduce>{introduce || "안녕하세요~"}</Introduce>
      </IntroduceContainer>
    </UserInfoContainer>
  );
};

const IntroduceContainer = styled.div`
  width: 140px;
  height: 140px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const Introduce = styled.div`
  padding: 10px;
  background: var(--main-bg-color);
  width: 80%;
  height: 65%;
  margin-top: 20px;
  border-radius: 10px;
  word-break: break-all;
  overflow-y: auto;
  &::-webkit-scrollbar {
    border-radius: 5px;
    width: 5px;
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

const Info = styled.div`
  width: 140px;
  height: 140px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
`;

const Profile = styled.div<{ profile: string }>`
  width: 140px;
  height: 140px;
  border-radius: 10px;
  background-image: ${({ profile }) =>
    profile
      ? `url('http://localhost:3000/${profile}?v=${new Date().getTime()}')`
      : 'url("/src/assets/defaultProfile.png")'};
  background-size: 100% 100%;
  margin-left: 10px;
`;

const UserInfoContainer = styled.div`
  width: 500px;
  height: 180px;
  background: var(--dark-bg-color);
  border-radius: 10px;
  display: flex;
  justify-content: space-around;
  align-items: center;
`;

export default UserInfo;
