import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LobbyDto } from 'src/dto/lobby.dto';
import { GameDto } from 'src/dto/game.dto';
import { Game } from 'src/entity/game.entity';
import { Users } from 'src/entity/user.entity';
import { getRepository, Repository } from 'typeorm';
import { JoinType } from 'src/entity/common.enum';
import { UserDto } from 'src/dto/user.dto';
import { UserSessionDto } from 'src/dto/usersession.dto';

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
    if (!game) return { success: false, data: '해당 방이 없습니다.' };
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
    const owner = game.players.filter(
      (player) => player.join_type === JoinType.OWNER,
    );
    const watchers = game.watchers.filter(
      (user) => user.join_type === JoinType.WATCHER,
    );
    const gameDto: GameDto = {
      title: game.title,
      interrupt_mode: game.interrupt_mode,
      private_mode: game.private_mode,
      password: game.password,
    };
    const ownerDto: UserDto = this.userToUserDto(owner[0]);
    const opponentDto: UserDto = this.userToUserDto(user);
    const watchersDto: UserDto[] = watchers.map((element) =>
      this.userToUserDto(element),
    );
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
    if (!game) return { success: false, data: '해당 방이 없습니다.' };
    if (game.private_mode && game.password !== password)
      return { success: false, data: '비밀번호가 맞지 않습니다.' };
    if (user.join_game)
      return { success: false, data: '이미 다른 방에 참가 중 입니다.' };

    await this.usersRepository.update(user.id, {
      join_game: game,
      join_type: JoinType.WATCHER,
    });
    const owner = game.players.filter(
      (player) => player.join_type === JoinType.OWNER,
    );
    const player = game.players.filter(
      (player) => player.join_type === JoinType.PLAYER,
    );
    const watchers = game.watchers.filter(
      (user) => user.join_type === JoinType.WATCHER,
    );
    if (owner.length >= 2 || player.length >= 2)
      return { success: false, data: '데이터 저장 오류' };
    const gameDto: GameDto = this.gameToGameDto(game);
    const ownerDto: UserDto = this.userToUserDto(owner[0]);
    const opponentDto: UserDto = this.userToUserDto(player[0]);
    const watchersDto: UserDto[] = watchers.map((element) =>
      this.userToUserDto(element),
    );
    return {
      success: true,
      data: { gameDto, ownerDto, opponentDto, watchersDto },
    };
  }

  async flushGame(title: string) {
    console.log(title);
    const game = await this.gameRepository.findOne({
      where: { title: title },
      relations: ['players', 'watchers'],
    });
    if (!game) return;
    console.log(game);
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

  // async leaveGame(game: GameDto, user: User) {
  // 	const found_user = await this.userRepository.findOneBy({intra_id: user.intra_id});
  // 	if (!found_user)
  // 		return { join: false, data: 'No user has such intra id' };
  // 	if (!found_user.join_game)
  // 		return { join: false, data: `The user does not join any game` };

  // 	const found_game = await this.gameRepository.findOneBy({title: game.title});
  // 	if (!found_game)
  // 		return { join: false, data: 'No game has such title' };
  // }
}
