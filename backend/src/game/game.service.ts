import { Inject, Injectable } from '@nestjs/common';
import { LobbyDto } from 'src/dto/lobby.dto';
import { GameDto } from 'src/dto/game.dto';
import { Users } from 'src/entity/user.entity';
import { GameType, JoinType } from 'src/entity/common.enum';
import { UserDto } from 'src/dto/user.dto';
import { IGameRepository } from './repository/game.interface.repository';
import { IUserRepository } from '../user/repository/users.interface.repository';
import { IRecordRepository } from './repository/record.interface.repository';
import { randomInt } from 'crypto';

@Injectable()
export class GameService {
  constructor(
    @Inject('IGameRepository')
    private gameRepository: IGameRepository,
    @Inject('IUserRepository')
    private userRepository: IUserRepository,
    @Inject('IRecordRepository')
    private recordRepository: IRecordRepository,
  ) {}

  async getUserInfo(intra_id: string) {
    const found_user = await this.userRepository.findByIntraId(intra_id);
    return this.userRepository.userToUserDto(found_user);
  }

  async getLobbyInfo() {
    const founds = await this.gameRepository.findAll();
    if (!founds) return null;
    const games: LobbyDto[] = founds.map((game) => ({
      title: game.title,
      interrupt_mode: game.interrupt_mode,
      private_mode: game.private_mode,
      cur: game.count,
    }));
    return games;
  }

  async createGame(gameDto: GameDto, user: Users) {
    if (user.join_type !== JoinType.NONE)
      return { success: false, data: '이미 다른 방에 참여 중입니다.' };
    const found = await this.gameRepository.findByTitle(gameDto.title);
    if (found)
      return { success: false, data: '같은 이름의 방이 이미 존재합니다.' };
    const game = await this.gameRepository.createByGameDto(gameDto, 1);
    await this.userRepository.updateOwnGameById(user.id, game);
    return {
      success: true,
      data: { gameDto, user, opponent: null, watchers: null },
    };
  }

  async serviceJoinGame(title: string, password: string, user: Users) {
    const game = await this.gameRepository.findByTitleWithJoin(title);
    if (!game) return { success: false, data: '해당 방이 존재하지 않습니다.' };
    if (game.private_mode && game.password !== password)
      return { success: false, data: '비밀번호가 맞지 않습니다.' };
    if (game.count == 2)
      return { success: false, data: '해당 방에 자리가 없습니다.' };
    if (user.play_game || user.watch_game)
      return { success: false, data: '이미 다른 방에 참가 중 입니다.' };

    await this.gameRepository.updateCountById(game.id, game.count + 1);
    await this.userRepository.updatePlayGameById(user.id, game);
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
        this.userRepository.userToUserDto(element),
      );
    } else watchersDto = null;
    const gameDto: GameDto = this.gameRepository.gameToGameDto(game);
    const ownerDto: UserDto = this.userRepository.userToUserDto(owner);
    const opponentDto: UserDto = this.userRepository.userToUserDto(user);
    return {
      success: true,
      data: { gameDto, ownerDto, opponentDto, watchersDto },
    };
  }

  async serviceWatchGame(title: string, password: string, user: Users) {
    const game = await this.gameRepository.findByTitleWithJoin(title);
    if (!game) return { success: false, data: '해당 방이 존재하지 않습니다.' };
    if (game.private_mode && game.password !== password)
      return { success: false, data: '비밀번호가 맞지 않습니다.' };
    if (user.play_game || user.watch_game)
      return { success: false, data: '이미 다른 방에 참가 중 입니다.' };

    await this.userRepository.updateWatchGameById(user.id, game);
    if (!game.players) return { success: false, data: '잘못된 방 입니다.' };
    const owner = game.players.find(
      (player) => player.join_type === JoinType.OWNER,
    );
    const player = game.players.find(
      (player) => player.join_type === JoinType.PLAYER,
    );
    let watchersDto: UserDto[];
    if (game.watchers) {
      watchersDto = game.watchers.map((watcher) =>
        this.userRepository.userToUserDto(watcher),
      );
    } else watchersDto = null;
    watchersDto.push(this.userRepository.userToUserDto(user));
    const gameDto: GameDto = this.gameRepository.gameToGameDto(game);
    const ownerDto: UserDto = this.userRepository.userToUserDto(owner);
    const opponentDto: UserDto = this.userRepository.userToUserDto(player);
    return {
      success: true,
      data: { gameDto, ownerDto, opponentDto, watchersDto },
    };
  }

  async saveGameResult(winner: Users, loser: Users, type: GameType) {
    if (!winner || !loser)
      return { success: false, data: '유저 이름이 맞지 않습니다.' };
    if (winner.play_game.id !== loser.play_game.id)
      return { success: false, data: '두 사람이 참가 중인 게임이 다릅니다.' };

    if (type == GameType.NORMAL) {
      await this.userRepository.updateNormalWin(winner.id, winner.normal_win);
      await this.userRepository.updateNormalLose(loser.id, loser.normal_lose);
    } else {
      await this.userRepository.updateRankWin(winner.id, winner.rank_win);
      await this.userRepository.updateRankLose(loser.id, loser.rank_lose);
    }
    await this.recordRepository.addRecord(
      type,
      winner.intra_id,
      loser.intra_id,
    );
    return { success: true, data: null };
  }

  async flushGame(title: string) {
    const game = await this.gameRepository.findByTitleWithJoin(title);
    if (!game) return;
    const result: Array<any> = [];
    if (game.players) {
      const list = game.players.map(async (player) => {
        await this.userRepository.updateGameNoneById(player.id);
      });
      result.push(...list);
    }
    if (game.watchers) {
      const list = game.watchers.map(async (watcher) => {
        await this.userRepository.updateGameNoneById(watcher.id);
      });
      result.push(...list);
    }
    await Promise.all(result).then(() => {
      this.gameRepository.deleteById(game.id);
    });
  }

  async serviceLeaveGame(user: Users) {
    if (!user) return { success: false, data: '잘못된 유저 정보입니다.' };
    let game = await this.gameRepository.findByPlayerWithJoin(user);
    if (!game) {
      game = await this.gameRepository.findByWatcherWithJoin(user);
      if (!game)
        return { success: false, data: '해당 방이 존재하지 않습니다.' };
    }

    if (user.join_type === JoinType.OWNER) {
      await this.flushGame(game.title);
    } else if (user.join_type === JoinType.PLAYER) {
      await this.userRepository.updateGameNoneById(user.id);
      await this.gameRepository.updateCountById(game.id, game.count - 1);
    } else if (user.join_type === JoinType.WATCHER) {
      await this.userRepository.updateGameNoneById(user.id);
    } else {
      return { success: false, data: '데이터 저장 오류' };
    }
    return { success: true, data: null };
  }

  async getTotalHistory(page: number) {
    const allRecords = await this.recordRepository.findAll();
    const pageRecords = await this.recordRepository.findPage(page, 10);
    const tmp = pageRecords.map(
      async (record) => await this.recordRepository.recordToRecordDto(record),
    );
    const records = await Promise.all(tmp);
    const recordCount = allRecords.length;
    return { records, recordCount };
  }

  async getRecordById(id: number) {
    const record = await this.recordRepository.findById(id);
    const winner = await this.userRepository.findByIntraId(record.winner);
    const loser = await this.userRepository.findByIntraId(record.loser);
    if (!record || !winner || !loser) return null;
    return { record: record, winner: winner, loser: loser };
  }

  // code for test -> TODO: delete
  async addDummyData() {
    await this.userRepository.createUser(123, 'dummy_user1');
    await this.userRepository.createUser(456, 'dummy_user2');
    const user1 = await this.userRepository.findByIntraId('dummy_user1');
    await this.createGame(
      {
        title: 'game1',
        interrupt_mode: false,
        private_mode: true,
        password: 'asdf',
      },
      user1,
    );
    const user2 = await this.userRepository.findByIntraId('dummy_user2');
    await this.createGame(
      {
        title: 'game2',
        interrupt_mode: true,
        private_mode: false,
        password: '',
      },
      user2,
    );
    return await this.getLobbyInfo();
  }

  // code for test -> TODO: delete
  async addDummyHistory() {
    const user1 = await this.userRepository.createUser(123132, 'dum1');
    const user2 = await this.userRepository.createUser(123133, 'dum2');
    let res = [];
    for (let i = 0; i < 50; i++) {
      let type = randomInt(0, 2);
      let score = randomInt(1, 11);
      if (score >= 5)
        res.push(await this.recordRepository.addRecord(type, 'dum1', 'dum2'));
      else
        res.push(await this.recordRepository.addRecord(type, 'dum2', 'dum1'));
    }
    await Promise.all(res);
  }
}
