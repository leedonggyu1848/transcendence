import React, { useRef, useEffect, useContext } from "react";
import styled from "@emotion/styled";
import { WebsocketContext } from "../../pages/WrapMainPage";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  alertModalState,
  currentGameInfoState,
  gameCountState,
  gameStartCountState,
  gameStartState,
  isWatcherState,
  joinnedChatState,
  myInfoState,
  myNameState,
  stopFlagState,
} from "../../api/atom";
import { useNavigate } from "react-router-dom";
import GameDetailInfo from "../HistoryPage/GameDetailInfo";

const PongGame = ({
  roomName,
  isOwner,
  hard,
  obstaclePos,
}: {
  roomName: string;
  isOwner: boolean;
  owner: string;
  opponent: string;
  type: string;
  hard: boolean;
  obstaclePos: Array<number>;
}) => {
  const [gameInfo, setGameInfo] = useRecoilState(currentGameInfoState);
  const [currentGame, setCurrentGame] = useRecoilState(currentGameInfoState);
  const [joinChatList, setJoinChatList] = useRecoilState(joinnedChatState);
  const [myInfo, setMyInfo] = useRecoilState(myInfoState);
  const isWatcher = useRecoilValue(isWatcherState);
  const setAlertInfo = useSetRecoilState(alertModalState);
  const myName = useRecoilValue(myNameState);
  const navigate = useNavigate();
  const socket = useContext(WebsocketContext);
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const [start, resetGame] = useRecoilState(gameStartState);
  const [startCount, setStartCount] = useRecoilState(gameStartCountState);
  const [count, setCount] = useRecoilState(gameCountState);
  const paddleWidth = 150;
  const paddleHeight = 20;
  const ballRadius = 10;
  const canvasSize = 500;
  const minAngle = 45;
  const speed = 10; // 공의 속도 조절
  const stopFlag = useRecoilValue(stopFlagState);
  let req;

  const MINE_COLOR = "#4375f4";
  const OTHER_COLOR = "#9c4fff";

  useEffect(() => {
    socket.on(
      "game-result",
      ({
        winner,
        loser,
        type,
      }: {
        winner: string;
        loser: string;
        type: number;
      }) => {
        if (winner === myName) {
          setAlertInfo({
            type: "success",
            header: "Victory!",
            msg: `${loser}님을 이겼습니다!`,
            toggle: true,
          });
        } else if (loser === myName) {
          setAlertInfo({
            type: "failure",
            header: "Defeat!",
            msg: `${winner}님이 이겼습니다...`,
            toggle: true,
          });
        } else {
          setAlertInfo({
            type: "success",
            header: "Victory!",
            msg: `${winner}님이 이겼습니다!`,
            toggle: true,
          });
        }
        setGameInfo({
          ...gameInfo,
          ownerDto: {
            ...gameInfo.ownerDto,
            normalWin:
              winner === gameInfo.ownerDto.userName
                ? gameInfo.ownerDto.normalWin + 1
                : gameInfo.ownerDto.normalWin,
            normalLose:
              loser === gameInfo.ownerDto.userName
                ? gameInfo.ownerDto.normalLose + 1
                : gameInfo.ownerDto.normalLose,
          },
          opponentDto: {
            ...gameInfo.opponentDto,
            normalWin:
              winner === gameInfo.opponentDto.userName
                ? gameInfo.opponentDto.normalWin + 1
                : gameInfo.opponentDto.normalWin,
            normalLose:
              loser === gameInfo.opponentDto.userName
                ? gameInfo.opponentDto.normalLose + 1
                : gameInfo.opponentDto.normalLose,
          },
        });
        if (gameInfo.opponentDto.userName === myName) {
          setMyInfo({
            ...myInfo,
            normalWin:
              winner === myName ? myInfo.normalWin + 1 : myInfo.normalWin,
            normalLose:
              loser === myName ? myInfo.normalLose + 1 : myInfo.normalLose,
          });
        }
        if (gameInfo.gameDto.type) {
          const temp = { ...joinChatList };
          delete temp[currentGame.gameDto.title];
          setJoinChatList(temp);
          setCurrentGame(null);
          navigate("/main/lobby");
        } else {
          setStartCount(false);
          setCount(4);
          resetGame(false);
        }
      }
    );

    const ctx = canvas.current?.getContext("2d");
    if (!ctx) return;
    const myType =
      myName === gameInfo.ownerDto.userName
        ? "owner"
        : myName === gameInfo.opponentDto.userName
        ? "opponent"
        : "watcher";

    const ball = {
      x: canvasSize / 2,
      y: canvasSize / 2,
      dx:
        (Math.random() < 0.5 ? -1 : 1) *
        Math.cos(getRandomAngle(minAngle)) *
        speed,
      dy:
        (Math.random() < 0.5 ? -1 : 1) *
        Math.sin(getRandomAngle(minAngle)) *
        speed,
      radius: ballRadius,
    };

    const obstacleHeight = 10;
    const obstacleWidth = canvasSize * 0.15;

    const leftObstacle = {
      x: obstaclePos[0] * canvasSize,
      y: canvasSize / 2 - obstacleHeight / 2,
      width: obstacleWidth,
      height: obstacleHeight,
    };

    const rightObstacle = {
      x: obstaclePos[1] * canvasSize,
      y: canvasSize / 2 - obstacleHeight / 2,
      width: obstacleWidth,
      height: obstacleHeight,
    };

    const myPaddle = {
      x: canvasSize / 2 - paddleWidth / 2,
      y: canvasSize - paddleHeight - 10,
      width: paddleWidth,
      height: paddleHeight,
    };

    const otherPaddle = {
      x: canvasSize / 2 - paddleWidth / 2,
      y: 10,
      width: paddleWidth,
      height: paddleHeight,
    };

    // ... 기존 코드

    function getRandomAngle(min: number) {
      return (Math.random() * (90 - 2 * min) + min) * (Math.PI / 180);
    }
    let gameState: "playing" | "win" | "lose" = "playing";

    function reflectBall() {
      const myPaddleCollision =
        ball.y + ball.dy > myPaddle.y - ball.radius &&
        ball.x > myPaddle.x - ball.radius &&
        ball.x < myPaddle.x + myPaddle.width + ball.radius;

      const otherPaddleCollision =
        ball.y + ball.dy < otherPaddle.y + otherPaddle.height + ball.radius &&
        ball.x > otherPaddle.x - ball.radius &&
        ball.x < otherPaddle.x + otherPaddle.width + ball.radius;

      if (hard) {
        const leftObstacleCollision =
          ball.y + ball.dy > leftObstacle.y - ball.radius &&
          ball.y + ball.dy <
            leftObstacle.y + leftObstacle.height + ball.radius &&
          ball.x > leftObstacle.x - ball.radius &&
          ball.x < leftObstacle.x + leftObstacle.width + ball.radius;

        const rightObstacleCollision =
          ball.y + ball.dy > rightObstacle.y - ball.radius &&
          ball.y + ball.dy <
            rightObstacle.y + rightObstacle.height + ball.radius &&
          ball.x > rightObstacle.x - ball.radius &&
          ball.x < rightObstacle.x + rightObstacle.width + ball.radius;

        if (leftObstacleCollision || rightObstacleCollision) {
          ball.dy = -ball.dy;
        }
      }

      // 윗 벽에 닿았을 때
      if (ball.y + ball.dy < ball.radius) {
        if (myName === gameInfo.ownerDto.userName) {
          socket.emit("game-result", {
            roomName: gameInfo.gameDto.title,
            winner: gameInfo.ownerDto.userName,
            loser: gameInfo.opponentDto.userName,
            type: gameInfo.gameDto.type,
          });
          socket.emit("end-game", {
            userName: gameInfo.opponentDto.userName,
            roomName: gameInfo.gameDto.title,
          });
        }
        gameState = "win";
        setCount(4);
        setAlertInfo({
          type: "success",
          header: "Victory!",
          msg: `${gameInfo.opponentDto.userName}님을 이겼습니다!`,
          toggle: true,
        });
        if (gameInfo.gameDto.type) {
          const temp = { ...joinChatList };
          delete temp[currentGame.gameDto.title];
          setJoinChatList(temp);
          setCurrentGame(null);
          navigate("/main/lobby");
        } else {
          resetGame(false);
          setGameInfo({
            ...gameInfo,
            ownerDto: {
              ...gameInfo.ownerDto,
              normalWin: gameInfo.ownerDto.normalWin + 1,
            },
            opponentDto: {
              ...gameInfo.opponentDto,
              normalLose: gameInfo.opponentDto.normalLose + 1,
            },
          });
          setMyInfo({
            ...myInfo,
            normalWin: myInfo.normalWin + 1,
          });
        }
      } else if (myPaddleCollision) {
        // 내 패들에 닿았을 때
        const relativeIntersectX = myPaddle.x + myPaddle.width / 2 - ball.x;
        const normalizedIntersectX = relativeIntersectX / (myPaddle.width / 2);
        const bounceAngle = normalizedIntersectX * (Math.PI / 4); // 최대 45도

        ball.dx = -speed * Math.sin(bounceAngle);
        ball.dy = -speed * Math.cos(bounceAngle);
      } else if (otherPaddleCollision) {
        // 상대 패들에 닿았을 때
        const relativeIntersectX =
          otherPaddle.x + otherPaddle.width / 2 - ball.x;
        const normalizedIntersectX =
          relativeIntersectX / (otherPaddle.width / 2);
        const bounceAngle = normalizedIntersectX * (Math.PI / 4); // 최대 45도

        ball.dx = -speed * Math.sin(bounceAngle);
        ball.dy = speed * Math.cos(bounceAngle);
      } else if (ball.y + ball.dy > canvasSize - ball.radius) {
        // 바닥에 닿았을 때
        if (myName === gameInfo.ownerDto.userName) {
          socket.emit("game-result", {
            roomName: gameInfo.gameDto.title,
            winner: gameInfo.opponentDto.userName,
            loser: gameInfo.ownerDto.userName,
            type: gameInfo.gameDto.type,
          });
          socket.emit("end-game", {
            userName: gameInfo.opponentDto.userName,
            roomName: gameInfo.gameDto.title,
          });
        }
        setAlertInfo({
          type: "failure",
          header: "Defeat!",
          msg: `${gameInfo.opponentDto.userName}님이 이겼습니다...`,
          toggle: true,
        });
        gameState = "lose";
        setCount(4);
        if (gameInfo.gameDto.type) {
          const temp = { ...joinChatList };
          delete temp[currentGame.gameDto.title];
          setJoinChatList(temp);
          setCurrentGame(null);
          navigate("/main/lobby");
        } else {
          setGameInfo({
            ...gameInfo,
            ownerDto: {
              ...gameInfo.ownerDto,
              normalLose: gameInfo.ownerDto.normalLose + 1,
            },
            opponentDto: {
              ...gameInfo.opponentDto,
              normalWin: gameInfo.opponentDto.normalWin + 1,
            },
          });
          setMyInfo({
            ...myInfo,
            normalLose: myInfo.normalLose + 1,
          });
          resetGame(false);
        }
      }

      // 좌우 벽에 닿았을 때
      if (
        ball.x + ball.dx < ball.radius ||
        ball.x + ball.dx > canvasSize - ball.radius
      ) {
        ball.dx = -ball.dx;
      }
    }
    // ... 기존 코드

    function drawBall() {
      if (!ctx) return;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI);
      ctx.fillStyle = "white";
      ctx.fill();
      ctx.closePath();
    }

    function drawMyPaddle() {
      if (!ctx) return;
      ctx.beginPath();

      ctx.rect(myPaddle.x, myPaddle.y, myPaddle.width, myPaddle.height);
      ctx.fillStyle = MINE_COLOR;
      ctx.fill();
      ctx.closePath();
    }

    function drawOtherPaddle() {
      if (!ctx) return;
      ctx.beginPath();

      ctx.rect(
        otherPaddle.x,
        otherPaddle.y,
        otherPaddle.width,
        otherPaddle.height
      );
      ctx.fillStyle = OTHER_COLOR;
      ctx.fill();
      ctx.closePath();
    }

    function updateBallPosition() {
      ball.x += ball.dx;
      ball.y += ball.dy;
    }

    function drawObstacles() {
      if (!ctx) return;

      ctx.beginPath();
      ctx.rect(
        leftObstacle.x,
        leftObstacle.y,
        leftObstacle.width,
        leftObstacle.height
      );
      ctx.rect(
        rightObstacle.x,
        rightObstacle.y,
        rightObstacle.width,
        rightObstacle.height
      );
      ctx.fillStyle = "#FFFFFF";
      ctx.fill();
      ctx.closePath();
    }

    function gameLoop() {
      if (stopFlag) return;
      if (gameState !== "playing") return;
      if (!start && !startCount && count === 4) return;
      if (ctx) {
        ctx.clearRect(0, 0, canvasSize, canvasSize);
        drawBall();
        drawMyPaddle();
        drawOtherPaddle();
        if (hard) drawObstacles();
        updateBallPosition();
        reflectBall();
      }
      socket.emit("move-ball", { roomName, x: ball.x, y: ball.y });
      req = requestAnimationFrame(gameLoop);
    }

    function handleMouseMove(event: MouseEvent) {
      const rect = canvas.current?.getBoundingClientRect();
      if (rect) {
        const mouseX = event.clientX - rect.left;
        if (ctx) {
          ctx.clearRect(
            myPaddle.x,
            canvasSize - paddleHeight - 15,
            paddleWidth + 3,
            paddleHeight + 10
          );
          ctx.clearRect(otherPaddle.x, 10, paddleWidth + 3, paddleHeight + 2);
        }
        myPaddle.x = mouseX - myPaddle.width / 2;
        drawMyPaddle();
        drawOtherPaddle();
        socket.emit("mouse-move", {
          roomName,
          x: myPaddle.x,
          type: myType,
        });
      }
    }

    socket.on("mouse-move", ({ x, type }: { x: number; type: string }) => {
      if (ctx) {
        ctx.clearRect(
          myPaddle.x,
          canvasSize - paddleHeight - 15,
          paddleWidth,
          paddleHeight + 10
        );
        ctx.clearRect(otherPaddle.x, 10, paddleWidth, paddleHeight + 2);
      }
      otherPaddle.x = x;
      drawOtherPaddle();
      drawMyPaddle();
    });

    socket.on("move-ball", ({ xPos, yPos }) => {
      if (ctx) {
        ctx.clearRect(0, 0, canvasSize, canvasSize);
        ball.x = xPos;
        ball.y = canvasSize - yPos;
        drawBall();
        drawMyPaddle();
        drawOtherPaddle();
        if (hard) drawObstacles();
      }
    });

    if (gameInfo.gameDto.type === 0) {
      socket.on("normal-game-over", ({ winner }) => {
        if (myName === gameInfo.opponentDto?.userName) {
          setAlertInfo({
            type: winner === myName ? "success" : "failure",
            header: winner === myName ? "Victory!" : "Lose...",
            msg:
              winner === myName
                ? `${gameInfo.ownerDto.userName}님을 이겼습니다!`
                : `${gameInfo.ownerDto.userName}님에게 졌습니다...!`,
            toggle: true,
          });
        } else {
          setAlertInfo({
            type: "success",
            header: "Victory!",
            msg: `${winner}님이 이겼습니다!`,
            toggle: true,
          });
        }
        if (gameInfo.opponentDto) {
          if (winner === gameInfo.ownerDto.userName) {
            setGameInfo({
              ...gameInfo,
              ownerDto: {
                ...gameInfo.ownerDto,
                normalWin: gameInfo.ownerDto.normalWin + 1,
              },
              opponentDto: {
                ...gameInfo.opponentDto,
                normalLose: gameInfo.opponentDto.normalLose + 1,
              },
            });
          } else {
            setGameInfo({
              ...gameInfo,
              ownerDto: {
                ...gameInfo.ownerDto,
                normalLose: gameInfo.ownerDto.normalLose + 1,
              },
              opponentDto: {
                ...gameInfo.opponentDto,
                normalWin: gameInfo.opponentDto.normalWin + 1,
              },
            });
          }
          setCount(4);
          resetGame(false);
        }
      });
    }

    if (myType === "opponent" || myType === "owner")
      canvas.current?.addEventListener("mousemove", handleMouseMove);

    function initGame() {
      if (!ctx) return;
      drawBall();
      drawMyPaddle();
      drawOtherPaddle();
      if (hard) drawObstacles();
    }

    initGame();

    if (isOwner) gameLoop();

    return () => {
      if (myType === "opponent" || myType === "owner")
        canvas.current?.removeEventListener("mousemove", handleMouseMove);
      socket.off("move-ball");
      socket.off("mouse-move");
      socket.off("normal-game-over");
      socket.off("game-result");
      cancelAnimationFrame(req);
    };
  }, [setCount, stopFlag]);

  return (
    <Container>
      <Canvas
        ref={canvas}
        width={canvasSize}
        height={canvasSize}
        isWatcher={isWatcher}
      />
    </Container>
  );
};

const Canvas = styled.canvas<{ isWatcher: boolean }>`
  ${({ isWatcher }) =>
    isWatcher ? "transform : rotate(90deg)" : "transform : rotate(0)"}
`;

const Container = styled.div`
  width: 530px;
  height: 510px;
  background: var(--sub-bg-color);
  border-radius: 20px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default PongGame;
