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
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserDto } from 'src/dto/user.dto';

@ApiTags('Auth')
@Controller('/api/auth')
export class UserController {
  private logger = new Logger(UserController.name);
  constructor(
    private authService: UserService,
    private configService: ConfigService,
  ) {}

  @ApiOperation({
    summary: '로그인',
    description: '로그인을 합니다',
  })
  @Get('/login')
  @UseGuards(PhGuard)
  login() {
    this.logger.log('[Login]');
  }

  @ApiOperation({
    summary: 'Oauth',
    description: 'Oauth를 위한 callback url입니다',
  })
  @ApiResponse({
    status: 302,
    description: '로그인 성공 url으로 리다이렉트 합니다',
  })
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

  @ApiOperation({
    summary: '메일 인증',
    description:
      '2번째 인증을 위한 url입니다. 메일 인증의 성공 여부를 반환합니다.',
  })
  @ApiOkResponse({
    type: Boolean,
    description: '유저의 인증이 성공했는지 실패했는지 정보를 반환합니다.',
  })
  @ApiUnauthorizedResponse({
    description: '인증 정보가 올바르지 않습니다.',
  })
  @ApiBody({
    schema: {
      properties: {
        code: { type: 'string', description: '2차 인증 코드' },
      },
    },
  })
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

  @ApiOperation({
    summary: '로그아웃',
    description: '로그아웃을 위해 쿠키의 access token을 지웁니다.',
  })
  @Get('/logout')
  @UseGuards(TwoFactorGuard)
  logout(@Res() res: Response, @UserDeco() userSessionDto: UserSessionDto) {
    this.logger.log(`[Logout] ${userSessionDto.intraId}`);
    res.clearCookie('access_token');
    res.status(HttpStatus.NO_CONTENT).send();
  }

  @ApiOperation({
    summary: '유저 정보',
    description: '유저가 로그인이 되어있다면 유저 정보를 가져옵니다.',
  })
  @ApiOkResponse({
    type: UserDto,
    description: '유저가 로그인이 되어있고 정상적으로 정보를 가져왔습니다.',
  })
  @ApiUnauthorizedResponse({
    description: '유저가 로그인이 되어있지 않습니다.',
  })
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

  @ApiOperation({
    summary: '유저 정보',
    description: '유저가 로그인이 되어있다면 지정된 유저의 정보를 가져옵니다.',
  })
  @ApiOkResponse({
    type: UserDto,
    description:
      '유저가 로그인이 되어있고 해당 유저의 정보를 성공적으로 가져왔습니다.',
  })
  @ApiUnauthorizedResponse({
    description: '유저가 로그인이 되어있지 않습니다.',
  })
  @ApiParam({
    name: 'userName',
    description: '정보를 가져고싶은 유저의 이름',
  })
  @Get('/userinfo/:userName')
  @UseGuards(TwoFactorGuard)
  async getUserInfo(@Res() res: Response, @Param('userName') userName: string) {
    this.logger.log(`[GetUserInfo] ${userName}`);
    const data = await this.authService.getUserDtoByUserName(userName);
    res.status(HttpStatus.OK).send(data);
  }

  @ApiOperation({
    summary: '바꾸려는 유저의 자기소개',
    description:
      '유저가 로그인이 되어있다면 해당 유저의 자기소개를 변경합니다.',
  })
  @ApiBody({
    schema: {
      properties: {
        introduce: { type: 'string', description: '바꾸려는 자기소개' },
      },
    },
  })
  @ApiOkResponse({
    description: '성공적으로 바꾸었습니다.',
  })
  @ApiUnauthorizedResponse({
    description: '유저가 로그인이 되어있지 않습니다.',
  })
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
