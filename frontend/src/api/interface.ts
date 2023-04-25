export interface UserDto {
  userId: number;
  userName: string;
  profile: string;
  introduce: string;
  normalWin: number;
  normalLose: number;
  rankWin: number;
  rankLose: number;
}

export interface GameDto {
  title: string;
  interruptMode: boolean;
  privateMode: boolean;
  cur: number;
  type?: number;
}

export interface JoinnedUserDto {
  userName: string;
  type?: string;
}

export interface ChatListDto {
  title: string;
  private_mode: boolean;
  cur: number;
}

export interface JoinListDto {
  title: string;
  private_mode: boolean;
  newMessage: number;
}

export interface IGameRoomInfo {
  interruptMode: boolean;
  password: string;
  privateMode: boolean;
  title: string;
}

export interface IGameUserInfo {
  id: number;
  userName: string;
  introduce: string;
  joinType: number;
  normalLose: number;
  normalWin: number;
  profile: string;
  rankLose: number;
  rankWin: number;
  userId: number;
}

export interface ICurrentGame {
  gameDto: GameDto;
  opponentDto: IGameUserInfo | null;
  ownerDto: IGameUserInfo;
  watchersDto: Array<UserDto>;
}

export interface IChatLog {
  sender: string;
  msg: string;
  time: Date;
}

export interface IGameHistory {
  id: number;
  type: number;
  loser: string;
  winner: string;
  time: string;
}

interface IRecord {
  gameType: number;
  id: number;
  loser: string;
  winner: string;
  time: string;
}
export interface ISelectedGameRecord {
  record: IRecord;
  winner: UserDto;
  loser: UserDto;
}

export interface IFriendDto {
  userName: string;
  profile: string;
  status: number;
}

export interface IFriendRequest {
  userName: string;
  profile: string;
  time: string;
  type: number;
}

export interface IChatRoom {
  title: string;
  type: number;
  operator: string;
  count: number;
}

export interface IChatDetail {
  title: string;
  type: number;
  operator: string;
  userList: string[];
  chatLogs: IChatLog[];
  banUsers: string[];
  newMsg: boolean;
  isMuted: boolean;
  muteId: number;
}

export interface IBanUserList {
  [key: string]: string[];
}

export interface IJoinnedChat {
  [key: string]: IChatDetail;
}
