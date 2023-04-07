import styled from "@emotion/styled";
import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  currentNormalGameInfoState,
  joinGameModalToggleState,
  modalBackToggleState,
  normalJoinTypeState,
  selectedNormalGameTitleState,
} from "../../api/atom";
import { axiosJoinGame, axiosWatchGame } from "../../api/request";
import ModalBackground from "../ModalBackground";

const JoinGameModal = () => {
  const gameTitle = useRecoilValue(selectedNormalGameTitleState);
  const [password, setPassword] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const setBackgroundModal = useSetRecoilState(modalBackToggleState);
  const [joinModal, setJoinModal] = useRecoilState(joinGameModalToggleState);
  const setCurrentNormalGameInfo = useSetRecoilState(
    currentNormalGameInfoState
  );
  const setNormalJoinType = useSetRecoilState(normalJoinTypeState);
  const navigator = useNavigate();

  const onCancel = () => {
    setBackgroundModal(false);
    setJoinModal({ toggle: false, type: "" });
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setPassword(e.currentTarget.value);

  const clickJoin = async () => {
    try {
      const data =
        joinModal.type === "join"
          ? await axiosJoinGame(gameTitle, password)
          : await axiosWatchGame(gameTitle, password);
      setCurrentNormalGameInfo({ ...data });
      navigator("/main/game/normal");
      setJoinModal({ toggle: false, type: "" });
      setNormalJoinType(joinModal.type === "join" ? "join" : "watch");
    } catch (e: any) {
      console.log("hi");
      if (e.response.status === 400) {
        setErrMsg("비밀번호가 틀렸습니다");
        setPassword("");
        return;
      }
      console.error(e);
    }
  };
  return (
    <>
      <ModalBackground onClick={onCancel} />
      <JoinGameModalContainer>
        <h1>{gameTitle || "yooh의 일반 게임"}</h1>
        <Input
          onChange={onChange}
          maxLength={20}
          type="password"
          placeholder="비밀번호"
          value={password}
        />
        <ErrorMsg>{errMsg}</ErrorMsg>
        <Button onClick={clickJoin}>참여하기</Button>
      </JoinGameModalContainer>
    </>
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
  z-index: 3;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

export default JoinGameModal;
