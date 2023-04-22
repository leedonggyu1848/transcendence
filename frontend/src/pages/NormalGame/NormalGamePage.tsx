import styled from "@emotion/styled";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  currentNormaGameUsersState,
  currentNormalGameInfoState,
  joinSocketState,
  myInfoState,
  myNameState,
  normalJoinTypeState,
} from "../../api/atom";
import { IChatLog, UserDto } from "../../api/interface";
import { axiosLeaveNormalGame } from "../../api/request";
import { WebsocketContext } from "../../api/WebsocketContext";
import ChatBox from "../../components/Chat/ChatBox";
import CurrentUserInfo from "../../components/CurrentUserInfo";
import PongGame from "./PongGame";
import WaitRoom from "./WaitRoom";

const NormalGamePage = () => {
  const [startCount, setStartCount] = useState(false);
  const [start, setStart] = useState(false);
  const [gameInfo, setGameInfo] = useRecoilState(currentNormalGameInfoState);
  const usersInfo = useRecoilValue(currentNormaGameUsersState);
  const [chatLogs, setChatLogs] = useState<IChatLog[]>([]);
  const myInfo = useRecoilValue(myInfoState);
  const myName = useRecoilValue(myNameState);
  const socket = useContext(WebsocketContext);
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();
  const [obstaclePos, setObstaclePos] = useState([0, 0]);
  const [normalJoinType, setNormalJoinType] =
    useRecoilState(normalJoinTypeState);
  const [firstJoin, setJoinSocketState] = useRecoilState(joinSocketState);
  const [count, setCount] = useState(4);
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setMsg(e.target.value);

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

  const clickStart = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.currentTarget.classList.contains("notActive")) {
      return;
    }
    if (!gameInfo.opponentDto) {
      return;
    }
    setStartCount(() => true);
    setCount((prev) => prev - 1);
    socket.emit("start-game", gameInfo.gameDto.title);
    if (gameInfo.gameDto.interrupt_mode) {
      const leftPos = Math.floor(Math.random() * 30) / 100;
      const rightPos = (Math.floor(Math.random() * 30) + 50) / 100;
      setObstaclePos([leftPos, rightPos]);
      socket.emit("obstacle-info", {
        roomName: gameInfo.gameDto.title,
        obstaclePos: [leftPos, rightPos],
      });
    }
  };

  const clickExit = async () => {
    try {
      await axiosLeaveNormalGame();
      socket.emit("leave-game", {
        roomName: gameInfo.gameDto.title,
        userInfo: myInfo,
      });
      setJoinSocketState(false);
      navigate("/main/lobby");
    } catch (e) {
      console.error(e);
      alert(e);
    }
  };

  useEffect(() => {
    if (gameInfo.ownerDto.userName === myName) {
      socket.emit("create-game", gameInfo.gameDto.title);
    } else {
      if (!firstJoin) {
        socket.emit("join-game", {
          roomName: gameInfo.gameDto.title,
          userInfo: myInfo,
          type: normalJoinType,
        });
        setJoinSocketState(true);
      }
    }
    socket.on("join-game", ({ userInfo, message, type }) => {
      setChatLogs([
        ...chatLogs,
        { sender: "admin", msg: message, time: new Date() },
      ]);
      if (type === "join") {
        setGameInfo({ ...gameInfo, opponentDto: { ...userInfo } });
      } else {
        setGameInfo({
          ...gameInfo,
          watchersDto: [...gameInfo.watchersDto, userInfo],
        });
      }
    });

    let timer: NodeJS.Timeout | undefined;
    if (count === 0) {
      setStartCount(() => false);
      setStart(() => true);
    }
    if (startCount) {
      timer = setTimeout(() => setCount(count - 1), 1000);
    }

    socket.on(
      "leave-game",
      ({ message, userInfo }: { message: string; userInfo: UserDto }) => {
        if (userInfo.userName === gameInfo.ownerDto.userName) {
          navigate("/main/lobby");
        } else if (
          gameInfo.opponentDto &&
          userInfo.userName === gameInfo.opponentDto.userName
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
              (watcher) => watcher.intra_id !== userInfo.userName
            ),
          });
        }
      }
    );

    socket.on("start-game", () => {
      setStartCount(() => true);
      setCount((prev) => prev - 1);
    });

    socket.on("obstacle-info", ([leftPos, rightPos]: Array<number>) => {
      setObstaclePos([leftPos, rightPos]);
    });

    return () => {
      socket.off("join-game");
      socket.off("message");
      socket.off("leave-game");
      socket.off("start-game");
      socket.off("obstacle-info");
      if (timer) clearInterval(timer);
    };
  }, [chatLogs, startCount, count]);
  return (
    <NormalGamePageContainer>
      <GameContainer>
        <h1>일반 게임</h1>
        <h2>{gameInfo.gameDto.title}</h2>
        {!start && <WaitRoom count={count} />}
        {start && (
          <PongGame
            roomName={gameInfo.gameDto.title}
            isOwner={gameInfo.ownerDto.userName === myName}
            owner={gameInfo.ownerDto.userName}
            opponent={gameInfo.opponentDto?.userName || ""}
            type="normal"
            resetGame={setStart}
            setCount={setCount}
            hard={gameInfo.gameDto.interrupt_mode}
            obstaclePos={obstaclePos}
          />
        )}
      </GameContainer>
      <SubContainer>
        <Options>
          {" "}
          <Button
            className={
              myName === gameInfo.ownerDto.userName ? "active" : "notActive"
            }
            onClick={clickStart}
          >
            시작하기
          </Button>
          <Button className="active" onClick={clickExit}>
            나가기
          </Button>
        </Options>
        <CurrentUserInfo
          data={usersInfo}
          title={gameInfo.gameDto.title}
          operator={false}
          clickOperatorButton={() => {}}
        />
        <ChatBox
          onSend={onSend}
          onChange={onChange}
          msg={msg}
          height={350}
          myName={myName}
          muteCount={0}
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
