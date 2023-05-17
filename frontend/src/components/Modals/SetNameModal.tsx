import styled from "@emotion/styled";
import React, { useContext, useEffect, useRef, useState } from "react";
import { WebsocketContext } from "../../pages/WrapMainPage";

const SetNameModal = () => {
  const socket = useContext(WebsocketContext);
  const [name, setName] = useState("");
  const setNickName = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!name) return;
    socket.emit("user-name", name);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };
  const inputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  });
  return (
    <>
      <ModalBackground />
      <SetNameModalContainer>
        <h1>환영합니다!</h1>
        <h2>닉네임을 설정해주세요!</h2>
        <Input
          onChange={onChange}
          type="text"
          ref={inputRef}
          placeholder="Nickname"
        />
        <Button onClick={setNickName}>설정하기</Button>
      </SetNameModalContainer>
    </>
  );
};

const Button = styled.div`
  width: 120px;
  height: 50px;
  background: white;
  color: black;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 25px;
  border-radius: 10px;
  font-size: 1.25rem;
  cursor: pointer;
  font-weight: bold;
`;

const Input = styled.input`
  width: 70%;
  height: 50px;
  border-radisu: 10px;
  outline: none;
  border: none;
  background: var(--dark-bg-color);
  color: white;
  border-radius: 10px;
  font-size: 1.5rem;
  text-align: center;
  margin-top: 25px;
`;

const ModalBackground = styled.div`
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1;
`;

const SetNameModalContainer = styled.div`
  position: fixed;
  width: 400px;
  height: 500px;
  background: var(--sub-bg-color);
  left: calc(50% - 200px);
  top: calc(50% - 250px);
  border-radius: 20px;
  z-index: 3;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  z-index: 2;
  & > h1,
  h2 {
    width: 70%;
  }
`;

export default SetNameModal;
