import { InjectRepository } from '@nestjs/typeorm';
import { GameDto } from 'src/dto/game.dto';
import { Game } from 'src/entity/game.entity';
import { Users } from 'src/entity/user.entity';
import { Repository } from 'typeorm';
import { IGameRepository } from './game.interface.repository';

export class GameRepository implements IGameRepository {
  constructor(
    @InjectRepository(Game) private gameRepository: Repository<Game>,
  ) {}

  gameToGameDto(game: Game) {
    const gameDto: GameDto = {
      title: game.title,
      interrupt_mode: game.interrupt_mode,
      private_mode: game.private_mode,
      password: game.password,
    };
    return gameDto;
  }

  async createByGameDto(gameDto: GameDto, count: number) {
    const game = this.gameRepository.create({
      title: gameDto.title,
      interrupt_mode: gameDto.interrupt_mode,
      private_mode: gameDto.private_mode,
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

  async findByPlayerWithJoin(player: Users) {
    return await this.gameRepository.findOne({
      where: { players: { id: player.id } },
      relations: ['players', 'watchers'],
    });
  }

  async findByWatcherWithJoin(watcher: Users) {
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
