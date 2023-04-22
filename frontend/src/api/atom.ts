import { atom, DefaultValue, selector } from "recoil";
import { recoilPersist } from "recoil-persist";
import { Socket } from "socket.io-client";
import {
  IBanUserList,
  IChatLog,
  IChatRoom,
  ICurrentNormalGame,
  IFriendDto,
  IFriendRequest,
  IGameUserInfo,
  IJoinnedChat,
  IMuteCountList,
  ISelectedGameRecord,
  JoinnedUserDto,
  UserDto,
} from "./interface";

const { persistAtom } = recoilPersist();

export const myInfoState = atom<UserDto>({
  key: "myInfoState",
  default: {
    userId: 15,
    userName: "yooh",
    profile: "",
    introduce: "",
    normalWin: 1000,
    normalLose: 500,
    rankWin: 17,
    rankLose: 2,
  },
  effects_UNSTABLE: [persistAtom],
});

export const friendRequestListState = atom<IFriendRequest[]>({
  key: "friendRequestListState",
  default: [],
});

export const myIntroduceState = selector<string>({
  key: "myIntroduceState",
  get: ({ get }) => get(myInfoState).introduce,
  set: ({ get, set }, text) =>
    text instanceof DefaultValue
      ? set(myInfoState, { ...get(myInfoState) })
      : set(myInfoState, { ...get(myInfoState), introduce: text }),
});

export const myNameState = selector({
  key: "myNameState",
  get: ({ get }) => {
    const myInfo = get(myInfoState);
    return myInfo.userName;
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
  default: { toggle: false, type: "" },
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
    opponentDto: null,
    ownerDto: {
      id: 4,
      userName: "jpark2",
      introduce: "",
      joinType: 0,
      normalLose: 0,
      normalWin: 0,
      profile: "",
      rankLose: 0,
      rankWin: 0,
      userId: 131546,
    },
    watchersDto: [],
  },
});

export const currentNormaGameUsersState = selector<JoinnedUserDto[]>({
  key: "currentNormaGameUsersState",
  get: ({ get }) => {
    const data = get(currentNormalGameInfoState);
    const result = [];
    result.push({ type: "owner", intra_id: data.ownerDto.userName });
    if (data.opponentDto)
      result.push({ type: "opponent", intra_id: data.opponentDto.userName });
    data.watchersDto.forEach((person) => {
      result.push({ type: "watcher", intra_id: person.intra_id });
    });
    return result;
  },
});

export const chatLogState = atom<IChatLog[]>({
  key: "chatLogState",
  default: [],
});

export const opponentInfoState = selector<IGameUserInfo | null>({
  key: "opponentInfoState",
  get: ({ get }) => {
    const { opponentDto, ownerDto } = get(currentNormalGameInfoState);
    const myName = get(myNameState);

    if (!opponentDto) return null;
    return opponentDto.userName === myName ? ownerDto : opponentDto;
  },
});

export const isWatcherState = selector({
  key: "isWatcherState",
  get: ({ get }) => {
    const myName = get(myNameState);
    const gameInfo = get(currentNormalGameInfoState);
    if (
      gameInfo.opponentDto &&
      gameInfo.opponentDto.userName !== myName &&
      gameInfo.ownerDto.userName !== myName
    )
      return true;
    return false;
  },
});

export const selectedNormalGameTitleState = atom({
  key: "selectedNormalGameTitleState",
  default: "",
});

export const normalJoinTypeState = atom({
  key: "normalJoinTypeState",
  default: "",
});

export const joinSocketState = atom({
  key: "joinSocketState",
  default: false,
});

export const normalGameRenderingFlagState = atom({
  key: "normalGameRenderingFlagState",
  default: false,
});

export const operatorModalToggleState = atom({
  key: "operatorModalToggleState",
  default: false,
});

export const selectedGameRecord = atom<ISelectedGameRecord>({
  key: "selectedGameRecord",
  default: {
    record: {
      gameType: -1,
      id: -1,
      loser: "",
      winner: "",
      time: "",
    },
    winner: {
      userId: -1,
      userName: "",
      profile: "",
      introduce: "",
      normalWin: -1,
      normalLose: -1,
      rankWin: -1,
      rankLose: -1,
    },
    loser: {
      userId: -1,
      userName: "",
      profile: "",
      introduce: "",
      normalWin: -1,
      normalLose: -1,
      rankWin: -1,
      rankLose: -1,
    },
  },
});

export const alertModalState = atom({
  key: "alertModalState",
  default: {
    type: "success",
    header: "게임 승리",
    msg: "승리하셨습니다",
    toggle: false,
  },
});

export const settingModalState = atom({
  key: "settingModalState",
  default: false,
});

export const getMyProfileInfoState = selector({
  key: "getMyProfileInfoState",
  get: ({ get }) => {
    const myInfo = get(myInfoState);
    return myInfo.profile;
  },
});

export const createChatModalToggleState = atom({
  key: "createChatModalToggleState",
  default: false,
});

export const currentChatState = atom({
  key: "currentChatState",
  default: "",
});

export const currentChatUserListState = atom<string[]>({
  key: "currentChatUserListState",
  default: [],
});

export const joinnedChatState = atom<IJoinnedChat>({
  key: "joinnedChatState",
  default: {},
});

export const chatListState = atom<IChatRoom[]>({
  key: "chatListState",
  default: [],
});

export const allChatFlagState = atom({
  key: "allChatFlagState",
  default: false,
});

export const joinnedChatFlagState = atom({
  key: "joinnedChatFlagState",
  default: false,
});

export const joinChatToggleState = atom({
  key: "joinChatToggleState",
  default: { roomName: "", toggle: false },
});

export const banUserListState = atom<IBanUserList>({
  key: "banUserListState",
  default: {},
});

export const banUserRequestFlagState = atom({
  key: "banUserRequestFlagState",
  default: false,
});

export const requestAlarmListState = atom({
  key: "requestAlarmListState",
  default: false,
});

export const friendListState = atom<IFriendDto[]>({
  key: "friendListState",
  default: [],
});

export const muteCountState = atom<IMuteCountList>({
  key: "muteCountState",
  default: {},
});

export const blockUserListState = atom<Array<string>>({
  key: "blockUserListState",
  default: [],
});

export const requestBlockUserListFlagState = atom({
  key: "requestBlockUserListFlagState",
  default: false,
});

export const requestFriendListFlagState = atom({
  key: "requestFriendListFlagState",
  default: false,
});

export const getMyInfoFlagState = atom({
  key: "getMyInfoFlagState",
  default: false,
});

export const confirmModalToggleState = atom({
  key: "confirmModalToggleState",
  default: {
    toggle: false,
    msg: "",
    confirmFunc: () => {},
  },
});

export const sideMenuToggle = atom({
  key: "sideMenuToggle",
  default: {
    friends: false,
    alarm: false,
  },
});
