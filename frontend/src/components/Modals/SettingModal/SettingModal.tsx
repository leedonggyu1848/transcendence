import styled from "@emotion/styled";
import React, { useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  alertModalState,
  getMyProfileInfoState,
  myInfoState,
  myNameState,
  settingModalState,
} from "../../../api/atom";
import {
  axiosUpdateIntroduce,
  axiosUpdateProfileImage,
} from "../../../api/request";
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

  return (
    <>
      <ModalBackground onClick={onClickBackground} />
      <SettingModalContainer>
        <Container>
          <SettingProfile />
          <Name>{myName}</Name>
          <SettingTextArea />
        </Container>
        <Container>
          <BlockList />
        </Container>
      </SettingModalContainer>
    </>
  );
};

const Name = styled.div`
  color: white;
  font-size: 1.5rem;
  margin: 20px;
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
