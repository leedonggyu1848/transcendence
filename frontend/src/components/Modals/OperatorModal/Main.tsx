import styled from "@emotion/styled";
import { useContext, useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  currentChatState,
  currentChatUserListState,
  myNameState,
} from "../../../api/atom";
import { WebsocketContext } from "../../../api/WebsocketContext";

const Main = () => {
  const [currentChatUserList, setCurrentChatUserList] = useRecoilState(
    currentChatUserListState
  );
  const myName = useRecoilValue(myNameState);
  const currentChat = useRecoilValue(currentChatState);
  const socket = useContext(WebsocketContext);

  const handleKickUser = (username: string) => {
    if (!currentChat) return;
    socket.emit("kick-user", {
      roomName: currentChat.title,
      userName: username,
    });
  };

  const handleBanUser = (username: string) => {
    if (!currentChat) return;
    socket.emit("ban-user", {
      roomName: currentChat.title,
      userName: username,
    });
  };

  const handleGiveOperator = (username: string) => {};

  useEffect(() => {});
  return (
    <MainContainer>
      <HeaderContainer>
        <div>Operator</div>
        <div>
          <div className="passwordTitle">
            <span>비밀번호 변경</span>
            <span className="button" />
          </div>
          <Input type="password" />
        </div>
      </HeaderContainer>
      <UsersContainer>
        {currentChatUserList
          .filter((name) => name !== myName)
          .map((user, idx) => (
            <User key={idx}>
              <Name>{user}</Name>
              <ButtonContainer>
                <Button onClick={() => handleKickUser(user)}>Kick</Button>
                <Button onClick={() => handleBanUser(user)}>Ban</Button>
                <Button>Oper</Button>
              </ButtonContainer>
            </User>
          ))}
      </UsersContainer>
    </MainContainer>
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

const UsersContainer = styled.div`
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

const Input = styled.input`
  border: none;
  outline: none;
  border-radius: 10px;
  width: 130px;
  height: 25px;
  margin-top: 5px;
`;

const HeaderContainer = styled.div`
  width: 85%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  margin-top: 20px;
  margin-bottom: 80px;
  & > div:first-of-type {
    font-size: 2rem;
    font-weight: bold;
  }
  & > div:last-of-type {
    position: absolute;
    right: -15px;
    top: 30px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: center;
    margin-top: 20px;
  }
  & .passwordTitle {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.15rem;
  }
  & .button {
    display: inline-block;
    width: 20px;
    height: 20px;
    background-image: url("/src/assets/checkIcon.png");
    background-size: 100% 100%;
    margin-left: 10px;
    cursor: pointer;
  }
`;

const MainContainer = styled.div`
  width: 400px;
  height: 100%;
  background: var(--main-bg-color);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export default Main;
