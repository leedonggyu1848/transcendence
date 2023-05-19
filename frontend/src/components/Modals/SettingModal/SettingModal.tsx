import styled from "@emotion/styled";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { myNameState, settingModalState } from "../../../api/atom";
import { WebsocketContext } from "../../../pages/WrapMainPage";
import ModalBackground from "../../ModalBackground";
import BlockList from "./BlockList";
import MyStats from "./MyStats";
import SettingProfile from "./SettingProfile";
import SettingTextArea from "./SettingTextarea";

const SettingModal = () => {
  const setSettingModalToggle = useSetRecoilState(settingModalState);
  const myName = useRecoilValue(myNameState);
  const onClickBackground = () => {
    setSettingModalToggle(false);
  };
  const socket = useContext(WebsocketContext);
  const [editName, setEditName] = useState(false);
  const nameInput = useRef<HTMLInputElement>(null);
  const [nameValue, setNameValue] = useState("");

  const handleClickName = () => {
    setEditName(true);
  };

  const onSubmit = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setEditName(false);
      if (!e.currentTarget.value) {
        return;
      }
      socket.emit("user-name", e.currentTarget.value);
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const regex = /[^a-zA-Z0-9]/;
    if (regex.test(e.target.value)) {
      return;
    }
    setNameValue(e.currentTarget.value);
  };

  useEffect(() => {
    if (editName) {
      if (nameInput.current) nameInput.current.focus();
    }
  }, [editName, nameInput]);

  return (
    <>
      <ModalBackground onClick={onClickBackground} />
      <SettingModalContainer>
        <Container>
          <SettingProfile />
          {!editName && <Name onClick={handleClickName}>{myName}</Name>}
          {editName && (
            <Input
              maxLength={15}
              onKeyUp={onSubmit}
              ref={nameInput}
              placeholder={myName}
              value={nameValue}
              onChange={onChange}
            />
          )}
          <SettingTextArea />
        </Container>
        <Container>
          <MyStats />
          <BlockList />
        </Container>
      </SettingModalContainer>
    </>
  );
};

const Input = styled.input`
  color: white;
  font-size: 1.5rem;
  margin: 20px;
  border-radius: 10px;
  background: #333333;
  text-align: center;
  outline: none;
  border: none;
`;

const Name = styled.div`
  color: white;
  font-size: 1.5rem;
  margin: 20px;
  cursor: pointer;
`;

const Container = styled.div`
  width: 400px;
  height: 600px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  &:last-of-type {
    margin-right: 20px;
  }
`;

const SettingModalContainer = styled.div`
  position: fixed;
  left: calc(50% - 370px);
  top: calc(50%-300px);
  width: 740px;
  height: 600px;
  background: var(--main-bg-color);
  border-radius: 10px;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export default SettingModal;
