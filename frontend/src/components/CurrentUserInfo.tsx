import styled from "@emotion/styled";
import React, { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import {
  confirmModalToggleState,
  currentChatState,
  friendListState,
  joinnedChatState,
  myNameState,
  operatorModalToggleState,
  ownerModalToggleState,
  profileModalState,
} from "../api/atom";
import { JoinnedUserDto } from "../api/interface";
import { axiosRequestUserInfo } from "../api/request";
import { WebsocketContext } from "../pages/WrapMainPage";

const CurrentUserInfo = ({
  data,
  title,
  owner,
  admins,
}: {
  data: JoinnedUserDto[];
  title: string;
  owner: boolean;
  admins: string[];
}) => {
  console.log(data);
  const [toggle, setToggle] = useState(false);
  const [block, setBlock] = useState(false);
  const [target, setTarget] = useState("");
  const location = useLocation();
  const myName = useRecoilValue(myNameState);
  const setConfirmModalState = useSetRecoilState(confirmModalToggleState);
  const socket = useContext(WebsocketContext);
  const friendList = useRecoilValue(friendListState);
  const [isFriend, setIsFriend] = useState(false);
  const currentChat = useRecoilValue(currentChatState);
  const setOperatorModal = useSetRecoilState(operatorModalToggleState);
  const setOwnerModal = useSetRecoilState(ownerModalToggleState);
  const openPersonalMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    const name = e.currentTarget.textContent as string;
    if (myName === name) return;
    setBlock(true);
    setTimeout(() => setToggle(true), 0);
    setTarget(name);
    setIsFriend(friendList.some((friend) => friend.userName === name));
  };
  const setProfileModal = useSetRecoilState(profileModalState);

  const clickFriendRequest = (friendname: string) => {
    if (friendList.some((friend) => friend.userName === friendname)) return;
    socket.emit("request-friend", friendname);
    closePersonalMenu();
  };

  const clickOperatorButton = () => {
    if (owner) setOwnerModal(true);
    else if (admins.includes(myName)) setOperatorModal(true);
  };

  const clickDeleteFriend = (friendName: string) => {
    setConfirmModalState({
      msg: `${friendName}님을 친구목록에서 삭제하시겠습니까?`,
      toggle: true,
      confirmFunc: () => {
        socket.emit("delete-friend", friendName);
        setConfirmModalState({
          msg: "",
          toggle: false,
          confirmFunc: () => {},
        });
        closePersonalMenu();
      },
    });
  };

  const clickBlockUser = (friendName: string) => {
    setConfirmModalState({
      msg: `${friendName}님을 차단하시겠습니까?`,
      toggle: true,
      confirmFunc: () => {
        socket.emit("block-user", friendName);
        setConfirmModalState({
          msg: "",
          toggle: false,
          confirmFunc: () => {},
        });
        closePersonalMenu();
      },
    });
  };

  const clickInfoIcon = async (userName: string) => {
    try {
      const data = await axiosRequestUserInfo(userName);
      setProfileModal({
        toggle: true,
        user: data,
      });
      closePersonalMenu();
    } catch (e) {
      console.error(e);
    }
  };

  const closePersonalMenu = () => {
    setTarget("");
    setToggle(false);
    setTimeout(() => setBlock(false), 800);
  };

  const clickInviteGame = (userName: string) => {
    socket.emit("game-invite", {
      roomName: `${userName}과의 일반 게임`,
      userName,
    });
  };

  useEffect(() => {
    closePersonalMenu();
  }, [currentChat]);
  return (
    <CurrentUserInfoContainer>
      <HeaderContainer>
        <Title>
          {title.slice(0, 13)}
          {title.length > 13 ? "..." : ""}
        </Title>
        <InfoContainer>
          {owner && <OwnerIcon onClick={() => clickOperatorButton()} />}
          {!owner && admins.includes(myName) && (
            <OperatorIcon onClick={() => clickOperatorButton()} />
          )}
          <UserIcon />
          {data.length}
        </InfoContainer>
      </HeaderContainer>
      <UserNameContainer>
        {data.map(({ userName, type }, idx) => (
          <UserName key={idx} className={type} onClick={openPersonalMenu}>
            {userName}
          </UserName>
        ))}
      </UserNameContainer>
      {block && (
        <PersonalMenu toggle={toggle}>
          <TargetName>{target}</TargetName>
          <div>
            {location.pathname !== "/main/game" && (
              <InviteIcon onClick={() => clickInviteGame(target)} />
            )}
            {isFriend && (
              <DeleteFriendIcon onClick={() => clickDeleteFriend(target)} />
            )}
            {!isFriend && (
              <AddFriendIcon onClick={() => clickFriendRequest(target)} />
            )}
            {!isFriend && (
              <BlockUserIcon onClick={() => clickBlockUser(target)} />
            )}
            <InfoIcon onClick={() => clickInfoIcon(target)} />
            <ExitIcon onClick={closePersonalMenu} />
          </div>
        </PersonalMenu>
      )}
    </CurrentUserInfoContainer>
  );
};

const InfoIcon = styled.div`
  width: 30px;
  height: 30px;
  background-image: url("/src/assets/info.png");
  background-size: 100% 100%;
  cursor: pointer;
  margin-right: 15px;
`;

const DeleteFriendIcon = styled.div`
  width: 30px;
  height: 30px;
  background-image: url("/src/assets/deleteUserIcon.png");
  background-size: 100% 100%;
  cursor: pointer;
  margin-right: 15px;
`;
const ExitIcon = styled.div`
  width: 25px;
  height: 25px;
  background-image: url("/src/assets/exitButton.png");
  background-size: 100% 100%;
  cursor: pointer;
  margin-right: 10px;
`;

const InviteIcon = styled.div`
  width: 23px;
  height: 23px;
  background-image: url("/src/assets/PongIcon.png");
  background-size: 100% 100%;
  cursor: pointer;
  margin-right: 15px;
`;

const AddFriendIcon = styled.div`
  width: 28px;
  height: 28px;
  background-image: url("/src/assets/addFriendIcon.png");
  background-size: 100% 100%;
  margin-right: 10px;
  cursor: pointer;
`;

const TargetName = styled.div`
  margin-left: 15px;
`;

const BlockUserIcon = styled.div`
  width: 28px;
  height: 28px;
  background: url("/src/assets/blockUserIcon.png");
  background-size: 100% 100%;
  margin-right: 10px;
  cursor: pointer;
`;

const PersonalMenu = styled.div<{ toggle: boolean }>`
  position: absolute;
  left: 0;
  top: 110%;
  width: 100%;
  height: 70px;
  background: var(--dark-bg-color);
  z-index: 1;
  border-radius: 10px;
  transition: 1s;
  transform: translateY(${({ toggle }) => (toggle ? "0" : "-100%")});
  opacity: ${({ toggle }) => (toggle ? 1 : 0)};
  display: flex;
  justify-content: space-between;
  align-items: center;

  & > div:last-of-type {
    display: flex;
    align-items: center;
  }
`;

const OwnerIcon = styled.div`
  background-image: url("/src/assets/owner.png");
  width: 15px;
  height: 15px;
  background-size: 100% 100%;
  cursor: pointer;
  margin-right: 10px;
`;

const OperatorIcon = styled.div`
  background-image: url("/src/assets/admin.png");
  width: 15px;
  height: 15px;
  background-size: 100% 100%;
  cursor: pointer;
  margin-right: 10px;
`;

const UserIcon = styled.div`
  background-image: url("/src/assets/userIcon.png");
  width: 15px;
  height: 15px;
  background-size: 100% 100%;
  margin-right: 10px;
  cursor: pointer;
`;

const InfoContainer = styled.div`
  display: flex;
  align-items: center;
`;

const HeaderContainer = styled.div`
  width: 90%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.div`
  font-size: 1.1rem;
  margin-bottom: 10px;
`;

const UserNameContainer = styled.div`
  width: 95%;
  height: 100px;
  overflow-y: auto;
  border-radius: 10px;
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

const UserName = styled.div`
  display: inline-block;
  padding: 5px 10px;
  border-radius: 10px;
  padding: 10px;
  margin: 5px;
  &.watcher {
    background: var(--main-bg-color);
  }
  &.owner {
    background: var(--blue-color);
  }
  &.opponent {
    background: var(--purple-color);
  }
`;

const CurrentUserInfoContainer = styled.div`
  width: 100%;
  height: 150px;
  border-radius: 10px;
  margin-bottom: 20px;
  background: var(--sub-bg-color);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  position: relative;
`;

export default CurrentUserInfo;
