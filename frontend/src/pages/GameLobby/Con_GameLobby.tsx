import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { GameDto } from "../../api/interface";
import {
  axiosCreateGame,
  axiosGetGameList,
  axiosGetMyInfo,
  axiosJoinGame,
  axiosWatchGame,
} from "../../api/request";
import useInitHook from "../../api/useInitHook";
import { WebsocketContext } from "../../api/WebsocketContext";
import GameLobby from "./GameLobby";

const GameLobbyContainer = () => {
  const myName = useRecoilValue(myNameState);
  const setModalBack = useSetRecoilState(modalBackToggleState);
  const setRankWaitModal = useSetRecoilState(rankWaitModalToggleState);
  const setJoinGameModal = useSetRecoilState(joinGameModalToggleState);
  const setBackgroundModal = useSetRecoilState(modalBackToggleState);
  const setNormalJoinType = useSetRecoilState(normalJoinTypeState);
  const setSelectedNormalGameTitle = useSetRecoilState(
    selectedNormalGameTitleState
  );
  const setAlertInfo = useSetRecoilState(alertModalState);
  const socket = useContext(WebsocketContext);

  useInitHook();
  const [myInfo, setMyInfo] = useRecoilState(myInfoState);
  const setCurrentGameInfoState = useSetRecoilState(currentGameInfoState);
  const [gameList, setGameList] = useRecoilState(gameListState);
  const navigator = useNavigate();

  const clickRankGame = () => {
    setModalBack(true);
    setRankWaitModal(true);
  };

  const clickJoin = async (title: string, private_mode: boolean) => {
    if (!private_mode) {
      try {
        const data = await axiosJoinGame(title, "");
        setCurrentGameInfoState({ ...data });
        setNormalJoinType("join");
        navigator("/main/game/normal");
      } catch (e) {
        console.error(e);
        setAlertInfo({
          type: "failure",
          header: "게임 참가 실패",
          msg: "게임 참가에 실패 했습니다...",
          toggle: true,
        });
      }
      return;
    }
    setBackgroundModal(true);
    setJoinGameModal({ toggle: true, type: "join" });
    setSelectedNormalGameTitle(title);
  };

  const clickWatch = async (title: string, private_mode: boolean) => {
    if (!private_mode) {
      try {
        const data = await axiosWatchGame(title, "");
        setCurrentGameInfoState({
          ...data,
        });
        setNormalJoinType("watch");
        navigator("/main/game/normal");
      } catch (e) {
        console.error(e);
        setAlertInfo({
          type: "failure",
          header: "게임 참가 실패",
          msg: "게임 참가에 실패 했습니다...",
          toggle: true,
        });
      }
      return;
    }
    setBackgroundModal(true);
    setJoinGameModal({ toggle: true, type: "watch" });
    setSelectedNormalGameTitle(title);
  };

  const onCreateRoom = async (e: React.FormEvent<HTMLFormElement>) => {
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
      roomName: nameInput.value,
      gameDto: {
        title: nameInput.value || `${myName}의 일반 게임`,
        interruptMode: modeInput.checked,
        privateMode: typeInput.checked,
        password: passwordInput.value,
      },
    });

    //try {
    //  const data = await axiosCreateGame(
    //    nameInput.value || `${myName}의 일반 게임`,
    //    modeInput.checked,
    //    typeInput.checked,
    //    passwordInput.value
    //  );
    //  setCurrentNormalGameInfoState({
    //    gameDto: data.gameDto,
    //    opponentDto: data.opponent,
    //    ownerDto: data.user,
    //    watchersDto: data.watchers ?? [],
    //  });
    //  navigator("/main/game/normal");
    //} catch (e) {
    //  alert("게임생성실패");
    //  console.error(e);
    //}

    nameInput.value = "";
    modeInput.checked = false;
    typeInput.checked = false;
    passwordInput.value = "";
  };

  useEffect(() => {
    async function getData() {}
    getData();
  }, []);

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
