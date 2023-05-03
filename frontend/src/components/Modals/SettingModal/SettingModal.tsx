import styled from "@emotion/styled";
import React, { useEffect, useRef, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { myNameState, settingModalState } from "../../../api/atom";
import { axiosChangeNickName } from "../../../api/request";
import ModalBackground from "../../ModalBackground";
import BlockList from "./BlockList";
import SettingProfile from "./SettingProfile";
import SettingTextArea from "./SettingTextarea";

const SettingModal = () => {
  const setSettingModalToggle = useSetRecoilState(settingModalState);
  const myName = useRecoilValue(myNameState);
  const onClickBackground = () => {
    setSettingModalToggle(false);
  };

  const [editName, setEditName] = useState(false);
  const nameInput = useRef<HTMLInputElement>(null);

  const handleClickName = () => {
    setEditName(true);
  };

  const onSubmit = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (!e.currentTarget.value) {
        setEditName(false);
        return;
      }
      try {
        await axiosChangeNickName(e.currentTarget.value);
      } catch (e) {
        console.error(e);
      }
    }
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
            <Input onKeyUp={onSubmit} ref={nameInput} placeholder={myName} />
          )}
          <SettingTextArea />
        </Container>
        <Container>
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
