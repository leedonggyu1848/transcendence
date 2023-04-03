import styled from "@emotion/styled";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import Menu from "../components/Menu";
import GamePage from "./GamePage";
import ChatLobby from "./ChatLobby";
import { useCookies } from "react-cookie";
import { useEffect } from "react";
import GameLobbyContainer from "./GameLobby/Con_GameLobby";
import { useRecoilValue } from "recoil";
import { modalBackToggleState, rankWaitModalToggleState } from "../api/atom";
import ModalBackground from "../components/ModalBackground";
import RankWaitModal from "../components/Modals/RankWaitModal";
import NormalGamePage from "./NormalGame/NormalGamePage";
import NotFoundPage from "./NotFoundPage";

const MainPage = () => {
  const [token, setToken] = useCookies(["access_token"]);
  const modalBackToggle = useRecoilValue(modalBackToggleState);
  const rankWaitModalToggle = useRecoilValue(rankWaitModalToggleState);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token.access_token) navigate("/no_auth");
  });
  return (
    token.access_token && (
      <MainPageContainer>
        <Menu />
        <Routes>
          <Route path="lobby" element={<GameLobbyContainer />} />
          <Route path="/game" element={<GamePage />} />
          <Route path="/game/normal" element={<NormalGamePage />} />
          <Route path="/chat" element={<ChatLobby />} />
          <Route path="*" element={<Navigate to="/not_found" />} />
        </Routes>
        {modalBackToggle && <ModalBackground />}
        {rankWaitModalToggle && <RankWaitModal />}
      </MainPageContainer>
    )
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
