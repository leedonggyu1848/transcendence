import { atom, selector } from "recoil";

export const myInfoState = atom({
  key: "myInfoState",
  default: {
    name: "yooh",
    image: "",
    normalWin: 1000,
    normalLose: 500,
    rankWin: 17,
    rankLose: 2,
  },
});

export const myNameState = selector({
  key: "myNameState",
  get: ({ get }) => {
    const myInfo = get(myInfoState);
    return myInfo.name;
  },
});
