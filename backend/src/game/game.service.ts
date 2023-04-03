import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LobbyDto } from 'src/dto/lobby.dto';
import { GameDto } from 'src/dto/game.dto';
import { Game } from 'src/entity/game.entity';
import { User } from 'src/entity/user.entity';
import { Repository } from 'typeorm';
import { JoinType } from 'src/entity/common.enum';
import { UserDto } from 'src/dto/user.dto';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Game)
    private gameRepository: Repository<Game>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
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

  private userToUserDto(user: User) {
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

  async createGame(gameDto: GameDto, user: User) {
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
      await this.userRepository.update(user.id, {
        join_game: game,
        join_type: JoinType.OWNER,
      });
      return true;
    }
    return false;
  }

  async serviceJoinGame(title: string, password: string, user: User) {
    const game = await this.gameRepository.findOneBy({ title: title });
    if (!game) return { join: false, data: '해당 방이 없습니다.' };
    if (game.private_mode && game.password !== password)
      return { join: false, data: '비밀번호가 맞지 않습니다.' };
    if (game.count == 2)
      return { join: false, data: '해당 방에 자리가 없습니다.' };
    if (user.join_game)
      return { join: false, data: '이미 다른 방에 참가 중 입니다.' };

    await this.gameRepository.update(game.id, { count: game.count + 1 });
    await this.userRepository.update(user.id, {
      join_game: game,
      join_type: JoinType.PLAYER,
    });
    const opponent = await this.userRepository.findOneBy({
      join_game: game,
      join_type: JoinType.OWNER,
    });
    const watchers = await this.userRepository.findBy({
      join_game: game,
      join_type: JoinType.WATCHER,
    });
    const gameDto: GameDto = {
      title: game.title,
      interrupt_mode: game.interrupt_mode,
      private_mode: game.private_mode,
      password: game.password,
    };
    return {
      join: true,
      data: { gameDto, user, opponent, watchers },
    };
  }

  async serviceWatchGame(title: string, password: string, user: User) {
    const game = await this.gameRepository.findOneBy({ title: title });
    if (!game) return { join: false, data: '해당 방이 없습니다.' };
    if (game.private_mode && game.password !== password)
      return { join: false, data: '비밀번호가 맞지 않습니다.' };
    if (user.join_game)
      return { join: false, data: '이미 다른 방에 참가 중 입니다.' };

    await this.userRepository.update(user.id, {
      join_game: game,
      join_type: JoinType.WATCHER,
    });
    const owner = await this.userRepository.findOneBy({
      join_game: game,
      join_type: JoinType.OWNER,
    });
    const player = await this.userRepository.findOneBy({
      join_game: game,
      join_type: JoinType.PLAYER,
    });
    const watchers = await this.userRepository.findBy({
      join_game: game,
      join_type: JoinType.WATCHER,
    });
    const gameDto: GameDto = this.gameToGameDto(game);
    const watchersDto: UserDto[] = watchers.map((element) => {
      return this.userToUserDto(element);
    });
    return {
      join: true,
      data: { gameDto, owner, player, watchersDto },
    };
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
