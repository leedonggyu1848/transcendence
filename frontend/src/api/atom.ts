import { atom, DefaultValue, selector } from "recoil";
import { recoilPersist } from "recoil-persist";
import {
  GameDto,
  IBanUserList,
  IChatLog,
  IChatRoom,
  ICombinedRequestAndInvite,
  ICurrentGame,
  IFriendDto,
  IGameUserInfo,
  IJoinnedChat,
  ISelectedGameRecord,
  JoinnedUserDto,
  UserDto,
} from "./interface";

const { persistAtom } = recoilPersist({
  key: "myPersistAtom",
  storage: sessionStorage,
});

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
  //effects_UNSTABLE: [persistAtom],
});

export const friendRequestListState = atom<ICombinedRequestAndInvite[]>({
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

export const gameListState = atom<GameDto[]>({
  key: "gameListState",
  default: [],
});

export const joinGameModalToggleState = atom({
  key: "joinGameModalToggleState",
  default: { toggle: false, type: "" },
});

export const currentGameInfoState = atom<ICurrentGame | null>({
  key: "currentNormalGameInfoState",
  default: null,
  //effects_UNSTABLE: [persistAtom],
});

export const currentGameUsersState = selector<JoinnedUserDto[]>({
  key: "currentNormaGameUsersState",
  get: ({ get }) => {
    const data = get(currentGameInfoState);
    if (!data) return [];
    const result = [];
    result.push({ type: "owner", userName: data.ownerDto.userName });
    if (data.opponentDto)
      result.push({ type: "opponent", userName: data.opponentDto.userName });
    data.watchersDto.forEach((person) => {
      result.push({ type: "watcher", userName: person.userName });
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
    const { opponentDto, ownerDto } = get(currentGameInfoState);
    const myName = get(myNameState);

    if (!opponentDto) return null;
    return opponentDto.userName === myName ? ownerDto : opponentDto;
  },
});

export const isWatcherState = selector({
  key: "isWatcherState",
  get: ({ get }) => {
    const myName = get(myNameState);
    const gameInfo = get(currentGameInfoState);
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

export const ownerModalToggleState = atom({
  key: "ownerModalToggleState",
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
  //effects_UNSTABLE: [persistAtom],
});

export const currentChatUserListState = atom<string[]>({
  key: "currentChatUserListState",
  default: [],
});

export const joinnedChatState = atom<IJoinnedChat>({
  key: "joinnedChatState",
  default: {},
  //effects_UNSTABLE: [persistAtom],
});

export const chatListState = atom<IChatRoom[]>({
  key: "chatListState",
  default: [],
  //effects_UNSTABLE: [persistAtom],
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

export const inviteModalToggleState = atom({
  key: "inviteModalToggle",
  default: {
    type: "",
    toggle: false,
  },
});

export const profileModalState = atom<{
  toggle: boolean;
  user: UserDto | null;
}>({
  key: "profileModalState",
  default: {
    toggle: false,
    user: null,
  },
});

export const gameStartState = atom({
  key: "gameStartState",
  default: false,
});

export const gameStartCountState = atom({
  key: "gameStartCountState",
  default: false,
});

export const gameCountState = atom({
  key: "gameCountState",
  default: 4,
});

export const rankGameFlagState = atom({
  key: "rankGameFlagState",
  default: false,
});

export const stopFlagState = atom({
  key: "stopFlagState",
  default: false,
});

export const SetNameModalToggle = atom({
  key: "setNameModalToggle",
  default: true,
});
