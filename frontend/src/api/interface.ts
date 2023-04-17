export interface UserDto {
  user_id: number;
  intra_id: string;
  profile: string;
  introduce: string;
  normal_win: number;
  normal_lose: number;
  rank_win: number;
  rank_lose: number;
}

export interface GameDto {
  title: string;
  interrupt_mode: boolean;
  private_mode: boolean;
  cur: number;
}

export interface JoinnedUserDto {
  intra_id: string;
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

interface INormalRoomInfo {
  interrupt_mode: boolean;
  password: string;
  private_mode: boolean;
  title: string;
}

export interface IGameUserInfo {
  id: number;
  intra_id: string;
  introduce: string;
  join_type: number;
  normal_lose: number;
  normal_win: number;
  profile: string;
  rank_lose: number;
  rank_win: number;
  user_id: number;
}

export interface ICurrentNormalGame {
  gameDto: INormalRoomInfo;
  opponentDto: IGameUserInfo | null;
  ownerDto: IGameUserInfo;
  watchersDto: Array<any>;
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
  intra_id: string;
  profile: string;
}

export interface IFriendRequest {
  intra_id: string;
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
