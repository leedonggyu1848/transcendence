import { Chat } from 'src/entity/chat.entity';
import { Game } from 'src/entity/game.entity';
import { User } from 'src/entity/user.entity';

export interface IUserRepository {
  createUser(userId: number, userName: string);
  findAll();
  findByUserId(userId: number);
  findByUserIdWithJoinGame(userId: number);
  findByUserName(userName: string);
  findByUserNameWithJoinGame(userName: string);
  findByUserNameWithJoinChat(userName: string);
  findByUserNameWithJoinAll(socketId: string);
  findByUserNameWithJoinFriend(userName: string);
  findByUserNameWithJoinBlock(userName: string);
  findBySocketId(socketId: string);
  findBySocketIdWithJoinGame(socketId: string);
  findBySocketIdWithJoinChat(socketId: string);
  findBySocketIdWithJoinAll(socketId: string);
  findBySocketIdWithJoinFriend(socketId: string);
  findBySocketIdWithJoinBlock(socketId: string);
  updateSocketId(id: number, socketId: string);
  updateUserName(id: number, userName: string);
  updateOwnGame(id: number, game: Game);
  updatePlayGame(id: number, game: Game);
  updateWatchGame(id: number, game: Game);
  updateGameNone(id: number);
  updateNormalWin(id: number, win: number);
  updateNormalLose(id: number, lose: number);
  updateRankWin(id: number, win: number);
  updateRankLose(id: number, lose: number);
  updateProfileImage(id: number, filename: string);
  updateUserIntroduce(id: number, introduce: string);
}
