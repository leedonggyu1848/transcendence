import { GameDto } from 'src/dto/game.dto';
import { Game } from 'src/entity/game.entity';
import { Users } from 'src/entity/user.entity';

export interface IGameRepository {
  gameToGameDto(game: Game);
  createByGameDto(gameDto: GameDto, count: number);
  findAll();
  findByTitle(title: string);
  findByTitleWithJoin(title: string);
  findByPlayerWithJoin(player: Users);
  findByWatcherWithJoin(watcher: Users);
  updateCountById(id: number, count: number);
  deleteById(game: Game);
}
