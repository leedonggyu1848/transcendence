import { Inject, Injectable } from '@nestjs/common';
import { LobbyDto } from 'src/dto/lobby.dto';
import { GameDto } from 'src/dto/game.dto';
import { User } from 'src/entity/user.entity';
import { GameType, JoinType } from 'src/entity/common.enum';
import { UserDto } from 'src/dto/user.dto';
import { IGameRepository } from './repository/game.interface.repository';
import { IUserRepository } from '../user/repository/user.interface.repository';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class GameService {
  constructor(
    @Inject('IGameRepository')
    private gameRepository: IGameRepository,
    @Inject('IUserRepository')
    private userRepository: IUserRepository,
    private userService: UserService,
  ) {}

  async getUserInfo(userName: string) {
    const found_user = await this.userRepository.findByUserName(userName);
    return this.userService.userToUserDto(found_user);
  }

  async getLobbyInfo() {
    const founds = await this.gameRepository.findAll();
    if (!founds) return null;
    const games: LobbyDto[] = founds.map((game) => ({
      title: game.title,
      interruptMode: game.interrupt_mode,
      privateMode: game.private_mode,
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
    await this.userRepository.updateOwnGame(user.id, game);
    return {
      success: true,
      data: {
        gameDto,
        owner: this.userService.userToUserDto(user),
        opponent: null,
        watchers: null,
      },
    };
  }

  async joinGame(title: string, password: string, socketId: string) {
    const user = await this.userService.getUserBySocketIdWithGame(socketId);
    const game = await this.gameRepository.findByTitleWithJoin(title);
    if (!game) return { success: false, data: '해당 방이 존재하지 않습니다.' };
    if (game.private_mode && !(await bcrypt.compare(password, game.password)))
      return { success: false, msg: '비밀번호가 맞지 않습니다.' };
    if (game.count == 2)
      return { success: false, msg: '해당 방에 자리가 없습니다.' };
    if (user.playGame || user.watchGame)
      return { success: false, msg: '이미 다른 방에 참가 중 입니다.' };
    await this.gameRepository.updateCountById(game.id, game.count + 1);
    await this.userRepository.updatePlayGame(user.id, game);
    if (!game.players) return { success: false, data: '잘못된 방 입니다.' };
    const owner = game.players.find(
      (player) => player.join_type === JoinType.OWNER,
    );
    let watchersDto: UserDto[];
    if (game.watchers) {
      const watchers = game.watchers.filter(
        (user) => user.join_type === JoinType.WATCHER,
      );
      watchersDto = watchers.map((element) =>
        this.userService.userToUserDto(element),
      );
    } else watchersDto = null;
    const gameDto: GameDto = this.gameRepository.gameToGameDto(game);
    const ownerDto: UserDto = this.userService.userToUserDto(owner);
    const opponentDto: UserDto = this.userService.userToUserDto(user);
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
    if (game.private_mode && !(await bcrypt.compare(password, game.password)))
      return { success: false, msg: '비밀번호가 맞지 않습니다.' };
    if (user.playGame || user.watchGame)
      return { success: false, msg: '이미 다른 방에 참가 중 입니다.' };
    await this.userRepository.updateWatchGame(user.id, game);
    if (!game.players) return { success: false, msg: '잘못된 방 입니다.' };
    const owner = game.players.find(
      (player) => player.join_type === JoinType.OWNER,
    );
    const player = game.players.find(
      (player) => player.join_type === JoinType.PLAYER,
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
        await this.userRepository.updateGameNone(player.id);
      });
      result.push(...list);
    }
    if (game.watchers) {
      const list = game.watchers.map(async (watcher) => {
        await this.userRepository.updateGameNone(watcher.id);
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
      await this.userRepository.updateGameNone(user.id);
      await this.gameRepository.updateCountById(game.id, game.count - 1);
    } else if (user.joinType === JoinType.WATCHER) {
      await this.userRepository.updateGameNone(user.id);
    } else {
      return { success: false, msg: '데이터 저장 오류' };
    }
    return {
      success: true,
      user: this.userService.userToUserDto(user),
      type: user.joinType,
    };
  }

  // code for test -> TODO: delete
  async addDummyData() {
    await this.userRepository.createUser(123, 'dummy_user1', '123');
    await this.userRepository.createUser(456, 'dummy_user2', '123');
    const user1 = await this.userRepository.findByUserName('dummy_user1');
    await this.createGame(
      {
        title: 'game1',
        interruptMode: false,
        privateMode: true,
        password: 'asdf',
      },
      user1,
    );
    const user2 = await this.userRepository.findByUserName('dummy_user2');
    await this.createGame(
      {
        title: 'game2',
        interruptMode: true,
        privateMode: false,
        password: '',
      },
      user2,
    );
    return await this.getLobbyInfo();
  }
}
