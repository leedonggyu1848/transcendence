import styled from "@emotion/styled";
import React, { useContext } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import { alertModalState, myInfoState } from "../../../api/atom";
import { axiosUpdateProfileImage } from "../../../api/request";
import { WebsocketContext } from "../../../pages/WrapMainPage";

const SettingProfile = () => {
  const setAlertModal = useSetRecoilState(alertModalState);
  const [myInfo, setMyInfo] = useRecoilState(myInfoState);
  const socket = useContext(WebsocketContext);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    const file = event.target.files[0];
    if (file && file.type === "image/png") {
      const formData = new FormData();
      formData.append("image", file);
      socket.emit("user-profile", file);
    }
  };

  return (
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
  );
};

const ProfileContainer = styled.div`
  position: relative;
  & .profile {
    display: none;
  }
`;

const Profile = styled.div<{ image: string }>`
  width: 150px;
  height: 150px;
  background-size: cover;
  background-position: center;
  border-radius: 10px;
  background-size: 100% 100%;
  background-image: ${({ image }) =>
    image
      ? `url(${import.meta.env.VITE_FRONT_ADDRESS}/${image})`
      : "url(/src/assets/defaultProfile.png)"};
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

export default SettingProfile;
