import styled from "@emotion/styled";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  chatLogState,
  currentNormaGameUsersState,
  currentNormalGameInfoState,
  myInfoState,
  myNameState,
} from "../../api/atom";
import { IChatLog, JoinnedUserDto, UserDto } from "../../api/interface";
import { axiosLeaveNormalGame } from "../../api/request";
import { WebsocketContext } from "../../api/WebsocketContext";
import ChatBox from "../../components/Chat/ChatBox";
import CurrentUserInfo from "../../components/CurrentUserInfo";
import PongGame from "./PongGame";
import WaitRoom from "./WaitRoom";

const NormalGamePage = () => {
  const [start, setStart] = useState(false);
  const [gameInfo, setGameInfo] = useRecoilState(currentNormalGameInfoState);
  const usersInfo = useRecoilValue(currentNormaGameUsersState);
  const [chatLogs, setChatLogs] = useState<IChatLog[]>([]);
  const myInfo = useRecoilValue(myInfoState);
  const myName = useRecoilValue(myNameState);
  const socket = useContext(WebsocketContext);
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
    setMsg(e.target.value);
  };

  const onSend = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && msg) {
      setChatLogs([...chatLogs, { sender: myName, msg, time: new Date() }]);
      socket.emit("message", {
        roomName: gameInfo.gameDto.title,
        userName: myName,
        message: msg,
      });
      setMsg("");
    }
  };

  const clickExit = async () => {
    try {
      await axiosLeaveNormalGame();
      socket.emit("leave-room", {
        roomName: gameInfo.gameDto.title,
        userInfo: myInfo,
      });
      navigate("/main/lobby");
    } catch (e) {
      console.error(e);
      alert(e);
    }
  };

  useEffect(() => {
    if (gameInfo.ownerDto.intra_id === myName) {
      socket.emit("create-room", gameInfo.gameDto.title);
    } else {
      console.log(myInfo);
      socket.emit("join-room", {
        roomName: gameInfo.gameDto.title,
        userInfo: myInfo,
      });
    }
    socket.on("join-room", ({ userInfo, message }) => {
      console.log(message, userInfo);
      setChatLogs([
        ...chatLogs,
        { sender: "admin", msg: message, time: new Date() },
      ]);
      if (!gameInfo.opponentDto) {
        setGameInfo({ ...gameInfo, opponentDto: { ...userInfo } });
      }
    });

    socket.on("message", ({ username, message }) => {
      console.log(username, message);
      setChatLogs([
        ...chatLogs,
        { sender: username, msg: message, time: new Date() },
      ]);
    });

    socket.on(
      "leave-room",
      ({ message, userInfo }: { message: string; userInfo: UserDto }) => {
        if (userInfo.intra_id === gameInfo.ownerDto.intra_id) {
          navigate("/main/lobby");
        } else if (
          gameInfo.opponentDto &&
          userInfo.intra_id === gameInfo.opponentDto.intra_id
        ) {
          setChatLogs([
            ...chatLogs,
            { sender: "admin", msg: message, time: new Date() },
          ]);
          setGameInfo({ ...gameInfo, opponentDto: null });
        } else {
          setChatLogs([
            ...chatLogs,
            { sender: "admin", msg: message, time: new Date() },
          ]);
          setGameInfo({
            ...gameInfo,
            watchersDto: gameInfo.watchersDto.filter(
              (watcher) => watcher.intra_id !== userInfo.intra_id
            ),
          });
        }
      }
    );
  }, [chatLogs]);
  return (
    <NormalGamePageContainer>
      <GameContainer>
        <h1>일반 게임</h1>
        <h2>{gameInfo.gameDto.title}</h2>
        {!start ? <WaitRoom /> : <GameBox />}
        {/*<PongGame />*/}
      </GameContainer>
      <SubContainer>
        <Options>
          <Button className="active">시작하기</Button>
          <Button className="active" onClick={clickExit}>
            나가기
          </Button>
        </Options>
        <CurrentUserInfo data={usersInfo} />
        <ChatBox
          onSend={onSend}
          onChange={onChange}
          msg={msg}
          height={350}
          data={chatLogs}
          myName={myName}
        />
      </SubContainer>
    </NormalGamePageContainer>
  );
};

const Button = styled.div`
  border-radius: 5px;
  padding: 5px 10px;
  margin: 0 10px;
  &.active {
    border: 1px solid white;
    cursor: pointer;
  }
  &.notActive {
    border: 1px solid var(--gray-color);
    color: var(--gray-color);
    cursor: not-allowed;
  }
`;

const Options = styled.div`
  width: 100%;
  height: 60px;
  background: var(--sub-bg-color);
  border-radius: 10px;
  margin-bottom: 95px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const GameBox = styled.div`
  width: 530px;
  height: 510px;
  background: var(--sub-bg-color);
  border-radius: 20px;
  margin: 0 auto;
`;

const GameContainer = styled.div`
  width: 550px;
  height: 100%;
  margin: 0 25px;
  & > h1,
  h2 {
    margin-left: 30px;
    height: 45px;
    color: white;
  }
`;

const SubContainer = styled.div`
  width: 300px;
  height: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: space-between;
`;

const NormalGamePageContainer = styled.div`
  height: 95%;
  display: flex;
  color: white;
  width: 90%;
`;

export default NormalGamePage;
