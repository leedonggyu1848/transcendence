import { Controller, Get, UseGuards } from '@nestjs/common';
import JwtGuard from 'src/auth/jwt/guard/jwtauth.guard';
import { User } from 'src/entity/user.entity';
import { UserDeco } from 'src/decorator/user.decorator';
import { GameService } from './game.service';
import { AuthService } from 'src/auth/auth.service';

@Controller('/game')
export class GameController {
	constructor(
		private authService: AuthService,
		private gameService: GameService,
	) {}

	@Get('/lobby')
	// @UseGuards(JwtGuard)
	async lobby() {
		let games = await this.gameService.getLobbyInfo();
		if (games.length === 0) { // test code => TODO: delete
			const user1 = {
				user_id: 123,
				intra_id: 'asdf'
			};
			const user2 = {
				user_id: 124,
				intra_id: 'qwer'
			}
			await this.authService.addUser(user1);
			await this.authService.addUser(user2);
			let found_user = await this.authService.findUserByIntraId(user1.intra_id);
			this.gameService.createGame({
				title: 'game1',
				interupt_mode: false,
				private_mode: true,
				password: 'asdf',
				playing: false,
				players: [],
				users: [],
			}, found_user);
			found_user = await this.authService.findUserByIntraId(user2.intra_id);
			this.gameService.createGame({
				title: 'game2',
				interupt_mode: true,
				private_mode: false,
				password: '',
				playing: false,
				players: [],
				users: [],
			}, found_user);
			games = await this.gameService.getLobbyInfo();
		}
		return games;
	}
}
