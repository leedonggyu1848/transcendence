import React, { useRef, useEffect, useContext } from "react";
import styled from "@emotion/styled";
import { WebsocketContext } from "../../api/WebsocketContext";

interface BallMove {
  ballX: number;
  ballY: number;
}

const PongGame: React.FC = () => {
  const startButton = useRef<HTMLDivElement | null>(null);

  const socket = useContext(WebsocketContext);
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const paddleWidth = 150;
  const paddleHeight = 20;
  const ballRadius = 10;
  const canvasSize = 500;
  const minAngle = 45;
  const speed = 5; // 공의 속도 조절

  const MINE_COLOR = "#568eff";
  const OTHER_COLOR = "#ff4c4c";

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
        alert("win");
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
        alert("lose");
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
      ctx.fillStyle = "black";
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
      socket.emit("move-ball", ball.x, ball.y);
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
            paddleWidth,
            paddleHeight + 10
          );
          ctx.clearRect(otherPaddle.x, 10, paddleWidth, paddleHeight + 2);
        }
        myPaddle.x = mouseX - myPaddle.width / 2;
        drawMyPaddle();
        drawOtherPaddle();
        socket.emit("mousemove", myPaddle.x);
      }
    }

    socket.on("mousemove", (xPos: number) => {
      console.log(xPos);
      if (ctx) {
        ctx.clearRect(
          myPaddle.x,
          canvasSize - paddleHeight - 15,
          paddleWidth,
          paddleHeight + 10
        );
        ctx.clearRect(otherPaddle.x, 10, paddleWidth, paddleHeight + 2);
      }
      otherPaddle.x = xPos;
      drawOtherPaddle();
      drawMyPaddle();
    });

    socket.on("move-ball", ([xPos, yPos]) => {
      if (ctx) {
        console.log(xPos, yPos);
        ctx.clearRect(0, 0, canvasSize, canvasSize);
        ball.x = xPos;
        ball.y = canvasSize - yPos;
        drawBall();
        drawMyPaddle();
        drawOtherPaddle();
      }
    });

    canvas.current?.addEventListener("mousemove", handleMouseMove);
    //gameLoop();

    function initGame() {
      if (!ctx) return;
      drawBall();
      drawMyPaddle();
      drawOtherPaddle();
    }

    initGame();

    // 이 페이지에서만 사용할 시작 이벤트

    const clickStart = () => {
      gameLoop();
    };

    startButton.current?.addEventListener("click", clickStart);

    return () => {
      canvas.current?.removeEventListener("mousemove", handleMouseMove);
      startButton.current?.removeEventListener("click", clickStart);
    };
  }, []);

  return (
    <div>
      <canvas
        style={{ background: "white" }}
        ref={canvas}
        width={canvasSize}
        height={canvasSize}
      />
      <div>
        <Button ref={startButton}>시작</Button>
        <Button>종료</Button>
      </div>
    </div>
  );
};

const Button = styled.div`
  display: inline-block;
  color: white;
  border: 5px solid white;
  width: 150px;
  height: 40px;
  border-radius: 20px;
  line-height: 40px;
  text-align: center;
  font-size: 1.5rem;
  font-family: Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif;
  margin: 40px;
  cursor: pointer;
`;

export default PongGame;
