import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Logger,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { UserDeco } from 'src/decorator/user.decorator';
import { UserSessionDto } from 'src/dto/usersession.dto';
import { UserService } from './user.service';
import { PhGuard } from './ft/guard/auth.guard';
import JwtGuard from './jwt/guard/jwtauth.guard';
import { JwtSignGuard } from './jwt/guard/jwtsign.guard';
import TwoFactorGuard from './jwt/guard/twofactor.guard';

@Controller('/api/auth')
export class UserController {
  private logger = new Logger(UserController.name);
  constructor(
    private authService: UserService,
    private configService: ConfigService,
  ) {}

  @Get('/login')
  @UseGuards(PhGuard)
  login() {
    this.logger.log('[Login]');
  }

  @Get('/logincallback')
  @UseGuards(PhGuard, JwtSignGuard)
  async loginCallback(
    @Res() res: Response,
    @UserDeco() userSession: UserSessionDto,
  ) {
    this.logger.log(`[LoginCallback] ${userSession.intraId}`);
    const user = await this.authService.addUserFromSession(userSession);
    if (!user.auth) await this.authService.sendAuthMail(user);
    const url = user.auth ? 'frontend.home' : 'frontend.auth';
    const request = user.auth ? `` : `?request=${user.email}`;
    return res.redirect(`${this.configService.get<string>(url)}` + request);
  }

  @Post('/two-factor')
  @UseGuards(JwtGuard)
  async twoFactorAuth(
    @Res() res: Response,
    @UserDeco() userSession: UserSessionDto,
    @Body('code') code: string,
  ) {
    this.logger.log(`[TwoFactorAuth] ${userSession.intraId} ${code}`);
    const result = await this.authService.checkAuthCode(userSession, code);
    res.status(HttpStatus.OK).send(result);
  }

  @Get('/logout')
  @UseGuards(TwoFactorGuard)
  logout(@Res() res: Response, @UserDeco() userSessionDto: UserSessionDto) {
    this.logger.log(`[Logout] ${userSessionDto.intraId}`);
    res.clearCookie('access_token');
    res
      .status(HttpStatus.NO_CONTENT)
      .redirect(this.configService.get<string>('cors.origin'));
  }

  @Get('/userinfo')
  @UseGuards(TwoFactorGuard)
  async getMyInfo(
    @Res() res: Response,
    @UserDeco() userSessionDto: UserSessionDto,
  ) {
    this.logger.log(`[GetMyInfo] ${userSessionDto.intraId}`);
    const data = await this.authService.getUserDtoByUserId(
      userSessionDto.userId,
    );
    res.status(HttpStatus.OK).send(data);
  }

  @Get('/userinfo/:userName')
  @UseGuards(TwoFactorGuard)
  async getUserInfo(@Res() res: Response, @Param('userName') userName: string) {
    this.logger.log(`[GetUserInfo] ${userName}`);
    const data = await this.authService.getUserDtoByUserName(userName);
    res.status(HttpStatus.OK).send(data);
  }

  @Post('/user/introduce')
  @UseGuards(TwoFactorGuard)
  async updateIntroduce(
    @Res() res: Response,
    @UserDeco() userSessionDto: UserSessionDto,
    @Body('introduce') introduce: string,
  ) {
    this.logger.log(
      `[UpdateIntroduce] ${userSessionDto.intraId}, ${introduce}`,
    );
    await this.authService.updateUserIntroduce(userSessionDto, introduce);
    const result = await this.authService.getUserByUserName(
      userSessionDto.intraId,
    );
    res.status(HttpStatus.OK).send(result);
  }
}
