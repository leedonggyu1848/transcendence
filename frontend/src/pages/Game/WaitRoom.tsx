import styled from "@emotion/styled";
import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { currentGameInfoState, myInfoState, myNameState } from "../../api/atom";
import { ICurrentGame, UserDto } from "../../api/interface";
import UserInfo from "./UserInfo";

function getInfo(gameInfo: ICurrentGame, myName: string) {
  if (gameInfo.opponentDto) {
    if (myName === gameInfo.ownerDto.userName) {
      return [gameInfo.ownerDto, gameInfo.opponentDto];
    } else if (myName === gameInfo.opponentDto.userName) {
      return [gameInfo.opponentDto, gameInfo.ownerDto];
    } else {
      return [gameInfo.ownerDto, gameInfo.opponentDto];
    }
  } else {
    if (myName === gameInfo.ownerDto.userName) {
      return [gameInfo.ownerDto, null];
    } else {
      return [gameInfo.ownerDto, null];
    }
  }
}

const WaitRoom = ({ count }: { count: number }) => {
  const gameInfo = useRecoilValue(currentGameInfoState);
  const myInfo = useRecoilValue(myInfoState);
  const myName = useRecoilValue(myNameState);
  const [me, opponent] = getInfo(gameInfo, myName);
  return (
    <WaitRoomContainer>
      {opponent ? (
        <UserInfo {...opponent} />
      ) : (
        <NoUser>
          <span>상대방을 기다리는 중입니다</span>
          <span className="dot-falling" />
        </NoUser>
      )}
      <OptionContainer>{count === 4 ? "VS" : count}</OptionContainer>
      <UserInfo {...me} />
    </WaitRoomContainer>
  );
};

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
