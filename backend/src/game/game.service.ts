import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LobbyDto } from 'src/dto/lobby.dto';
import { GameDto } from 'src/dto/game.dto';
import { Game } from 'src/entity/game.entity';
import { User } from 'src/entity/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Game)
    private gameRepository: Repository<Game>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

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
      await this.userRepository.update(user.id, { join_game: game });
      return true;
    }
    return false;
  }

  // async joinGame(game: GameDto, user: User) {
  // 	const found_game = await this.gameRepository.findOneBy({title: game.title});
  // 	if (!found_game)
  // 		return { join: false, data: 'No game has such title' };
  // 	if (found_game.private_mode && found_game.password !== game.password)
  // 		return { join: false, data: 'Password mismatch' };
  // 	if (found_game.playing)
  // 		return { join: false, data: 'The game is playing' };
  // 	if (user.join_game)
  // 		return { join: false, data: 'The user has already joined a game' };

  // 	const users = found_game.users;
  // 	const players = found_game.players;
  // 	if (players.length === 2) {
  // 		users.push(user);
  // 		this.gameRepository.update(found_game.id, {users: users});
  // 	}
  // 	else {
  // 		players.push(user);
  // 		this.gameRepository.update(found_game.id, {players: players});
  // 	}
  // 	this.userRepository.update(user.id, {join_game: found_game});
  // 	return {
  // 		join: true,
  // 		data: {
  // 			title: found_game.title,
  // 			interrupt_mode: found_game.interrupt_mode,
  // 			private_mode: found_game.private_mode,
  // 			password: found_game.password,
  // 			playing: found_game.playing,
  // 			players: players,
  // 			users: users
  // 		}
  // 	};
  // }

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
