import { Inject, Injectable } from '@nestjs/common';
import { LobbyDto } from 'src/dto/lobby.dto';
import { GameDto } from 'src/dto/game.dto';
import { JoinType } from 'src/entity/common.enum';
import { UserDto } from 'src/dto/user.dto';
import { IGameRepository } from './repository/game.interface.repository';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { RecordService } from 'src/record/record.service';

@Injectable()
export class GameService {
  constructor(
    @Inject('IGameRepository')
    private gameRepository: IGameRepository,
    private userService: UserService,
    private recordService: RecordService,
  ) {}

  async getUserInfo(userName: string) {
    const found_user = await this.userService.getUserByUserName(userName);
    return this.userService.userToUserDto(found_user);
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

  async getGamePlayers(title: string) {
    const game = await this.gameRepository.findByTitleWithJoin(title);
    const players = game.players.map((player) => {
      return this.userService.userToUserDto(player);
    });
    return players;
  }

  async createGame(gameDto: GameDto, socketId: string) {
    const user = await this.userService.getUserBySocketIdWithGame(socketId);
    if (user.joinType !== JoinType.NONE)
      return { success: false, msg: '이미 다른 방에 참여 중입니다.' };
    const found = await this.gameRepository.findByTitle(gameDto.title);
    if (found)
      return { success: false, msg: '같은 이름의 방이 이미 존재합니다.' };
    const game = await this.gameRepository.createByGameDto(gameDto, 1);
    await this.userService.updateOwnGame(user, game);
    return {
      success: true,
      data: {
        gameDto,
        ownerDto: this.userService.userToUserDto(user),
        opponentDto: null,
        watchersDto: null,
      },
    };
  }

  async joinGame(title: string, password: string, socketId: string) {
    const user = await this.userService.getUserBySocketIdWithGame(socketId);
    const game = await this.gameRepository.findByTitleWithJoin(title);
    if (!game) return { success: false, data: '해당 방이 존재하지 않습니다.' };
    if (game.privateMode && !(await bcrypt.compare(password, game.password)))
      return { success: false, msg: '비밀번호가 맞지 않습니다.' };
    if (game.count == 2)
      return { success: false, msg: '해당 방에 자리가 없습니다.' };
    if (user.playGame || user.watchGame)
      return { success: false, msg: '이미 다른 방에 참가 중 입니다.' };
    if (!game.players) return { success: false, data: '잘못된 방 입니다.' };
    await this.gameRepository.updateCountById(game.id, game.count + 1);
    await this.userService.updatePlayGame(user, game);
    const owner = game.players.find(
      (player) => player.joinType === JoinType.OWNER,
    );
    const gameDto: GameDto = this.gameRepository.gameToGameDto(game);
    const ownerDto: UserDto = this.userService.userToUserDto(owner);
    const opponentDto: UserDto = this.userService.userToUserDto(user);
    let watchersDto: UserDto[];
    if (game.watchers) {
      const watchers = game.watchers.filter(
        (user) => user.joinType === JoinType.WATCHER,
      );
      watchersDto = watchers.map((element) =>
        this.userService.userToUserDto(element),
      );
    } else watchersDto = null;
    return {
      success: true,
      data: { gameDto, ownerDto, opponentDto, watchersDto },
      user: this.userService.userToUserDto(user),
    };
  }

  async watchGame(title: string, password: string, socketId: string) {
    const user = await this.userService.getUserBySocketIdWithGame(socketId);
    const game = await this.gameRepository.findByTitleWithJoin(title);
    if (!game) return { success: false, msg: '해당 방이 존재하지 않습니다.' };
    if (game.privateMode && !(await bcrypt.compare(password, game.password)))
      return { success: false, msg: '비밀번호가 맞지 않습니다.' };
    if (user.playGame || user.watchGame)
      return { success: false, msg: '이미 다른 방에 참가 중 입니다.' };
    if (!game.players) return { success: false, msg: '잘못된 방 입니다.' };
    await this.userService.updateWatchGame(user, game);
    const owner = game.players.find(
      (player) => player.joinType === JoinType.OWNER,
    );
    const player = game.players.find(
      (player) => player.joinType === JoinType.PLAYER,
    );
    let watchersDto: UserDto[];
    if (game.watchers) {
      watchersDto = game.watchers.map((watcher) =>
        this.userService.userToUserDto(watcher),
      );
    } else watchersDto = null;
    watchersDto.push(this.userService.userToUserDto(user));
    const gameDto: GameDto = this.gameRepository.gameToGameDto(game);
    const ownerDto: UserDto = this.userService.userToUserDto(owner);
    const opponentDto: UserDto = this.userService.userToUserDto(player);
    return {
      success: true,
      data: { gameDto, ownerDto, opponentDto, watchersDto },
      user: this.userService.userToUserDto(user),
    };
  }

  async flushGame(title: string) {
    const game = await this.gameRepository.findByTitleWithJoin(title);
    if (!game) return;
    const result: Array<any> = [];
    if (game.players) {
      const list = game.players.map(async (player) => {
        await this.userService.updateGameNone(player);
      });
      result.push(...list);
    }
    if (game.watchers) {
      const list = game.watchers.map(async (watcher) => {
        await this.userService.updateGameNone(watcher);
      });
      result.push(...list);
    }
    await Promise.all(result).then(() => {
      this.gameRepository.deleteById(game);
    });
  }

  async leaveGame(socketId: string) {
    const user = await this.userService.getUserBySocketIdWithGame(socketId);
    if (!user) return { success: false, msg: '잘못된 유저 정보입니다.' };
    let game = await this.gameRepository.findByPlayerWithJoin(user);
    if (!game) {
      game = await this.gameRepository.findByWatcherWithJoin(user);
      if (!game) return { success: false, msg: '해당 방이 존재하지 않습니다.' };
    }
    if (user.joinType === JoinType.OWNER) {
      await this.flushGame(game.title);
    } else if (user.joinType === JoinType.PLAYER) {
      await this.userService.updateGameNone(user.id);
      await this.gameRepository.updateCountById(game.id, game.count - 1);
    } else if (user.joinType === JoinType.WATCHER) {
      await this.userService.updateGameNone(user.id);
    } else {
      return { success: false, msg: '데이터 저장 오류' };
    }
    return {
      success: true,
      user: this.userService.userToUserDto(user),
      type: user.joinType,
    };
  }

  async getGameHistory(page: number) {
    return await this.recordService.getTotalHistory(page);
  }

  async getGameRecord(id: number) {
    return await this.recordService.getRecordById(id);
  }
}
