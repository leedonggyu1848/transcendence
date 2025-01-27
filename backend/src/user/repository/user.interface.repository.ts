import { Chat } from 'src/entity/chat.entity';
import { Game } from 'src/entity/game.entity';
import { Record } from 'src/entity/record.entity';
import { User } from 'src/entity/user.entity';

export interface IUserRepository {
  createUser(userId: number, email: string);
  findAll();
  findByUserId(userId: number);
  findByUserIdWithJoinGame(userId: number);
  findByUserName(userName: string);
  findByUserNameWithJoinGame(userName: string);
  findByUserNameWithJoinChat(userName: string);
  findByUserNameWithJoinAll(socketId: string);
  findByUserNameWithJoinFriend(userName: string);
  findByUserNameWithJoinBlock(userName: string);
  findByUserNameWithJoinRecord(userName: string);
  findBySocketId(socketId: string);
  findBySocketIdWithJoinGame(socketId: string);
  findBySocketIdWithJoinChat(socketId: string);
  findBySocketIdWithJoinAll(socketId: string);
  findBySocketIdWithJoinFriend(socketId: string);
  findBySocketIdWithJoinBlock(socketId: string);
  findBySocketIdWithJoinRecord(socketId: string);
  updateSocketId(id: number, socketId: string);
  updateUserName(id: number, userName: string);
  updateAuth(id: number, auth: boolean);
  updateOwnGame(id: number, game: Game);
  updatePlayGame(id: number, game: Game);
  updateWatchGame(id: number, game: Game);
  updateGameNone(id: number);
  updateNormalWin(user: User);
  updateNormalLose(user: User);
  updateRankWin(user: User);
  updateRankLose(user: User);
  updateProfileImage(id: number, filename: string);
  updateUserIntroduce(id: number, introduce: string);
  addRecord(user: User, record: Record);
}
