import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LobbyDto } from 'src/dto/lobby.dto';
import { GameDto } from 'src/dto/game.dto';
import { Game } from 'src/entity/game.entity';
import { Users } from 'src/entity/user.entity';
import { Repository } from 'typeorm';
import { JoinType } from 'src/entity/common.enum';
import { UserDto } from 'src/dto/user.dto';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Game)
    private gameRepository: Repository<Game>,
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
  ) {}

  private gameToGameDto(game: Game) {
    const gameDto: GameDto = {
      title: game.title,
      interrupt_mode: game.interrupt_mode,
      private_mode: game.private_mode,
      password: game.password,
    };
    return gameDto;
  }

  private userToUserDto(user: Users) {
    if (!user) return null;
    const userDto: UserDto = {
      user_id: user.user_id,
      intra_id: user.intra_id,
      profile: user.profile,
      introduce: user.introduce,
      normal_win: user.normal_win,
      normal_lose: user.normal_lose,
      rank_win: user.rank_win,
      rank_lose: user.rank_lose,
    };
    return userDto;
  }

  async getUserInfo(intra_id: string) {
    const found_user = await this.usersRepository.findOneBy({
      intra_id: intra_id,
    });
    return await this.userToUserDto(found_user);
  }

  async getLobbyInfo() {
    const founds = await this.gameRepository.find();
    const games: LobbyDto[] = founds.map(
      ({ title, interrupt_mode, private_mode, count }) => ({
        title,
        interrupt_mode,
        private_mode,
        cur: count,
      }),
    );
    return games;
  }

  async createGame(gameDto: GameDto, user: Users) {
    if (user.join_type !== JoinType.NONE)
      return {
        success: false,
        data: '이미 다른 방에 참여 중입니다.',
      };
    const found = await this.gameRepository.findOneBy({ title: gameDto.title });
    if (!found) {
      const game = this.gameRepository.create({
        title: gameDto.title,
        interrupt_mode: gameDto.interrupt_mode,
        private_mode: gameDto.private_mode,
        password: gameDto.password,
        count: 1,
      });
      await this.gameRepository.save(game);
      await this.usersRepository.update(user.id, {
        join_game: game,
        join_type: JoinType.OWNER,
      });
      return {
        success: true,
        data: { gameDto, user, opponent: null, watchers: null },
      };
    }
    return { success: false, data: '같은 이름의 방이 이미 존재합니다.' };
  }

  async serviceJoinGame(title: string, password: string, user: Users) {
    const game = await this.gameRepository.findOne({
      where: { title: title },
      relations: ['players', 'watchers'],
    });
    if (!game) return { success: false, data: '해당 방이 존재하지 않습니다.' };
    if (game.private_mode && game.password !== password)
      return { success: false, data: '비밀번호가 맞지 않습니다.' };
    if (game.count == 2)
      return { success: false, data: '해당 방에 자리가 없습니다.' };
    if (user.join_game)
      return { success: false, data: '이미 다른 방에 참가 중 입니다.' };

    await this.gameRepository.update(game.id, { count: game.count + 1 });
    await this.usersRepository.update(user.id, {
      join_game: game,
      join_type: JoinType.PLAYER,
    });
    if (!game.players) return { success: false, data: '잘못된 방 입니다.' };
    const owner = game.players.filter(
      (player) => player.join_type === JoinType.OWNER,
    );
    let watchersDto: UserDto[];
    if (game.watchers) {
      const watchers = game.watchers.filter(
        (user) => user.join_type === JoinType.WATCHER,
      );
      watchersDto = watchers.map((element) => this.userToUserDto(element));
    } else watchersDto = null;
    const gameDto: GameDto = {
      title: game.title,
      interrupt_mode: game.interrupt_mode,
      private_mode: game.private_mode,
      password: game.password,
    };
    const ownerDto: UserDto = this.userToUserDto(owner[0]);
    const opponentDto: UserDto = this.userToUserDto(user);
    return {
      success: true,
      data: { gameDto, ownerDto, opponentDto, watchersDto },
    };
  }

  async serviceWatchGame(title: string, password: string, user: Users) {
    const game = await this.gameRepository.findOne({
      where: { title: title },
      relations: ['players', 'watchers'],
    });
    if (!game) return { success: false, data: '해당 방이 존재하지 않습니다.' };
    if (game.private_mode && game.password !== password)
      return { success: false, data: '비밀번호가 맞지 않습니다.' };
    if (user.join_game)
      return { success: false, data: '이미 다른 방에 참가 중 입니다.' };

    await this.usersRepository.update(user.id, {
      join_game: game,
      join_type: JoinType.WATCHER,
    });
    if (!game.players) return { success: false, data: '잘못된 방 입니다.' };
    const owner = game.players.filter(
      (player) => player.join_type === JoinType.OWNER,
    );
    const player = game.players.filter(
      (player) => player.join_type === JoinType.PLAYER,
    );
    let watchersDto: UserDto[];
    if (game.watchers) {
      const watchers = game.watchers.filter(
        (user) => user.join_type === JoinType.WATCHER,
      );
      watchersDto = watchers.map((element) => this.userToUserDto(element));
    } else watchersDto = null;
    if (owner.length >= 2 || player.length >= 2)
      return { success: false, data: '데이터 저장 오류' };
    const gameDto: GameDto = this.gameToGameDto(game);
    const ownerDto: UserDto = this.userToUserDto(owner[0]);
    const opponentDto: UserDto = this.userToUserDto(player[0]);
    return {
      success: true,
      data: { gameDto, ownerDto, opponentDto, watchersDto },
    };
  }

  async flushGame(title: string) {
    const game = await this.gameRepository.findOne({
      where: { title: title },
      relations: ['players', 'watchers'],
    });
    if (!game) return;
    if (game.players) {
      game.players.map((player) =>
        this.usersRepository.update(player.id, {
          join_game: null,
          join_type: JoinType.NONE,
        }),
      );
    }
    if (game.watchers) {
      game.watchers.map((watcher) =>
        this.usersRepository.update(watcher.id, {
          join_game: null,
          join_type: JoinType.NONE,
        }),
      );
    }
    this.gameRepository.delete({ id: game.id });
  }

  async leaveGame(title: string, user: Users) {
    const game = await this.gameRepository.findOne({
      where: { title: title },
      relations: ['players', 'watchers'],
    });
    if (!game) return { success: false, data: '해당 방이 존재하지 않습니다.' };
    if (
      !game.players ||
      !game.players.find((player) => player.intra_id === user.intra_id)
    )
      return { success: false, data: '해당 방에 플레이어가 없습니다.' };
    if (user.join_game.title !== title)
      return { success: false, data: '요청한 방과 다른 방에 참가 중 입니다.' };
  }
}
