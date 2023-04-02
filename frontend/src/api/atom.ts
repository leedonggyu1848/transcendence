import { atom, selector } from "recoil";

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

export const currentNormalGameInfoState = atom({
  key: "currentNormalGameInfoState",
  default: {},
});
