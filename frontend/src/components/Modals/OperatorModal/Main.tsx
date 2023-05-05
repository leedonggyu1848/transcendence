import styled from "@emotion/styled";
import { ChangeEvent, useContext, useEffect, useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  alertModalState,
  currentChatState,
  currentChatUserListState,
  joinnedChatState,
  myNameState,
  operatorModalToggleState,
} from "../../../api/atom";
import { WebsocketContext } from "../../../pages/WrapMainPage";

const Main = () => {
  const [currentChatUserList, setCurrentChatUserList] = useRecoilState(
    currentChatUserListState
  );
  const myName = useRecoilValue(myNameState);
  const currentChat = useRecoilValue(currentChatState);
  const [password, setPassword] = useState("");
  const socket = useContext(WebsocketContext);
  const setAlertInfo = useSetRecoilState(alertModalState);
  const operatorModal = useSetRecoilState(operatorModalToggleState);
  const [joinnedChat, setJoinnedChat] = useRecoilState(joinnedChatState);

  const handleMuteUser = (username: string) => {
    socket.emit("mute-user", {
      roomName: currentChat,
      userName: username,
    });
  };

  const handleKickUser = (username: string) => {
    socket.emit("kick-user", {
      roomName: currentChat,
      userName: username,
    });
  };

  const handleBanUser = (username: string) => {
    socket.emit("ban-user", {
      roomName: currentChat,
      userName: username,
    });
  };

  const changePasswod = (password: string) => {
    socket.emit("chat-password", {
      roomName: currentChat,
      password: password,
    });
    setPassword("");
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleGiveOperator = (roomName: string, username: string) => {
    socket.emit("chat-operator", { roomName: roomName, operator: username });
    operatorModal(false);
  };

  useEffect(() => {
    socket.on(
      "kick-user",
      ({ userName, roomName }: { userName: String; roomName: string }) => {
        setJoinnedChat({
          ...joinnedChat,
          [roomName]: {
            ...joinnedChat[roomName],
            userList: joinnedChat[roomName].userList.filter(
              (user) => user != userName
            ),
          },
        });
      }
    );

    socket.on("chat-password", () => {
      setAlertInfo({
        type: "success",
        header: "",
        msg: "비밀번호 변경 성공!",
        toggle: true,
      });
    });

    return () => {
      socket.off("kick-user");
      socket.off("chat-password");
    };
  }, [joinnedChat, currentChat]);
  return (
    <MainContainer>
      <HeaderContainer>
        <div>Operator</div>
        <div>
          <div className="passwordTitle">
            <span>비밀번호 변경</span>
            <span className="button" onClick={() => changePasswod(password)} />
          </div>
          <Input
            maxLength={15}
            type="password"
            onChange={onChange}
            value={password}
          />
        </div>
      </HeaderContainer>
      <UsersContainer>
        {joinnedChat[currentChat].userList
          .filter((name) => name !== myName)
          .map((user, idx) => (
            <User key={idx}>
              <Name>{user}</Name>
              <ButtonContainer>
                <Button onClick={() => handleMuteUser(user)}>Mute</Button>
                <Button onClick={() => handleKickUser(user)}>Kick</Button>
                <Button onClick={() => handleBanUser(user)}>Ban</Button>
                <Button onClick={() => handleGiveOperator(currentChat, user)}>
                  Oper
                </Button>
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
  padding-right: 10px;
`;
const Button = styled.div`
  border-radius: 10px;
  background: white;
  color: black;
  padding: 5px;
  margin-right: 5px;
  cursor: pointer;
`;
const Name = styled.div`
  padding: 10px;
  margin-left: 10px;
`;

const UsersContainer = styled.div`
  width: 95%;
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
