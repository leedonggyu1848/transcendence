import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { UserDeco } from 'src/decorator/user.decorator';
import { UserSessionDto } from 'src/dto/usersession.dto';
import { AuthService } from './auth.service';
import { PhGuard } from './ft/guard/auth.guard';
import JwtGuard from './jwt/guard/jwtauth.guard';
import { JwtSignGuard } from './jwt/guard/jwtsign.guard';

@Controller('/api/auth')
export class AuthController {
  private logger = new Logger(AuthController.name);
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Get('/login')
  @UseGuards(PhGuard)
  login() {
    this.logger.log('Login');
  }

  @Get('/logincallback')
  @UseGuards(PhGuard, JwtSignGuard)
  async loginCallback(@Res() res: Response, @UserDeco() user: UserSessionDto) {
    this.logger.log(`Login: ${user.intra_id}`);
    await this.authService.addUser(user);
    return res.redirect(`${this.configService.get<string>('frontend_home')}`);
  }

  @Get('/logout')
  @UseGuards(JwtGuard)
  logout(@Res() res: Response, @UserDeco() user: UserSessionDto) {
    this.logger.log(`Logout: ${user.intra_id}`);
    res.clearCookie('access_token');
    res.status(HttpStatus.NO_CONTENT).send();
  }
}
