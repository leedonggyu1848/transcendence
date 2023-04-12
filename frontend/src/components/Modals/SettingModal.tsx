import styled from "@emotion/styled";
import React, { useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  alertModalState,
  getMyProfileInfoState,
  myInfoState,
  settingModalState,
} from "../../api/atom";
import {
  axiosUpdateIntroduce,
  axiosUpdateProfileImage,
} from "../../api/request";
import ModalBackground from "../ModalBackground";

const SettingModal = () => {
  const setSettingModalToggle = useSetRecoilState(settingModalState);
  const [myInfo, setMyInfo] = useRecoilState(myInfoState);
  const [text, setText] = useState("");
  const setAlertModal = useSetRecoilState(alertModalState);
  const onClickBackground = () => {
    setSettingModalToggle(false);
  };

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.currentTarget.value);
  };

  const handleEditIntroduce = async () => {
    try {
      const result = await axiosUpdateIntroduce(myInfo.intra_id, text);
      console.log(result);
      setMyInfo({ ...result });

      //myInfoState 수정 로직 필요
    } catch (e) {
      console.error(e);
      setAlertModal({
        type: "failure",
        header: "자기 소개 변경 실패",
        msg: "자기 소개 변경에 실패했습니다.",
        toggle: true,
      });
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!event.target.files) return;
    const file = event.target.files[0];
    if (file && file.type === "image/png") {
      try {
        const formData = new FormData();
        formData.append("image", file);
        const response = await axiosUpdateProfileImage(
          myInfo.intra_id,
          formData
        );
        setMyInfo({ ...response });
        console.log(response);
        // 응답으로 myInfo  업데이트 해야함
      } catch (e) {
        console.error(e);
        setAlertModal({
          type: "failure",
          header: "프로필 변경 실패",
          msg: "프로필 변경에 실패했습니다.",
          toggle: true,
        });
      }
    } else {
      alert("file type error");
      setAlertModal({
        type: "failure",
        header: "프로필 확장자 확인!",
        msg: "png 이미지만 가능합니다.",
        toggle: true,
      });
    }
  };
  const clickEdit = () => {
    toggleEdit(!editMode);
    if (editMode) {
      handleEditIntroduce();
      setText("");
    }
  };

  const [editMode, toggleEdit] = useState(false);
  const msg = "안녕하세요 잘부탁드립니다";

  return (
    <>
      <ModalBackground onClick={onClickBackground} />
      <SettingModalContainer>
        <ProfileContainer>
          <Profile image={myInfo.profile} />
          <ModifyButton htmlFor="profile" />
          <input
            className="profile"
            id="profile"
            type="file"
            accept="image/png"
            onChange={handleFileUpload}
          />
        </ProfileContainer>
        <Name>{myInfo.intra_id}</Name>
        <Header>
          <Text>자기 소개</Text>
          <Edit editMode={editMode} onClick={clickEdit} />
        </Header>
        {editMode ? (
          <TextArea
            placeholder={myInfo.introduce || msg}
            value={text}
            onChange={onChange}
          />
        ) : (
          <TextDiv>{myInfo.introduce || msg}</TextDiv>
        )}
      </SettingModalContainer>
    </>
  );
};

const Edit = styled.div<{ editMode: boolean }>`
  cursor: pointer;
  width: 25px;
  height: 25px;
  background-image: ${({ editMode }) =>
    editMode
      ? 'url("/src/assets/checkIconBackground.png")'
      : 'url("/src/assets/editIcon.png")'};
  background-size: 100% 100%;
`;

const Text = styled.div`
  color: white;
  font-size: 1.25rem;
  margin-top: 20px;
  margin-bottom: 20px;
`;

const Header = styled.div`
  display: flex;
  width: 70%;
  justify-content: space-between;
  align-items: center;
`;

const Name = styled.div`
  color: white;
  font-size: 1.5rem;
  margin: 20px;
`;

const ModifyButton = styled.label`
  position: absolute;
  right: -15px;
  bottom: -15px;
  background: var(--dark-bg-color);
  background-image: url("/src/assets/cameraIcon.png");
  background-size: 70% 67%;
  background-repeat: no-repeat;
  background-position: center center;
  border-radius: 10px;
  cursor: pointer;
  width: 40px;
  height: 40px;
`;

const ProfileContainer = styled.div`
  position: relative;
  & .profile {
    display: none;
  }
`;

const Profile = styled.div<{ image: string }>`
  width: 150px;
  height: 150px;
  background: ${({ image }) =>
    image
      ? `url('http://localhost:3000/${image}?v=${new Date().getTime()}')`
      : 'url("/src/assets/defaultProfile.png")'};
  background-size: 100% 100%;
  border-radius: 10px;
`;

const TextDiv = styled.div`
  width: 65%;
  border: none;
  border-radius: 10px;
  height: 150px;
  background: #333333;
  color: white;
  font-size: 1.25rem;
  padding: 15px;
  overflow-y: auto;
  word-break: break-all;

  &::-webkit-scrollbar {
    border-radius: 10px;
    width: 10px;
  }
  &::-webkit-scrollbar-track {
    background: white;
    border-radius: 10px;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--gray-color);
    width: 2px;
    border-radius: 10px;
  }
`;

const TextArea = styled.textarea`
  width: 65%;
  resize: none;
  outline: none;
  border: none;
  background: var(--sub-bg-color);
  border-radius: 10px;
  height: 150px;
  color: white;
  font-size: 1.25rem;
  padding: 15px;
  &::placeholder {
    color: #c5c5c5;
  }
  &::-webkit-scrollbar {
    border-radius: 10px;
    width: 10px;
  }
  &::-webkit-scrollbar-track {
    background: white;
    border-radius: 10px;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--gray-color);
    width: 2px;
    border-radius: 10px;
  }
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
