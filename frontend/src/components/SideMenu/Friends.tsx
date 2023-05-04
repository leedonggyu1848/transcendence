import styled from "@emotion/styled";
import { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  alertModalState,
  friendListState,
  sideMenuToggle,
} from "../../api/atom";
import { IFriendDto } from "../../api/interface";
import { WebsocketContext } from "../../api/WebsocketContext";
import Loading from "../Loading";

const Friends = ({ w }: { w: number }) => {
  const [friendsList, setFriendsList] = useRecoilState(friendListState);
  const socket = useContext(WebsocketContext);
  const setSideMenuToggle = useSetRecoilState(sideMenuToggle);
  const setAlertInfo = useSetRecoilState(alertModalState);
  const location = useLocation();

  const handleDeleteFriend = (friendName: string) => {
    socket.emit("delete-friend", friendName);
    setSideMenuToggle({ alarm: false, friends: false });
  };

  const handleRequestMatch = (friendName: string) => {};
  const handleDirectMessage = (friendName: string) => {
    if (
      friendsList.filter(
        (friend: IFriendDto) => friend.userName === friendName
      )[0].status === 0
    ) {
      setAlertInfo({
        type: "failure",
        header: "",
        msg: "접속 중인 친구가 아닙니다.",
        toggle: true,
      });
      return;
    }
    socket.emit("send-dm", friendName);
    //if (location.pathname)
  };

  return (
    <FriendsContainer w={w}>
      <Background />
      <Contents>
        <Header>Friends</Header>
        {friendsList.length > 0 ? (
          <FriendsList>
            {friendsList.map((friend, idx) => (
              <FriendInfo key={idx}>
                <Status status={friend.status} />
                <Profile src={friend.profile} />
                <div className="name">{friend.userName}</div>
                <div className="buttonContainer">
                  <Message
                    onClick={() => handleDirectMessage(friend.userName)}
                  />
                  <Game />
                  <Delete onClick={() => handleDeleteFriend(friend.userName)} />
                </div>
              </FriendInfo>
            ))}
          </FriendsList>
        ) : (
          <NoFriends>
            <CryingIcon />
            <div>
              등록된 친구가
              <br />
              없습니다.
            </div>
          </NoFriends>
        )}
      </Contents>
    </FriendsContainer>
  );
};

const Status = styled.div<{ status: number }>`
  width: 10px;
  height: 10px;
  margin-left: 10px !important;
  border-radius: 100%;
  background: ${({ status }) =>
    status === 1
      ? "rgb(0, 255, 51)"
      : status === 2
      ? "rgb(255, 170, 13)"
      : "rgb(255, 80, 80)"};
`;

const Message = styled.div`
  width: 15px;
  height: 15px;
  background: url("/src/assets/messageIcon.png");
  background-size: 100% 100%;
  cursor: pointer;
`;
const Delete = styled.div`
  width: 15px;
  height: 15px;
  background: url("/src/assets/deleteIcon.png");
  background-size: 100% 100%;
  cursor: pointer;
`;
const Game = styled.div`
  width: 15px;
  height: 15px;
  background: url("/src/assets/PongIcon.png");
  background-size: 100% 100%;
  cursor: pointer;
`;

const Profile = styled.div<{ src: string }>`
  width: 35px;
  height: 35px;
  border-radius: 10px;
  background-size: 100% 100%;
  background-image: ${({ src }) =>
    src
      ? `url('http://localhost:3000/${src}?v=${new Date().getTime()}')`
      : "url(/src/assets/defaultProfile.png)"};
`;

const FriendInfo = styled.div`
  width: 100%;
  height: 50px;
  background: var(--dark-bg-color);
  margin: 5px 0px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 10px;
  & > div {
    margin: 0 5px;
  }
  & > .buttonContainer {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  & > .buttonContainer > div {
    margin-left: 5px;
    border-radius: 5px;
    padding: 5px 5px;
    cursor: pointer;
  }
  & > .name {
    width: 50px;
  }
`;

const CryingIcon = styled.div`
  width: 60px;
  height: 60px;
  background: url("/src/assets/cryingIcon.png");
  background-size: 100% 100%;
  margin-bottom: 25px;
`;

const NoFriends = styled.div`
  font-size: 1.25rem;
  width: 90%;
  height: 80%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  line-height: 30px;
`;

const FriendsList = styled.div`
  width: 90%;
  height: 80%;
  border-radius: 10px;
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

const Contents = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  & .LoadingContainer {
    width: 90%;
    height: 80%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
`;

const Header = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  width: 80%;
  margin-bottom: 25px;
`;

const Background = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  background: var(--sub-bg-color);
  opacity: 0.95;
  border-radius: 10px;
`;

const FriendsContainer = styled.div<{ w: number }>`
  position: absolute;
  right: 0;
  top: 155px;
  ${({ w }) => `width : ${w}px`};
  height: 510px;
  border-radius: 10px;
  color: white;
`;

export default Friends;
