import { InjectRepository } from '@nestjs/typeorm';
import { GameDto } from 'src/dto/game.dto';
import { Game } from 'src/entity/game.entity';
import { User } from 'src/entity/user.entity';
import { Repository } from 'typeorm';
import { IGameRepository } from './game.interface.repository';

export class GameRepository implements IGameRepository {
  constructor(
    @InjectRepository(Game) private gameRepository: Repository<Game>,
  ) {}

  async createByGameDto(gameDto: GameDto, count: number) {
    const game = this.gameRepository.create({
      title: gameDto.title,
      interruptMode: gameDto.interruptMode,
      privateMode: gameDto.privateMode,
      password: gameDto.password,
      count: count,
    });
    await this.gameRepository.save(game);
    return game;
  }

  async findAll() {
    return await this.gameRepository.find();
  }

  async findByTitle(title: string) {
    return await this.gameRepository.findOneBy({ title: title });
  }

  async findByTitleWithJoin(title: string) {
    return await this.gameRepository.findOne({
      where: { title: title },
      relations: ['players', 'watchers'],
    });
  }

  async findByPlayerWithJoin(player: User) {
    return await this.gameRepository.findOne({
      where: { players: { id: player.id } },
      relations: ['players', 'watchers'],
    });
  }

  async findByWatcherWithJoin(watcher: User) {
    return await this.gameRepository.findOne({
      where: { watchers: { id: watcher.id } },
      relations: ['players', 'watchers'],
    });
  }

  async updateCountById(id: number, count: number) {
    await this.gameRepository.update(id, { count: count });
  }

  async addPlayer(game: Game, player: User) {
    game.players.push(player);
    await this.gameRepository.save(game);
  }

  async addWatcher(game: Game, watcher: User) {
    game.watchers.push(watcher);
    await this.gameRepository.save(game);
  }

  async subtractPlayer(game: Game, player: User) {
    game.players = game.players.filter((elem) => elem !== player);
    await this.gameRepository.update(game.id, game);
  }

  async subtractWatcher(game: Game, watcher: User) {
    game.watchers = game.watchers.filter((elem) => elem !== watcher);
    await this.gameRepository.update(game.id, game);
  }

  async deleteById(game: Game) {
    await this.gameRepository.remove(game);
  }
}
