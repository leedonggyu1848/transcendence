import styled from "@emotion/styled";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  currentGameUsersState,
  currentGameInfoState,
  joinSocketState,
  myInfoState,
  myNameState,
  normalJoinTypeState,
  currentChatState,
  joinnedChatState,
  gameListState,
} from "../../api/atom";
import { WebsocketContext } from "../../api/WebsocketContext";
import ChatBox from "../../components/Chat/ChatBox";
import CurrentUserInfo from "../../components/CurrentUserInfo";
import PongGame from "./PongGame";
import WaitRoom from "./WaitRoom";

const GamePage = () => {
  const [startCount, setStartCount] = useState(false);
  const [start, setStart] = useState(false);
  const [gameInfo, setGameInfo] = useRecoilState(currentGameInfoState);
  const usersInfo = useRecoilValue(currentGameUsersState);
  const myInfo = useRecoilValue(myInfoState);
  const myName = useRecoilValue(myNameState);
  const socket = useContext(WebsocketContext);
  const [msg, setMsg] = useState("");
  const [obstaclePos, setObstaclePos] = useState([0, 0]);
  const [joinnedChatList, setJoinnedChatList] =
    useRecoilState(joinnedChatState);
  const currentChat = useRecoilValue(currentChatState);
  const [count, setCount] = useState(4);
  const gameList = useRecoilValue(gameListState);
  const [rankGameFlag, setRankGameFlag] = useState(false);
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setMsg(e.target.value);

  const onSend = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && msg) {
      setJoinnedChatList({
        ...joinnedChatList,
        [currentChat]: {
          ...joinnedChatList[currentChat],
          chatLogs: [
            ...joinnedChatList[currentChat].chatLogs,
            {
              sender: myName,
              msg,
              time: new Date(),
            },
          ],
        },
      });
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
    if (gameInfo.gameDto.interruptMode) {
      const leftPos = Math.floor(Math.random() * 30) / 100;
      const rightPos = (Math.floor(Math.random() * 30) + 50) / 100;
      setObstaclePos([leftPos, rightPos]);
      socket.emit("obstacle-info", {
        roomName: gameInfo.gameDto.title,
        obstaclePos: [leftPos, rightPos],
      });
    }
  };

  const handleExit = () => {
    socket.emit("leave-game", gameInfo.gameDto.title);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (count === 0) {
      setStartCount(() => false);
      setStart(() => true);
    }
    if (startCount) {
      timer = setTimeout(() => setCount(count - 1), 1000);
    }
    if (!rankGameFlag && gameInfo && gameInfo.gameDto.type) {
      setRankGameFlag(true);
      setStartCount(() => true);
      setCount((prev) => prev - 1);
      //if (gameInfo.ownerDto.userName === myName)
      //  socket.emit("start-game", gameInfo.gameDto.title);
    }

    socket.on("start-game", () => {
      setStartCount(() => true);
      setCount((prev) => prev - 1);
    });

    socket.on("obstacle-info", ([leftPos, rightPos]: Array<number>) => {
      setObstaclePos([leftPos, rightPos]);
    });

    window.addEventListener("beforeunload", handleExit);

    return () => {
      socket.off("start-game");
      socket.off("obstacle-info");
      if (timer) clearInterval(timer);
      window.removeEventListener("beforeunload", handleExit);
    };
  }, [gameList, startCount, count]);
  return (
    gameInfo && (
      <GamePageContainer>
        <GameContainer>
          <h1>{gameInfo.gameDto.type ? "랭크 게임" : "일반 게임"}</h1>
          <h2>{gameInfo && gameInfo.gameDto.title}</h2>
          {!start && <WaitRoom count={count} />}
          {start && (
            <PongGame
              roomName={gameInfo && gameInfo.gameDto.title}
              isOwner={gameInfo.ownerDto.userName === myName}
              owner={gameInfo.ownerDto.userName}
              opponent={gameInfo.opponentDto?.userName || ""}
              type="normal"
              resetGame={setStart}
              setCount={setCount}
              hard={gameInfo.gameDto.interruptMode}
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
            <Button className="active" onClick={handleExit}>
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
          />
        </SubContainer>
      </GamePageContainer>
    )
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

const GamePageContainer = styled.div`
  height: 95%;
  display: flex;
  color: white;
  width: 90%;
`;

export default GamePage;
