import React from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import {
  modalBackToggleState,
  myNameState,
  rankWaitModalToggleState,
} from "../../api/atom";
import { GameDto } from "../../api/interface";
import GameLobby from "./GameLobby";

const GameLobbyContainer = () => {
  const myName = useRecoilValue(myNameState);
  const setModalBack = useSetRecoilState(modalBackToggleState);
  const setRankWaitModal = useSetRecoilState(rankWaitModalToggleState);

  const clickRankGame = () => {
    setModalBack(true);
    setRankWaitModal(true);
  };

  const onCreateRoom = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(
      e.currentTarget.mode.checked,
      e.currentTarget.type.checked,
      e.currentTarget.roomName.value,
      e.currentTarget.password.value
    );

    e.currentTarget.mode.checked = false;
    e.currentTarget.type.checked = false;
    e.currentTarget.roomName.value = "";
    e.currentTarget.password.value = "";
  };
  return (
    <GameLobby
      data={createDummyData()}
      myName={myName}
      onCreateRoom={onCreateRoom}
      clickRankGame={clickRankGame}
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
