import styled from "@emotion/styled";
import { useState } from "react";
import { socket } from "./WrapMainPage";

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const loginURL = `${import.meta.env.VITE_FRONT_ADDRESS}/api/auth/login`;
  const clickLogin = () => {
    setLoading(true);
    window.location.replace(loginURL);
  };
  socket.disconnect();
  return (
    <LoginPageContainer>
      <h1>PH18 PONG</h1>
      {loading ? (
        <LoginButton onClick={() => {}}>
          <div className="lds-ellipsis">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </LoginButton>
      ) : (
        <LoginButton onClick={clickLogin}>Log In</LoginButton>
      )}
    </LoginPageContainer>
  );
};

const LoginButton = styled.button`
  outline: none;
  border: none;
  background: var(--blue-color);
  border-radius: 20px;
  color: white;
  width: 250px;
  height: 70px;
  font-size: 1.5rem;
  position: relative;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  & .lds-ellipsis {
    display: inline-block;
    position: relative;
    width: 80px;
    height: 80px;
  }
  & .lds-ellipsis div {
    position: absolute;
    top: 33px;
    width: 13px;
    height: 13px;
    border-radius: 50%;
    background: #fff;
    animation-timing-function: cubic-bezier(0, 1, 1, 0);
  }
  & .lds-ellipsis div:nth-of-type(1) {
    left: 8px;
    animation: lds-ellipsis1 0.6s infinite;
  }
  .lds-ellipsis div:nth-of-type(2) {
    left: 8px;
    animation: lds-ellipsis2 0.6s infinite;
  }
  .lds-ellipsis div:nth-of-type(3) {
    left: 32px;
    animation: lds-ellipsis2 0.6s infinite;
  }
  .lds-ellipsis div:nth-of-type(4) {
    left: 56px;
    animation: lds-ellipsis3 0.6s infinite;
  }
  @keyframes lds-ellipsis1 {
    0% {
      transform: scale(0);
    }
    100% {
      transform: scale(1);
    }
  }
  @keyframes lds-ellipsis3 {
    0% {
      transform: scale(1);
    }
    100% {
      transform: scale(0);
    }
  }
  @keyframes lds-ellipsis2 {
    0% {
      transform: translate(0, 0);
    }
    100% {
      transform: translate(24px, 0);
    }
  }
`;

const LoginPageContainer = styled.div`
  width: 500px;
  height: 500px;
  background: var(--main-bg-color);
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  color: white;
  & > h1 {
    font-size: 2.5rem;
    letter-spacing: 5px;
    margin-bottom: 150px;
  }
`;

export default LoginPage;
