import styled from "@emotion/styled";
import { useRecoilState } from "recoil";
import { profileModalState } from "../../api/atom";
import ModalBackground from "../ModalBackground";

const ProfileModal = () => {
  const [profile, setProfileModal] = useRecoilState(profileModalState);
  const onCancel = () => {
    setProfileModal({
      toggle: false,
      user: null,
    });
  };
  const cal = (a: number, b: number) =>
    a + b === 0 ? 0 : ((a / (a + b)) * 100).toFixed(1);
  return (
    <>
      <ModalBackground onClick={onCancel} />
      <ProfileModalContainer>
        <ProfileImage profile={profile.user.profile} />
        <Name>{profile.user.userName}</Name>
        <Stats>
          <h2>Stats</h2>
          <StatsContainer>
            <div>
              <StatType>일반 게임</StatType>
              <div>Win : {profile.user.normalWin}승</div>
              <div>Lose : {profile.user.normalLose}패</div>
              <div>
                승률 : {cal(profile.user.normalWin, profile.user.normalLose)}%
              </div>
            </div>
            <div>
              <StatType>랭크 게임</StatType>
              <div>Win : {profile.user.rankWin}승</div>
              <div>Lose : {profile.user.rankLose}패</div>
              <div>
                승률 : {cal(profile.user.rankWin, profile.user.rankLose)}%
              </div>
            </div>
          </StatsContainer>
        </Stats>
        <Introduce>
          <h2>Introduce</h2>
          <IntroduceContainer>
            {profile.user.introduce || "안녕하세요 잘 부탁드립니다!"}
          </IntroduceContainer>
        </Introduce>
      </ProfileModalContainer>
      ;
    </>
  );
};

const Introduce = styled.div`
  width: 70%;
  color: white;
`;
const IntroduceContainer = styled.div`
  width: 90%;
  border: 1px solid white;
  border-radius: 10px;
  padding: 10px;
  height: 100px;
  word-break: break-all;
  overflow-y: auto;
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

const StatType = styled.div`
  margin-bottom: 15px;
`;

const StatsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const Stats = styled.div`
  color: white;
  width: 70%;
  margin-bottom: 20px;
`;
const Name = styled.div`
  color: white;
  font-size: 2rem;
`;
const ProfileImage = styled.div<{ profile: string }>`
  width: 200px;
  height: 200px;
  border-radius: 100%;
  background: ${({ profile }) =>
    profile
      ? `url(${import.meta.env.VITE_FRONT_ADDRESS}/${profile})`
      : "url(/src/assets/defaultProfile.png)"};
  background-size: 100% 100%;
  margin-bottom: 20px;
`;

const ProfileModalContainer = styled.div`
  width: 400px;
  height: 700px;
  position: fixed;
  left: calc(50% - 200px);
  top: calc(50% - 350px);
  background: var(--main-bg-color);
  z-index: 2;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

export default ProfileModal;
