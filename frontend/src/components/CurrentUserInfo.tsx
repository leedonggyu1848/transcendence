import styled from "@emotion/styled";
import React, { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import {
  alertModalState,
  confirmModalToggleState,
  currentChatState,
  friendListState,
  myNameState,
} from "../api/atom";
import { JoinnedUserDto } from "../api/interface";
import { axiosSendFriendRequest } from "../api/request";
import { WebsocketContext } from "../api/WebsocketContext";

const CurrentUserInfo = ({
  data,
  title,
  operator,
  clickOperatorButton,
}: {
  data: JoinnedUserDto[];
  title: string;
  operator: boolean;
  clickOperatorButton: Function;
}) => {
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
  const openPersonalMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    const name = e.currentTarget.textContent as string;
    if (myName === name) return;
    setBlock(true);
    setTimeout(() => setToggle(true), 0);
    setTarget(name);
    setIsFriend(friendList.some((friend) => friend.userName === name));
  };

  const clickFriendRequest = (friendname: string) => {
    if (friendList.some((friend) => friend.userName === friendname)) return;
    socket.emit("request-friend", friendname);
    closePersonalMenu();
  };

  const clickDirectMessage = () => {
    console.log(location);
  };

  const clickDeleteFriend = (friendName: string) => {
    console.log(friendName);
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

  const closePersonalMenu = () => {
    setTarget("");
    setToggle(false);
    setTimeout(() => setBlock(false), 800);
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
          {operator && <OperatorIcon onClick={() => clickOperatorButton()} />}
          <UserIcon />
          {data.length}
        </InfoContainer>
      </HeaderContainer>
      <UserNameContainer>
        {data.map(({ intra_id, type }, idx) => (
          <UserName key={idx} className={type} onClick={openPersonalMenu}>
            {intra_id}
          </UserName>
        ))}
      </UserNameContainer>
      {block && (
        <PersonalMenu toggle={toggle}>
          <TargetName>{target}</TargetName>
          <div>
            <MessageIcon onClick={clickDirectMessage} />
            {isFriend && (
              <DeleteFriendIcon onClick={() => clickDeleteFriend(target)} />
            )}
            {!isFriend && (
              <AddFriendIcon onClick={() => clickFriendRequest(target)} />
            )}
            {!isFriend && <BlockUserIcon />}
            <ExitIcon onClick={closePersonalMenu} />
          </div>
        </PersonalMenu>
      )}
    </CurrentUserInfoContainer>
  );
};

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

const MessageIcon = styled.div`
  width: 23px;
  height: 23px;
  background-image: url("/src/assets/messageIcon.png");
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

const OperatorIcon = styled.div`
  background-image: url("/src/assets/adminIcon.png");
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
