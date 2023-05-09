import { Inject, Injectable } from '@nestjs/common';
import { LobbyDto } from 'src/dto/lobby.dto';
import { GameDto } from 'src/dto/game.dto';
import { JoinType } from 'src/entity/common.enum';
import { IGameRepository } from './repository/game.interface.repository';
import { RecordService } from 'src/record/record.service';
import { User } from 'src/entity/user.entity';
import { Game } from 'src/entity/game.entity';
import { UserService } from 'src/user/user.service';
import { IsolationLevel, Transactional } from 'typeorm-transactional';

@Injectable()
export class GameService {
  constructor(
    @Inject('IGameRepository')
    private gameRepository: IGameRepository,
    private userService: UserService,
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

  async getOpponentUser(title: string, userName: string) {
    const game = await this.getGameByTitleWithUsers(title);
    if (!game) throw new Error('맞는 게임 방이 없습니다.');
    if (game.count !== 2) throw new Error('게임 방에 상대방이 없습니다.');
    const opponent = game.players.filter(
      (player) => player.userName !== userName,
    );
    return await this.userService.getUserByUserNameWithGame(
      opponent[0].userName,
    );
  }

  @Transactional({ isolationLevel: IsolationLevel.REPEATABLE_READ })
  async createGame(gameDto: GameDto, user: User) {
    const found = await this.gameRepository.findByTitle(gameDto.title);
    if (found) return null;
    await this.gameRepository.createByGameDto(gameDto, 1);
    const game = await this.gameRepository.findByTitleWithJoin(gameDto.title);
    await this.gameRepository.addPlayer(game, user);
    await this.userService.updateOwnGame(user, game);
    return await this.gameRepository.findByTitle(game.title);
  }

  @Transactional({ isolationLevel: IsolationLevel.REPEATABLE_READ })
  async joinGame(user: User, game: Game) {
    await this.gameRepository.addPlayer(game, user);
    await this.gameRepository.updateCountById(game.id, game.count + 1);
    await this.userService.updatePlayGame(user, game);
  }

  @Transactional({ isolationLevel: IsolationLevel.REPEATABLE_READ })
  async watchGame(user: User, game: Game) {
    await this.gameRepository.addWatcher(game, user);
    await this.userService.updateWatchGame(user, game);
  }

  @Transactional({ isolationLevel: IsolationLevel.REPEATABLE_READ })
  async leaveGame(game: Game, user: User) {
    if (user.joinType === JoinType.OWNER) {
      let tmp = game.players.map(async (player) => {
        await this.userService.updateGameNone(player);
      });
      tmp.push(
        ...game.watchers.map(async (watcher) => {
          await this.userService.updateGameNone(watcher);
        }),
      );
      Promise.all(tmp);
    } else await this.userService.updateGameNone(user);
    if (user.joinType === JoinType.OWNER) {
      await this.gameRepository.deleteById(game);
    } else if (user.joinType === JoinType.PLAYER) {
      await this.gameRepository.subtractPlayer(game, user);
      await this.gameRepository.updateCountById(game.id, game.count - 1);
    } else if (user.joinType === JoinType.WATCHER) {
      await this.gameRepository.subtractWatcher(game, user);
    }
  }
}
