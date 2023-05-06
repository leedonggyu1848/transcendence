import styled from "@emotion/styled";
import { ChangeEvent, useContext, useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  currentChatState,
  friendListState,
  inviteModalToggleState,
  joinChatToggleState,
} from "../../api/atom";
import { WebsocketContext } from "../../pages/WrapMainPage";
import ModalBackground from "../ModalBackground";

const InviteModal = () => {
  const socket = useContext(WebsocketContext);
  const friendList = useRecoilValue(friendListState);
  const setInviteModalToggle = useSetRecoilState(inviteModalToggleState);
  const currentChat = useRecoilValue(currentChatState);

  const onCancel = () => {
    setInviteModalToggle(false);
  };

  const handleInvite = (userName: string) => {
    socket.emit("chat-invite", { userName, roomName: currentChat });
  };

  return (
    <>
      <ModalBackground onClick={onCancel} />
      <InviteModalContainer>
        <h1>초대하기</h1>
        {friendList.length > 0 ? (
          <FriendsList>
            {friendList.map((friend, idx) => (
              <FriendInfo key={idx}>
                <Status status={friend.status} />
                <Profile src={friend.profile} />
                <div className="name">{friend.userName}</div>
                <Button
                  onClick={() => handleInvite(friend.userName)}
                  className={friend.status ? "enable" : "disabled"}
                >
                  초대하기
                </Button>
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
      </InviteModalContainer>
    </>
  );
};

const Button = styled.div`
  padding: 5px 10px;
  border-radius: 10px;
  &.enable {
    cursor: pointer;
    color: var(--dark-bg-color);
    background: white;
  }
  &.disabled {
    background: gray;
    color: lightgray;
    cursor: not-allowed;
  }

  margin-right: 10px !important;
`;

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

const Profile = styled.div<{ src: string }>`
  width: 35px;
  height: 35px;
  border-radius: 10px;
  background-size: 100% 100%;
  background-image: ${({ src }) =>
    src
      ? `url('http://localhost:3000/${src}/?v=${new Date().getTime()}')`
      : "url(/src/assets/defaultProfile.png)"};
`;

const FriendInfo = styled.div`
  width: 100%;
  height: 50px;
  background: var(--dark-bg-color);
  margin: 10px 0px;
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
    width: 30%;
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
  width: 80%;
  height: 70%;
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

const InviteModalContainer = styled.div`
  position: fixed;
  width: 400px;
  height: 500px;
  background: var(--sub-bg-color);
  left: calc(50% - 200px);
  top: calc(50% - 200px);
  border-radius: 20px;
  z-index: 3;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  & > h1 {
    width: 75%;
    margin-bottom: 30px;
  }
`;

export default InviteModal;
