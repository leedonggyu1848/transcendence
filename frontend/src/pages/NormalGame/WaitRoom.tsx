import styled from "@emotion/styled";
import { useState } from "react";
import { useRecoilValue } from "recoil";
import { myInfoState } from "../../api/atom";

const WaitRoom = () => {
  const myInfo = useRecoilValue(myInfoState);
  const [Opponent, setOpponent] = useState(null);
  const normalRate =
    (myInfo.normal_win / (myInfo.normal_lose + myInfo.normal_win)) * 100;
  const rankRate =
    (myInfo.rank_win / (myInfo.rank_lose + myInfo.rank_win)) * 100;
  return (
    <WaitRoomContainer>
      {Opponent ? (
        <UserInfo />
      ) : (
        <NoUser>
          <span>상대방을 기다리는 중입니다</span>
          <span className="dot-falling" />
        </NoUser>
      )}
      <OptionContainer>VS</OptionContainer>
      <UserInfo>
        <Profile profile={myInfo.profile} />
        <Info>
          <div>{myInfo.intra_id}</div>
          <div>
            <div>일반 게임</div>
            <div>
              {myInfo.normal_win}승 {myInfo.normal_lose}패{" "}
              {normalRate.toFixed(1)}%
            </div>
          </div>
          <div>
            <div>랭크 게임</div>
            <div>
              {myInfo.rank_win}승 {myInfo.rank_lose}패 {rankRate.toFixed(1)}%
            </div>
          </div>
        </Info>
        <IntroduceContainer>
          <div>인삿말</div>
          <Introduce>{myInfo.introduce || "안녕하세요~"}</Introduce>
        </IntroduceContainer>
      </UserInfo>
    </WaitRoomContainer>
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
    profile ? `url(${profile})` : 'url("/src/assets/defaultProfile.png")'};
  background-size: 100% 100%;
  margin-left: 10px;
`;

const OptionContainer = styled.div`
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 2rem;
  font-weight: bold;
`;

const NoUser = styled.div`
  width: 500px;
  height: 180px;
  background: var(--dark-bg-color);
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  & .dot-falling {
    margin-left: 17px;
    background: red;
    position: relative;
    left: -9999px;
    width: 5px;
    height: 5px;
    border-radius: 5px;
    background-color: white;
    color: white;
    box-shadow: 9999px 0 0 0 white;
    animation: dot-falling 1s infinite linear;
    animation-delay: 0.1s;
  }
  & .dot-falling::before,
  .dot-falling::after {
    content: "";
    display: inline-block;
    position: absolute;
    top: 0;
  }
  & .dot-falling::before {
    width: 5px;
    height: 5px;
    left: 5px;
    border-radius: 5px;
    background-color: white;
    color: white;
    animation: dot-falling-before 1s infinite linear;
    animation-delay: 0s;
  }
  & .dot-falling::after {
    right: 5px;
    width: 5px;
    height: 5px;
    border-radius: 5px;
    background-color: white;
    color: white;
    animation: dot-falling-after 1s infinite linear;
    animation-delay: 0.2s;
  }

  @keyframes dot-falling {
    0% {
      box-shadow: 9999px -15px 0 0 rgba(152, 128, 255, 0);
    }
    25%,
    50%,
    75% {
      box-shadow: 9999px 0 0 0 white;
    }
    100% {
      box-shadow: 9999px 15px 0 0 rgba(152, 128, 255, 0);
    }
  }
  @keyframes dot-falling-before {
    0% {
      box-shadow: 9984px -15px 0 0 rgba(152, 128, 255, 0);
    }
    25%,
    50%,
    75% {
      box-shadow: 9984px 0 0 0 white;
    }
    100% {
      box-shadow: 9984px 15px 0 0 rgba(152, 128, 255, 0);
    }
  }
  @keyframes dot-falling-after {
    0% {
      box-shadow: 10014px -15px 0 0 rgba(152, 128, 255, 0);
    }
    25%,
    50%,
    75% {
      box-shadow: 10014px 0 0 0 white;
    }
    100% {
      box-shadow: 10014px 15px 0 0 rgba(152, 128, 255, 0);
    }
  }
`;

const UserInfo = styled.div`
  width: 500px;
  height: 180px;
  background: var(--dark-bg-color);
  border-radius: 10px;
  display: flex;
  justify-content: space-around;
  align-items: center;
`;

const WaitRoomContainer = styled.div`
  width: 530px;
  height: 510px;
  background: var(--sub-bg-color);
  border-radius: 20px;
  margin: 0 auto;
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-direction: column;
`;

export default WaitRoom;
