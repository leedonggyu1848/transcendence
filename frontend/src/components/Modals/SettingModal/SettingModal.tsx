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
        <SettingProfile />
        <Name>{myName}</Name>
        <SettingTextArea />
      </SettingModalContainer>
    </>
  );
};

const Name = styled.div`
  color: white;
  font-size: 1.5rem;
  margin: 20px;
`;

const SettingModalContainer = styled.div`
  position: fixed;
  left: 30%;
  top: 30%;
  width: 400px;
  height: 600px;
  background: var(--main-bg-color);
  border-radius: 10px;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export default SettingModal;
