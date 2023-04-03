import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import styled from "@emotion/styled";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import MainPage from "./pages/MainPage";
import { CookiesProvider } from "react-cookie";
import { RecoilRoot } from "recoil";
import NoAuthPage from "./pages/NoAuthPage";
import NotFoundPage from "./pages/NotFoundPage";

const Background = styled.div`
  background-image: url("/src/assets/background.png");
  width: 100vw;
  height: 100vh;
  background-size: 100% 100%;
  position: fixed;
  left: 0;
  top: 0;
  display: flex;
  justify-content: center;
  align-items: center;
`;

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <BrowserRouter>
    <CookiesProvider>
      <RecoilRoot>
        <Background>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/main/*" element={<MainPage />} />
            <Route path="/no_auth" element={<NoAuthPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Background>
      </RecoilRoot>
    </CookiesProvider>
  </BrowserRouter>
);
