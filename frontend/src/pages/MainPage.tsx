import styled from "@emotion/styled";
import { Route, Routes } from "react-router-dom";
import Menu from "../components/Menu";
import GamePage from "./GamePage";
import LobbyPage from "./LobbyPage";

const MainPage = () => {
  return (
    <MainPageContainer>
      <Menu />
      <Routes>
        <Route path="/game" element={<GamePage />} />
        <Route path="/lobby" element={<LobbyPage />} />
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
