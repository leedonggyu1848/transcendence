import styled from "@emotion/styled";
import { useEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import { modalBackToggleState, rankWaitModalToggleState } from "../../api/atom";
import ModalBackground from "../ModalBackground";

const RankWaitModal = () => {
  const [timer, setTimer] = useState(0);
  const setModalBack = useSetRecoilState(modalBackToggleState);
  const setRankWaitModal = useSetRecoilState(rankWaitModalToggleState);
  const setBackgroundModal = useSetRecoilState(modalBackToggleState);
  const onCancel = () => {
    setBackgroundModal(false);
    setRankWaitModal(false);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      setTimer(() => timer + 1);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [timer]);

  const onCloseModal = () => {
    // 서버에 대기열 취소 요청 보내야함

    setModalBack(false);
    setRankWaitModal(false);
  };

  return (
    <>
      <ModalBackground onClick={onCancel} />
      <RankWaitModalContainer>
        <Count>
          {timer}
          <Circle />
        </Count>
        <Text>
          <span>상대방을 기다리는 중입니다</span>{" "}
          <span className="dot-falling" />
        </Text>
        <Cancel onClick={onCloseModal}>취소하기</Cancel>
      </RankWaitModalContainer>
    </>
  );
};

const Circle = styled.div`
  position: absolute;
  width: 75%;
  height: 75%;
  border: 3px solid white;
  background-clip: padding-box;
  border-radius: 9999px;
  display: inline-block;
  border: 10px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
  -webkit-animation: spin 1s ease-in-out infinite;

  @keyframes spin {
    to {
      -webkit-transform: rotate(360deg);
    }
  }
  @-webkit-keyframes spin {
    to {
      -webkit-transform: rotate(360deg);
    }
  }
`;
const Cancel = styled.div`
  border: 1px solid white;
  padding: 10px 20px;
  border-radius: 10px;
  margin-top: 60px;
  cursor: pointer;
  transition: 0.5s;
  &:hover {
    background: white;
    color: var(--dark-bg-color);
  }
`;
const Count = styled.div`
  width: 100px;
  height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  margin-bottom: 50px;
  font-size: 1.7rem;
  font-weight: bold;
`;
const Text = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
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

const RankWaitModalContainer = styled.div`
  width: 300px;
  height: 350px;
  position: fixed;
  left: calc(50% - 150px);
  top: calc(50% - 175px);
  background: var(--main-bg-color);
  border-radius: 10px;
  z-index: 2;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  color: white;
`;

export default RankWaitModal;
