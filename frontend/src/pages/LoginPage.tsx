import styled from "@emotion/styled";
import { useState } from "react";

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const loginURL = "http://localhost:3000/api/auth/login";
  const clickLogin = () => {
    setLoading(true);
    window.location.replace(loginURL);
  };
  return (
    <LoginPageContainer>
      <h1>PH18 PONG</h1>
      {loading ? (
        <LoginButton onClick={() => {}}>
          <span className="loader" />
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

  & > .loader {
    width: 108px !important;
    height: 16px !important;
    background: radial-gradient(
        circle 8px at 8px center,
        #fff 100%,
        transparent 0
      ),
      radial-gradient(circle 8px at 8px center, #fff 100%, transparent 0);
    background-size: 16px 16px;
    background-repeat: no-repeat;
    position: relative;
    animation: ballX 1s linear infinite;
  }
  & > .loader:before {
    content: "";
    position: absolute;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #fff;
    inset: 0;
    margin: auto;
    animation: moveX 1s cubic-bezier(0.5, 300, 0.5, -300) infinite;
  }
  @keyframes ballX {
    0%,
    25%,
    50%,
    75%,
    100% {
      background-position: 25% 0, 75% 0;
    }
    40% {
      background-position: 25% 0, 85% 0;
    }
    90% {
      background-position: 15% 0, 75% 0;
    }
  }
  @keyframes moveX {
    100% {
      transform: translate(0.15px);
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
