import styled from "@emotion/styled";
import { Route, Routes } from "react-router-dom";
import Menu from "../components/Menu";
import GamePage from "./GamePage";
import ChatLobby from "./ChatLobby";
import { useCookies } from "react-cookie";
import { useEffect } from "react";
import GameLobbyContainer from "./GameLobby/Con_GameLobby";

const MainPage = () => {
  const [token, setToken] = useCookies(["access_token"]);

  useEffect(() => {
    console.log(token);
  });
  return (
    <MainPageContainer>
      <Menu />
      <Routes>
        <Route path="lobby" element={<GameLobbyContainer />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="/chat" element={<ChatLobby />} />
      </Routes>
    </MainPageContainer>
  );
};

const MainPageContainer = styled.div`
  width: 1000px;
  height: 700px;
  background: var(--main-bg-color);
  border-radius: 20px;
  display: flex;
  align-items: center;
`;

export default MainPage;
