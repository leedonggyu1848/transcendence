import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import {
  joinGameModalToggleState,
  modalBackToggleState,
  myNameState,
  rankWaitModalToggleState,
} from "../../api/atom";
import { GameDto } from "../../api/interface";
import {
  axiosCreateGame,
  axiosGetGameList,
  axiosJoinGame,
  axiosPostFlush,
  axiosWatchGame,
} from "../../api/request";
import { WebsocketContext } from "../../api/WebsocketContext";
import GameLobby from "./GameLobby";

const GameLobbyContainer = () => {
  const myName = useRecoilValue(myNameState);
  const setModalBack = useSetRecoilState(modalBackToggleState);
  const setRankWaitModal = useSetRecoilState(rankWaitModalToggleState);
  const setJoinGameModal = useSetRecoilState(joinGameModalToggleState);
  const [gameList, setGameList] = useState<GameDto[]>([]);
  const navigator = useNavigate();
  const socket = useContext(WebsocketContext);
  console.log(socket);

  const clickRankGame = () => {
    setModalBack(true);
    setRankWaitModal(true);
  };

  const clickJoin = (title: string, private_mode: boolean) => {
    if (!private_mode) {
      try {
        axiosJoinGame(title, "");
        navigator("/main/game/normal");
      } catch (e) {
        console.error(e);
        alert("게임 참가 실패!");
      }
      return;
    }
  };

  const clickWatch = () => {
    axiosWatchGame("game2", "");
  };

  const onCreateRoom = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    e.currentTarget.mode.checked = false;
    e.currentTarget.type.checked = false;
    e.currentTarget.roomName.value = "";
    e.currentTarget.password.value = "";
    createNormalGame();
    async function createNormalGame() {
      try {
        console.log("before");
        await axiosCreateGame(
          e.currentTarget.roomName.value || `${myName}의 일반 게임`,
          e.currentTarget.mode.checked,
          e.currentTarget.type.checked,
          e.currentTarget.password.value
        );
        navigator("/main/game/normal");
        console.log("good~!");
      } catch (e) {
        console.error(e);
        alert("게임생성실패");
      }
    }
  };

  useEffect(() => {
    async function getData() {
      const result = await axiosGetGameList();
      setGameList(result);
    }
    getData();
    //socket?.on()
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

function createDummyData(): GameDto[] {
  let list = [];

  for (let i = 0; i < 20; i++) {
    let ran = Math.floor(Math.random() * 2);
    list.push({
      private_mode: ran ? true : false,
      title: `열심히 하겠습니다. 한수 알려주시면 감사하겠습니다 선생님, 당장 옥상으로 올라오시죠 ${
        i + 1
      }`,
      interrupt_mode: ran ? true : false,
      cur: ran ? 1 : 2,
    });
  }
  return list;
}

export default GameLobbyContainer;
