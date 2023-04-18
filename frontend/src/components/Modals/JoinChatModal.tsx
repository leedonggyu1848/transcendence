import styled from "@emotion/styled";
import { ChangeEvent, useContext, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import { joinChatToggleState } from "../../api/atom";
import { WebsocketContext } from "../../api/WebsocketContext";
import ModalBackground from "../ModalBackground";

const JoinChatModal = () => {
  const [password, setPassword] = useState("");
  const [joinChatToggle, setJoinChatToggle] =
    useRecoilState(joinChatToggleState);
  const socket = useContext(WebsocketContext);
  const onCancel = () => {
    setJoinChatToggle({ roomName: "", toggle: false });
  };
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const onSubmit = () => {
    socket.emit("join-chat", { roomName: joinChatToggle.roomName, password });
    setJoinChatToggle({ roomName: "", toggle: false });
  };

  return (
    <>
      <ModalBackground onClick={onCancel} />
      <JoinChatModalContainer>
        <h1>{joinChatToggle.roomName.slice(1)}</h1>
        <Input
          onChange={onChange}
          maxLength={20}
          type="password"
          placeholder="비밀번호"
          value={password}
        />
        <ErrorMsg>{}</ErrorMsg>
        <Button onClick={onSubmit}>참여하기</Button>
      </JoinChatModalContainer>
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

const JoinChatModalContainer = styled.div`
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

export default JoinChatModal;
