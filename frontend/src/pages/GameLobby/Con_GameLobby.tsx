import React, { useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  alertModalState,
  currentGameInfoState,
  gameListState,
  joinGameModalToggleState,
  modalBackToggleState,
  myInfoState,
  myNameState,
  normalJoinTypeState,
  rankWaitModalToggleState,
  selectedNormalGameTitleState,
} from "../../api/atom";
import useInitHook from "../../api/useInitHook";
import { WebsocketContext } from "../../pages/WrapMainPage";
import GameLobby from "./GameLobby";

const GameLobbyContainer = () => {
  const myName = useRecoilValue(myNameState);
  const setModalBack = useSetRecoilState(modalBackToggleState);
  const setRankWaitModal = useSetRecoilState(rankWaitModalToggleState);
  const setJoinGameModal = useSetRecoilState(joinGameModalToggleState);
  const setSelectedNormalGameTitle = useSetRecoilState(
    selectedNormalGameTitleState
  );
  const location = useLocation();
  const setAlertInfo = useSetRecoilState(alertModalState);
  const socket = useContext(WebsocketContext);

  useInitHook();
  const gameList = useRecoilValue(gameListState);

  const clickRankGame = () => {
    setModalBack(true);
    setRankWaitModal(true);
    socket.emit("match-rank");
  };

  const clickJoin = (title: string, private_mode: boolean) => {
    if (private_mode) {
      setJoinGameModal({ toggle: true, type: "join" });
      setSelectedNormalGameTitle(title);
      return;
    }

    socket.emit("join-game", { roomName: title, password: "" });
  };

  const clickWatch = async (title: string, private_mode: boolean) => {
    if (private_mode) {
      setJoinGameModal({ toggle: true, type: "watch" });
      setSelectedNormalGameTitle(title);
      return;
    }

    socket.emit("watch-game", { roomName: title, password: "" });
  };

  const onCreateRoom = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formElement = e.target as HTMLFormElement;
    if (!formElement) return;

    const modeInput = formElement.querySelector<HTMLInputElement>("#mode");
    const typeInput = formElement.querySelector<HTMLInputElement>("#type");
    const nameInput = formElement.querySelector<HTMLInputElement>("#roomName");
    const passwordInput =
      formElement.querySelector<HTMLInputElement>("#password");

    if (!(modeInput && typeInput && nameInput && passwordInput)) return;
    if (typeInput.checked && !passwordInput.value) {
      setAlertInfo({
        type: "failure",
        header: "방 생성 실패",
        msg: "비밀번호를 입력해주세요",
        toggle: true,
      });
      return;
    }

    socket.emit("create-game", {
      roomName: nameInput.value || `${myName}의 일반 게임`,
      gameDto: {
        title: nameInput.value || `${myName}의 일반 게임`,
        interruptMode: modeInput.checked,
        privateMode: typeInput.checked,
        password: passwordInput.value,
      },
    });

    nameInput.value = "";
    modeInput.checked = false;
    typeInput.checked = false;
    passwordInput.value = "";
  };

  return (
    <GameLobby
      data={gameList}
      myName={myName}
      onCreateRoom={onCreateRoom}
      clickRankGame={clickRankGame}
      clickJoin={clickJoin}
      clickWatch={clickWatch}
    />
  );
};

export default GameLobbyContainer;
