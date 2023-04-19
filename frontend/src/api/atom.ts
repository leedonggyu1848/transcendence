import { atom, DefaultValue, selector } from "recoil";
import { Socket } from "socket.io-client";
import {
  IBanUserList,
  IChatDB,
  IChatLog,
  IChatRoom,
  ICurrentNormalGame,
  IFriendDto,
  IFriendRequest,
  IGameUserInfo,
  IMuteCountList,
  ISelectedGameRecord,
  JoinnedUserDto,
  UserDto,
} from "./interface";

export const myInfoState = atom<UserDto>({
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
  },
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
    watchersDto: [],
  },
});

export const currentNormaGameUsersState = selector<JoinnedUserDto[]>({
  key: "currentNormaGameUsersState",
  get: ({ get }) => {
    const data = get(currentNormalGameInfoState);
    const result = [];
    result.push({ type: "owner", intra_id: data.ownerDto.intra_id });
    if (data.opponentDto)
      result.push({ type: "opponent", intra_id: data.opponentDto.intra_id });
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
    return opponentDto.intra_id === myName ? ownerDto : opponentDto;
  },
});

export const isWatcherState = selector({
  key: "isWatcherState",
  get: ({ get }) => {
    const myName = get(myNameState);
    const gameInfo = get(currentNormalGameInfoState);
    if (
      gameInfo.opponentDto &&
      gameInfo.opponentDto.intra_id !== myName &&
      gameInfo.ownerDto.intra_id !== myName
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
      user_id: -1,
      intra_id: "",
      profile: "",
      introduce: "",
      normal_win: -1,
      normal_lose: -1,
      rank_win: -1,
      rank_lose: -1,
    },
    loser: {
      user_id: -1,
      intra_id: "",
      profile: "",
      introduce: "",
      normal_win: -1,
      normal_lose: -1,
      rank_win: -1,
      rank_lose: -1,
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

export const currentChatState = atom<IChatRoom | null>({
  key: "currentChatState",
  default: null,
});

export const currentChatUserListState = atom<string[]>({
  key: "currentChatUserListState",
  default: [],
});

export const joinnedChatState = atom<IChatRoom[]>({
  key: "joinnedChatState",
  default: [],
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

export const chatDBState = atom<IChatDB>({
  key: "chatDBState",
  default: {},
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
