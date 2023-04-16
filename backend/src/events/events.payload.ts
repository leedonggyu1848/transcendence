import { UserDto } from 'src/dto/user.dto';

export interface userGamePayload {
  roomName: string;
  type: string;
}

export interface MessagePayload {
  roomName: string;
  userName: string;
  message: string;
}

export interface ChatRoomPayload {
  roomName: string;
  operator: UserDto;
  joinUsers: UserDto[];
  banList: string[];
}
