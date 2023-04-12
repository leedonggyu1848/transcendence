import { UserDto } from 'src/dto/user.dto';
import { Game } from 'src/entity/game.entity';
import { Users } from 'src/entity/user.entity';

export interface IUserRepository {
  userToUserDto(user: Users);

  createUser(user_id: number, intra_id: string);

  findByIntraId(intra_id: string);

  findByIntraIdWithJoin(intra_id: string);

  updateOwnGameById(id: number, game: Game);

  updatePlayGameById(id: number, game: Game);

  updateWatchGameById(id: number, game: Game);

  updateGameNoneById(id: number);

  updateNormalWin(id: number, win: number);

  updateNormalLose(id: number, lose: number);

  updateRankWin(id: number, win: number);

  updateRankLose(id: number, lose: number);

  updateProfileImage(intra_id: string, filename: string);

  updateUserIntroduce(intra_id: string, filename: string);
}
