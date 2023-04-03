import { atom, selector } from "recoil";
import { io, Socket } from "socket.io-client";
import { IChatLog, ICurrentNormalGame } from "./interface";

export const myInfoState = atom({
  key: "myInfoState",
  default: {
    user_id: 15,
    intra_id: "yooh",
    profile: "",
    introduce: "",
    normal_win: 1000,
    normal_lose: 500,
    rank_win: 17,
    rank_lose: 2,
    join_game: null,
  },
});

export const myNameState = selector({
  key: "myNameState",
  get: ({ get }) => {
    const myInfo = get(myInfoState);
    return myInfo.intra_id;
  },
});

export const modalBackToggleState = atom({
  key: "modalBackToggleState",
  default: false,
});

export const rankWaitModalToggleState = atom({
  key: "rankWaitModalToggleState",
  default: false,
});

export const socketState = atom<Socket | null>({
  key: "socketState",
  default: null,
});

export const joinGameModalToggleState = atom({
  key: "joinGameModalToggleState",
  default: false,
});

export const currentNormalGameInfoState = atom<ICurrentNormalGame>({
  key: "currentNormalGameInfoState",
  default: {
    gameDto: {
      interrupt_mode: false,
      password: "",
      private_mode: false,
      title: "",
    },
    opponent: null,
    user: {
      id: 4,
      intra_id: "jpark2",
      introduce: "",
      join_type: 0,
      normal_lose: 0,
      normal_win: 0,
      profile: "",
      rank_lose: 0,
      rank_win: 0,
      user_id: 131546,
    },
    watcher: [],
  },
});

export const chatLogState = atom<IChatLog[]>({
  key: "chatLogState",
  default: [],
});
