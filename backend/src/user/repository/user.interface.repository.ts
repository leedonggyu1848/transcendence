import { Chat } from 'src/entity/chat.entity';
import { Game } from 'src/entity/game.entity';
import { User } from 'src/entity/user.entity';

export interface IUserRepository {
  createUser(user_id: number, intra_id: string);
  findByIntraId(intra_id: string);
  findByIntraIdWithJoinGame(intra_id: string);
  findByIntraIdWithJoinChat(intra_id: string);
  findByIntraIdWithJoinFriend(intra_id: string);
  findByIntraIdWithJoinBlock(intra_id: string);
  findBySocketId(socket_id: string);
  findBySocketIdWithJoinGame(socket_id: string);
  findBySocketIdWithJoinChat(socket_id: string);
  findBySocketIdWithJoinFriend(socket_id: string);
  findBySocketIdWithJoinBlock(socket_id: string);
  updateSocketId(id: number, socket_id: string);
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
