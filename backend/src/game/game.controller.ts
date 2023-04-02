import { Controller, Get, UseGuards } from '@nestjs/common';
import JwtGuard from 'src/auth/jwt/guard/jwtauth.guard';

@Controller('/data')
export class DataController {
	@Get('/lobby')
	@UseGuards(JwtGuard)
	lobby() {
	}
}
