import styled from "@emotion/styled";
import { useState } from "react";
import { useRecoilValue } from "recoil";
import { selectedNormalGameTitleState } from "../../api/atom";

const JoinGameModal = () => {
  const gameTitle = useRecoilValue(selectedNormalGameTitleState);
  const [errMsg, setErrMsg] = useState("");
  return (
    <JoinGameModalContainer>
      <h1>{gameTitle || "yooh의 일반 게임"}</h1>
      <Input maxLength={20} type="password" placeholder="비밀번호" />
      <ErrorMsg>{errMsg}</ErrorMsg>
      <Button>입 장</Button>
    </JoinGameModalContainer>
  );
};

const Input = styled.input`
  width: 60%;
  height: 50px;
  border-radius: 10px;
  outline: none;
  border: none;
  background: var(--main-bg-color);
  text-align: center;
  &::placeholder {
    color: white;
  }

  font-size: 1.25rem;
  margin: 30px;
`;

const Button = styled.div`
  width: 60%;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--dark-bg-color);
  border-radius: 10px;
  margin-top: 30px;
  cursor: pointer;
  transition: 0.5s;
  &:hover {
    color: gray;
  }
  margin-bottom: 10px;
`;

const ErrorMsg = styled.div`
  color: #ff4747;
  height: 20px;
`;

const JoinGameModalContainer = styled.div`
  position: fixed;
  width: 400px;
  height: 350px;
  background: var(--sub-bg-color);
  left: calc(50% - 200px);
  top: calc(50% - 200px);
  border-radius: 20px;
  z-index: 2;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

export default JoinGameModal;
