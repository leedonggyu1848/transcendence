import React, { useRef, useEffect, useContext } from "react";
import styled from "@emotion/styled";
import { WebsocketContext } from "../../api/WebsocketContext";
import { axiosRecordGameResult } from "../../api/request";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { currentNormalGameInfoState, isWatcherState } from "../../api/atom";

const PongGame = ({
  roomName,
  isOwner,
  owner,
  opponent,
  type,
  resetGame,
  setCount,
}: {
  roomName: string;
  isOwner: boolean;
  owner: string;
  opponent: string;
  type: string;
  resetGame: React.Dispatch<React.SetStateAction<boolean>>;
  setCount: React.Dispatch<React.SetStateAction<number>>;
}) => {
  const [gameInfo, setGameInfo] = useRecoilState(currentNormalGameInfoState);
  const isWatcher = useRecoilValue(isWatcherState);

  console.log(isWatcher);
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

      // 윗 벽에 닿았을 때
      if (ball.y + ball.dy < ball.radius) {
        gameState = "win";
        axiosRecordGameResult(owner, opponent, type === "normal" ? 0 : 1).then(
          () => {
            alert("win");
            if (gameInfo.opponentDto) {
              setGameInfo({
                ...gameInfo,
                ownerDto: {
                  ...gameInfo.ownerDto,
                  normal_win: gameInfo.ownerDto.normal_win + 1,
                },
                opponentDto: {
                  ...gameInfo.opponentDto,
                  normal_lose: gameInfo.opponentDto.normal_lose + 1,
                },
              });
            }
            socket.emit("normal-game-over", {
              roomName,
              winner: gameInfo.ownerDto.intra_id,
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
            alert("lose");
            if (gameInfo.opponentDto) {
              setGameInfo({
                ...gameInfo,
                ownerDto: {
                  ...gameInfo.ownerDto,
                  normal_lose: gameInfo.ownerDto.normal_lose + 1,
                },
                opponentDto: {
                  ...gameInfo.opponentDto,
                  normal_win: gameInfo.opponentDto.normal_win + 1,
                },
              });
              socket.emit("normal-game-over", {
                roomName,
                winner: gameInfo.opponentDto.intra_id,
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

    function gameLoop() {
      if (gameState !== "playing") return;
      if (ctx) {
        ctx.clearRect(0, 0, canvasSize, canvasSize);
        drawBall();
        drawMyPaddle();
        drawOtherPaddle();
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
      }
    });

    socket.on("normal-game-over", ({ winner }) => {
      alert(`${winner} 승리!`);
      if (gameInfo.opponentDto) {
        if (winner === gameInfo.ownerDto.intra_id) {
          setGameInfo({
            ...gameInfo,
            ownerDto: {
              ...gameInfo.ownerDto,
              normal_win: gameInfo.ownerDto.normal_win + 1,
            },
            opponentDto: {
              ...gameInfo.opponentDto,
              normal_lose: gameInfo.opponentDto.normal_lose + 1,
            },
          });
        } else {
          setGameInfo({
            ...gameInfo,
            ownerDto: {
              ...gameInfo.ownerDto,
              normal_lose: gameInfo.ownerDto.normal_lose + 1,
            },
            opponentDto: {
              ...gameInfo.opponentDto,
              normal_win: gameInfo.opponentDto.normal_win + 1,
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
      <Canvas ref={canvas} width={canvasSize} height={canvasSize} isWatcher />
    </Container>
  );
};

const Canvas = styled.canvas<{ isWatcher: boolean }>`
  ${({ isWatcher }) => (isWatcher ? "transform : rotateY(90deg)" : "")}
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
