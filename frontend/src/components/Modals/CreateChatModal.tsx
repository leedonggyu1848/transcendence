import styled from "@emotion/styled";
import React, { useContext, useEffect, useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  alertModalState,
  chatListState,
  createChatModalToggleState,
  currentChatState,
  myNameState,
} from "../../api/atom";
import { WebsocketContext } from "../../api/WebsocketContext";

const CreateChatModal = () => {
  const socket = useContext(WebsocketContext);
  const myName = useRecoilValue(myNameState);
  const setAlertInfo = useSetRecoilState(alertModalState);
  const setCurrentChat = useSetRecoilState(currentChatState);
  const [chatList, setChatList] = useRecoilState(chatListState);
  const setCreateChatModalToggle = useSetRecoilState(
    createChatModalToggleState
  );
  const closeModal = () => {
    setCreateChatModalToggle(false);
  };
  const [pwToggle, setToggle] = useState(true);
  const [info, setInfo] = useState({
    roomName: "",
    type: 0,
    password: "",
  });
  const onChangeRadio = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === "password") {
      setToggle(false);
      setInfo({ ...info, type: 2 });
    } else {
      setToggle(true);
      setInfo({ ...info, type: e.target.value === "public" ? 0 : 1 });
    }
  };

  const onChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInfo({ ...info, [e.target.name]: e.target.value });
  };
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    socket.emit("create-chat", {
      ...info,
      roomName: "#" + (info.roomName || `${myName}님의 채팅방`),
    });
  };

  useEffect(() => {
    socket.on(
      "create-success",
      ({
        roomName,
        type,
        operator,
      }: {
        roomName: string;
        type: number;
        operator: string;
      }) => {
        console.log("방생성 성공");
        const temp = {
          title: roomName,
          type,
          operator,
          count: 1,
        };
        setCurrentChat(temp);
        setChatList([...chatList, temp]);
        closeModal();
      }
    );

    socket.on("chat-fail", (msg: string) => {
      console.log(msg);
      closeModal();
      setAlertInfo({
        type: "failure",
        header: "챗 생성 실패",
        msg,
        toggle: true,
      });
    });

    return () => {
      socket.off("create-success");
      socket.off("chat-fail");
    };
  }, []);
  return (
    <>
      <ModalBackground onClick={closeModal} />
      <CreateChatModalContainer onSubmit={onSubmit}>
        <h1>방 생성하기</h1>
        <CheckContainer>
          <div>
            <label htmlFor="public">공개</label>
            <input
              id="public"
              name="type"
              type="radio"
              value="public"
              onChange={onChangeRadio}
              defaultChecked
            />
          </div>
          <div>
            <label htmlFor="private">비공개</label>
            <input
              id="private"
              name="type"
              type="radio"
              value="private"
              onChange={onChangeRadio}
            />
          </div>
          <div>
            <label htmlFor="password">비밀번호</label>
            <input
              id="password"
              name="type"
              type="radio"
              value="password"
              onChange={onChangeRadio}
            />
          </div>
        </CheckContainer>
        <InputContainer>
          <label htmlFor="roomName">방 제목</label>
          <input
            type="text"
            id="roomName"
            name="roomName"
            onChange={onChangeInput}
            placeholder={myName + "님의 채팅방"}
          />
        </InputContainer>
        <InputContainer>
          <label htmlFor="password">비밀번호</label>
          <input
            disabled={pwToggle}
            type="password"
            id="password"
            name="password"
            onChange={onChangeInput}
          />
        </InputContainer>
        <CreateButton type="submit">생성하기</CreateButton>
      </CreateChatModalContainer>
    </>
  );
};

const CreateButton = styled.button`
  outline: none;
  border: none;
  background: var(--dark-bg-color);
  color: white;
  width: 80%;
  height: 55px;
  border-radius: 10px;
  font-size: 1.25rem;
  font-weight: bold;
  cursor: pointer;
  letter-spacing: 12px;
  transition: 0.5s;
  &:hover {
    color: var(--gray-color);
  }
`;

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 80%;
  & > label {
    font-size: 1.25rem;
    font-weight: bold;
    margin-bottom: 10px;
  }

  & > input {
    height: 40px;
    padding: 3px 10px;
    outline: none;
    border-radius: 10px;
    border: none;
  }
`;

const CheckContainer = styled.div`
  display: flex;
  width: 80%;
  justify-content: space-between;
  & > div > label {
    margin-right: 5px;
  }
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

const CreateChatModalContainer = styled.form`
  position: fixed;
  width: 400px;
  height: 500px;
  background: var(--main-bg-color);
  border-radius: 10px;
  z-index: 2;
  left: calc(50% - 200px);
  top: calc(50% - 250px);
  color: white;
  display: flex;
  justify-content: space-around;
  flex-direction: column;
  align-items: center;
  & > h1 {
    width: 100%;
    margin-left: 90px;
  }
`;

export default CreateChatModal;
