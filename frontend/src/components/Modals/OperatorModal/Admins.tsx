import styled from "@emotion/styled";
import { useContext } from "react";
import { useRecoilValue } from "recoil";
import {
  currentChatState,
  joinnedChatState,
  myNameState,
} from "../../../api/atom";
import { WebsocketContext } from "../../../pages/WrapMainPage";

const Admins = () => {
  const joinChat = useRecoilValue(joinnedChatState);
  const currentChat = useRecoilValue(currentChatState);
  const socket = useContext(WebsocketContext);
  const myName = useRecoilValue(myNameState);
  const handlePermissionRelease = (user: string) => {
    socket.emit("chat-del-admin", { roomName: currentChat, userName: user });
  };
  return (
    <AdminsContainer>
      <Header>Admins</Header>
      <AdminList>
        {joinChat[currentChat].admins
          .filter((name) => name != myName)
          .map((user, idx) => (
            <User key={idx}>
              <Name>{user}</Name>
              <ButtonContainer>
                <Button onClick={() => handlePermissionRelease(user)}>
                  해제
                </Button>
              </ButtonContainer>
            </User>
          ))}
      </AdminList>
    </AdminsContainer>
  );
};

const User = styled.div`
  width: 90%;
  height: 60px;
  background: var(--dark-bg-color);
  margin: 0 auto;
  margin-top: 5px;
  border-radius: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const ButtonContainer = styled.div`
  display: flex;
`;
const Button = styled.div`
  border-radius: 10px;
  background: white;
  color: black;
  padding: 5px 10px;
  margin-right: 10px;
  cursor: pointer;
`;
const Name = styled.div`
  padding: 10px;
  margin-left: 10px;
`;

const Header = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  width: 85%;
  margin-top: 40px;
  margin-bottom: 70px;
`;
const AdminList = styled.div`
  width: 90%;
  height: 300px;
  background: var(--sub-bg-color);
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

const AdminsContainer = styled.div`
  width: 250px;
  height: 100%;
  background: var(--main-bg-color);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export default Admins;
