import styled from "@emotion/styled";
import { useRecoilState, useSetRecoilState } from "recoil";
import { alertModalState, myInfoState } from "../../../api/atom";
import { axiosUpdateProfileImage } from "../../../api/request";

const SettingProfile = () => {
  const setAlertModal = useSetRecoilState(alertModalState);
  const [myInfo, setMyInfo] = useRecoilState(myInfoState);
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!event.target.files) return;
    const file = event.target.files[0];
    if (file && file.type === "image/png") {
      try {
        const formData = new FormData();
        formData.append("image", file);
        const response = await axiosUpdateProfileImage(formData);
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
  background: ${({ image }) =>
    image
      ? `url('http://localhost:3000/${image}?v=${new Date().getTime()}')`
      : 'url("/src/assets/defaultProfile.png")'};
  background-size: 100% 100%;
  border-radius: 10px;
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
