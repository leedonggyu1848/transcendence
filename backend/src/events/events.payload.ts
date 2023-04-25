import { ChatType, GameType } from 'src/entity/common.enum';

export interface MessagePayload {
  roomName: string;
  userName: string;
  message: string;
}

export interface CreateChatPayload {
  roomName: string;
  type: ChatType;
  password: string;
}

export interface GameResultPayload {
  roomName: string;
  winner: string;
  loser: string;
  type: GameType;
}
