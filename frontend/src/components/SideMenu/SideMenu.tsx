import styled from "@emotion/styled";
import { useState } from "react";
import { useRecoilValue } from "recoil";
import { friendRequestListState } from "../../api/atom";
import Alarms from "./Alarms";
import Friends from "./Friends";

const SideMenu = ({ w }: { w: number }) => {
  const [toggles, setToggles] = useState({
    friends: false,
    alarm: false,
  });

  const friendRequestList = useRecoilValue(friendRequestListState);

  const clickLogout = () => {};

  return (
    <SideMenuContainer>
      <FriendsIcon
        onClick={() => setToggles({ alarm: false, friends: !toggles.friends })}
      />
      <AlarmIcon
        onClick={() => setToggles({ friends: false, alarm: !toggles.alarm })}
      >
        {friendRequestList.length > 0 && (
          <NewRequest>{friendRequestList.length}</NewRequest>
        )}
      </AlarmIcon>
      <LogoutIcon />
      {toggles.friends && <Friends w={w} />}
      {toggles.alarm && <Alarms w={w} />}
    </SideMenuContainer>
  );
};

const NewRequest = styled.div`
  position: absolute;
  right: -10px;
  bottom: -10px;
  background: red;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 20px;
  border-radius: 5px;
  height: 20px;
  color: white;
`;

const FriendsIcon = styled.div`
  width: 35px;
  height: 25px;
  background: url("/src/assets/friendsIcon.png");
  background-size: 100% 100%;
  cursor: pointer;
  margin-right: 25px;
  margin-left: 25px;
`;

const AlarmIcon = styled.div`
  width: 26px;
  height: 30px;
  background: url("/src/assets/alarmIcon.png");
  background-size: 100% 100%;
  cursor: pointer;
  margin-right: 25px;
  position: relative;
`;

const LogoutIcon = styled.div`
  width: 30px;
  height: 30px;
  background: url("/src/assets/logoutIcon.png");
  background-size: 100% 100%;
  cursor: pointer;
  margin-right: 25px;
`;

const SideMenuContainer = styled.div`
  height: 60px;
  background: var(--sub-bg-color);
  border-radius: 10px;
  margin: 0 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  position: relative;
`;

export default SideMenu;