import { Inject, Injectable } from '@nestjs/common';
import { LobbyDto } from 'src/dto/lobby.dto';
import { GameDto } from 'src/dto/game.dto';
import { JoinType } from 'src/entity/common.enum';
import { IGameRepository } from './repository/game.interface.repository';
import { RecordService } from 'src/record/record.service';
import { User } from 'src/entity/user.entity';
import { Game } from 'src/entity/game.entity';

@Injectable()
export class GameService {
  constructor(
    @Inject('IGameRepository')
    private gameRepository: IGameRepository,
    private recordService: RecordService,
  ) {}

  gameToGameDto(game: Game) {
    const gameDto: GameDto = {
      title: game.title,
      interruptMode: game.interruptMode,
      privateMode: game.privateMode,
      password: game.password,
    };
    return gameDto;
  }

  async getLobbyInfo() {
    const founds = await this.gameRepository.findAll();
    if (!founds) return [];
    const games: LobbyDto[] = founds.map((game) => ({
      title: game.title,
      interruptMode: game.interruptMode,
      privateMode: game.privateMode,
      cur: game.count,
    }));
    return games;
  }

  async getGameByTitle(title: string) {
    return await this.gameRepository.findByTitle(title);
  }

  async getGameByTitleWithUsers(title: string) {
    return await this.gameRepository.findByTitleWithJoin(title);
  }

  async createGame(gameDto: GameDto, user: User) {
    const found = await this.gameRepository.findByTitle(gameDto.title);
    if (found) return null;
    await this.gameRepository.createByGameDto(gameDto, 1);
    const game = await this.gameRepository.findByTitleWithJoin(gameDto.title);
    await this.gameRepository.addPlayer(game, user);
    return await this.gameRepository.findByTitle(game.title);
  }

  async joinGame(user: User, game: Game) {
    await this.gameRepository.addPlayer(game, user);
    await this.gameRepository.updateCountById(game.id, game.count + 1);
  }

  async watchGame(user: User, game: Game) {
    await this.gameRepository.addWatcher(game, user);
  }

  async leaveGame(game: Game, user: User) {
    if (user.joinType === JoinType.OWNER) {
      this.gameRepository.deleteById(game);
    } else if (user.joinType === JoinType.PLAYER) {
      await this.gameRepository.subtractPlayer(game, user);
      await this.gameRepository.updateCountById(game.id, game.count - 1);
    } else if (user.joinType === JoinType.WATCHER) {
      const game = await this.gameRepository.findByWatcherWithJoin(user);
      await this.gameRepository.subtractWatcher(game, user);
    }
  }
}
