import styled from "@emotion/styled";
import React, { useRef } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import useInitHook from "../api/useInitHook";

const NotFoundPage = () => {
  const [token, setToken] = useCookies(["access_token"]);
  const eyeX = useRef<HTMLDivElement>(null);
  const eyeY = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useInitHook();

  const onClickGoBack = () => navigate(token ? "/main/lobby" : "/");

  const onMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!eyeX.current || !eyeY.current) return;
    const valEyeX =
      eyeX.current?.getBoundingClientRect().left + eyeX.current.clientWidth / 2;
    const valEyeY =
      eyeY.current?.getBoundingClientRect().left + eyeY.current.clientWidth / 2;
    const x = e.clientX,
      y = e.clientY;
    const radian = Math.atan2(x - valEyeX, y - valEyeY);
    //Convert Radians to Degrees
    const rotationDegrees = radian * (180 / Math.PI) * -1 + 180;
    //Rotate the eye
    eyeX.current.style.transform = "rotate(" + rotationDegrees + "deg)";
    eyeY.current.style.transform = "rotate(" + rotationDegrees + "deg)";
  };
  return (
    <NotFoundContainer onMouseMove={onMouseMove}>
      <h1>Not Exist Page!</h1>
      <Minions>
        <Container className="container">
          <EyesWrapper className="eyes-wrapper">
            <Eye ref={eyeX} className="eye">
              <EyeBall className="eyeball"></EyeBall>
            </Eye>
            <Eye ref={eyeY} className="eye">
              <EyeBall className="eyeball"></EyeBall>
            </Eye>
          </EyesWrapper>
          <EyeOuterWrapper />
          <Lips />
        </Container>
      </Minions>
      <Button onClick={onClickGoBack}>Go Back</Button>
    </NotFoundContainer>
  );
};

const Button = styled.div`
  text-decoration: none;
  width: 500px;
  height: 100px;
  background: var(--dark-bg-color);
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 3rem;
  border-radius: 20px;
  margin-top: 50px;
  cursor: pointer;
`;

const EyeOuterWrapper = styled.div`
  width: 100%;
  height: 50px;
  background-color: #231f1e;
  position: absolute;
  left: 0;
  top: 30%;
`;
const Lips = styled.div`
  position: absolute;
  width: 200px;
  height: 70px;
  border-radius: 200px 200px 0 0;
  border: 15px solid black;
  border-bottom: 0;
  bottom: 15%;
`;

const Minions = styled.div`
  width: 500px;
  height: 500px;
  position: relative;
  overflow: hidden;
`;

const EyeBall = styled.div`
  height: 3.2em;
  width: 3.2em;
  background: radial-gradient(#271e1e 35%, #935a29 37%);
  border-radius: 50%;
  margin: 0.2em 3.5em;
  position: relative;
  &::before {
    content: "";
    position: absolute;
    background-color: #ffffff;
    height: 0.7em;
    width: 0.5em;
    border-radius: 50%;
    top: 13px;
    left: 13px;
    transform: rotate(45deg);
  }
`;

const Eye = styled.div`
  width: 10em;
  height: 10em;
  border: 15px solid #a6a4ad;
  background-color: #ffffff;
  border-radius: 50%;
  position: absolute;
  &:first-of-type {
    left: 5%;
  }
  &:last-of-type {
    right: 5%;
  }
  top: -50%;
  z-index: 5;
`;

const EyesWrapper = styled.div`
  position: absolute;
  top: 10%;
  left: calc(50% - 13em);
  top: 25%;
  width: 26em;
  height: 6em;
  z-index: 4;
  background-color: #a8a7ac;
`;

const Container = styled.div`
  background: #f6cd46;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
`;

const NotFoundContainer = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  z-index: 10;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  & > h1 {
    color: white;
    font-size: 5rem;
  }
`;

export default NotFoundPage;
