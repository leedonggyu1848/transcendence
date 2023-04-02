import styled from "@emotion/styled";

const LoginPage = () => {
  const loginURL = "http://localhost:3000/api/auth/login";
  const clickLogin = () => {
    window.location.replace(loginURL);
  };
  return (
    <LoginPageContainer>
      <h1>PH18 PONG</h1>
      <LoginButton onClick={clickLogin}>Log In</LoginButton>
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
  cursor: pointer;
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
