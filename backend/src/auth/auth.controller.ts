import { Controller, Get, HttpCode, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { User } from 'src/decorator/user.decorator';
import { UserSessionDto } from 'src/dto/usersession.dto';
import { AuthService } from './auth.service';
import { PhGuard } from './ft/guard/auth.guard';
import JwtGuard from './jwt/guard/jwtauth.guard';
import { JwtSignGuard } from './jwt/guard/jwtsign.guard';

@Controller('/api/auth')
export class AuthController {
	constructor(
		private authService: AuthService,
		private configService: ConfigService,
	) {}

	@Get('/login')
	@UseGuards(PhGuard)
	login() {
		console.log('login');
	}

	@Get('/logincallback')
	@UseGuards(PhGuard, JwtSignGuard)
	async loginCallback(@Res() res: Response, @User() user: UserSessionDto) {
		console.log(user.intra_id, 'login');
		await this.authService.addUser(user);
		return res.redirect(`${this.configService.get<string>('frontend_home')}`);
	}

	@Get('/logout')
	@UseGuards(JwtGuard)
	@HttpCode(204)
	logout(@Res() res: Response, @User() user: UserSessionDto) {
		console.log(user.intra_id, 'logout');
		res.clearCookie('access_token');
		res.send();
	}
}
