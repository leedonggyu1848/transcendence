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

  gameToGameDto(game: Game) {
    const gameDto: GameDto = {
      title: game.title,
      interrupt_mode: game.interruptMode,
      private_mode: game.privateMode,
      password: game.password,
    };
    return gameDto;
  }

  async createByGameDto(gameDto: GameDto, count: number) {
    const game = this.gameRepository.create({
      title: gameDto.title,
      interruptMode: gameDto.interrupt_mode,
      privateMode: gameDto.private_mode,
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

  async deleteById(game: Game) {
    await this.gameRepository.remove(game);
  }
}
