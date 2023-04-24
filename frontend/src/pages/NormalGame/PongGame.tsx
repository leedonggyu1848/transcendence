import React, { useRef, useEffect, useContext } from "react";
import styled from "@emotion/styled";
import { WebsocketContext } from "../../api/WebsocketContext";
import { axiosRecordGameResult } from "../../api/request";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  alertModalState,
  currentGameInfoState,
  isWatcherState,
  myNameState,
} from "../../api/atom";

const PongGame = ({
  roomName,
  isOwner,
  owner,
  opponent,
  type,
  resetGame,
  setCount,
  hard,
  obstaclePos,
}: {
  roomName: string;
  isOwner: boolean;
  owner: string;
  opponent: string;
  type: string;
  resetGame: React.Dispatch<React.SetStateAction<boolean>>;
  setCount: React.Dispatch<React.SetStateAction<number>>;
  hard: boolean;
  obstaclePos: Array<number>;
}) => {
  const [gameInfo, setGameInfo] = useRecoilState(currentGameInfoState);
  const isWatcher = useRecoilValue(isWatcherState);
  const setAlertInfo = useSetRecoilState(alertModalState);
  const myName = useRecoilValue(myNameState);

  const socket = useContext(WebsocketContext);
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const paddleWidth = 150;
  const paddleHeight = 20;
  const ballRadius = 10;
  const canvasSize = 500;
  const minAngle = 45;
  const speed = 5; // 공의 속도 조절

  const MINE_COLOR = "#4375f4";
  const OTHER_COLOR = "#9c4fff";

  useEffect(() => {
    const ctx = canvas.current?.getContext("2d");
    if (!ctx) return;

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
        gameState = "win";
        axiosRecordGameResult(owner, opponent, type === "normal" ? 0 : 1).then(
          () => {
            setAlertInfo({
              type: "success",
              header: "Victory!",
              msg: `${opponent}님을 이겼습니다!`,
              toggle: true,
            });
            if (gameInfo.opponentDto) {
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
            }
            socket.emit("normal-game-over", {
              roomName,
              winner: gameInfo.ownerDto.userName,
            });
            setCount(4);
            resetGame(false);
          }
        );
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
        gameState = "lose";
        axiosRecordGameResult(opponent, owner, type === "normal" ? 0 : 1).then(
          () => {
            setAlertInfo({
              type: "failure",
              header: "Lose...",
              msg: `${opponent}님에게 졌습니다...`,
              toggle: true,
            });
            if (gameInfo.opponentDto) {
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
              socket.emit("normal-game-over", {
                roomName,
                winner: gameInfo.opponentDto.userName,
              });
              setCount(4);
              resetGame(false);
            }
          }
        );
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
      if (gameState !== "playing") return;
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
      requestAnimationFrame(gameLoop);
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
        socket.emit("mouse-move", { roomName, x: myPaddle.x });
      }
    }

    socket.on("mouse-move", ({ x }) => {
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
      canvas.current?.removeEventListener("mousemove", handleMouseMove);
      socket.off("move-ball");
      socket.off("mouse-move");
      socket.off("normal-game-over");
    };
  }, []);

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
