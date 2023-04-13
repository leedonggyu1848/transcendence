import {
  BadRequestException,
  Bind,
  Body,
  Controller,
  Get,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  Param,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { UserDeco } from 'src/decorator/user.decorator';
import { UserSessionDto } from 'src/dto/usersession.dto';
import { UserService } from './user.service';
import { PhGuard } from './ft/guard/auth.guard';
import JwtGuard from './jwt/guard/jwtauth.guard';
import { JwtSignGuard } from './jwt/guard/jwtsign.guard';

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
    this.logger.log('Login');
  }

  @Get('/logincallback')
  @UseGuards(PhGuard, JwtSignGuard)
  async loginCallback(@Res() res: Response, @UserDeco() user: UserSessionDto) {
    this.logger.log(`Login: ${user.intra_id}`);
    await this.authService.addUserFromSession(user);
    return res.redirect(`${this.configService.get<string>('frontend_home')}`);
  }

  @Get('/logout')
  @UseGuards(JwtGuard)
  logout(@Res() res: Response, @UserDeco() user: UserSessionDto) {
    this.logger.log(`Logout: ${user.intra_id}`);
    res.clearCookie('access_token');
    res.status(HttpStatus.NO_CONTENT).send();
  }

  // multer 라는 middleware를 이용해서 이미지 파일 업로드
  @Post('/user/profile')
  @UseGuards(JwtGuard)
  @UseInterceptors(FileInterceptor('image'))
  async updateProfile(
    @Res() res: Response,
    @UserDeco() user: UserSessionDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    this.logger.log(`Profile upadate: ${user.intra_id}`);
    const data = await this.authService.updateProfileImage(user, image);
    if (!data.success) {
      this.logger.log(data.data);
      throw new InternalServerErrorException('데이터 저장 실패');
    }
    res.status(HttpStatus.OK).send(data.data);
  }

  @Post('/user/introduce')
  @UseGuards(JwtGuard)
  async updateIntroduce(
    @Res() res: Response,
    @UserDeco() user: UserSessionDto,
    @Body('introduce') introduce: string,
  ) {
    this.logger.log(`Introduce update: ${user.intra_id}`);
    await this.authService.updateUserIntroduce(user, introduce);
    const result = await this.authService.findUser(user.intra_id);
    res.status(HttpStatus.OK).send(result);
  }
}
