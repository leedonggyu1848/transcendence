import {
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
import * as fs from 'fs';

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
  @Post('/user/profile/:id')
  @UseInterceptors(FileInterceptor('image'))
  async uploadFile(
    @Param('id') intra_id: string,
    @UploadedFile() image: Express.Multer.File,
    @Res() res: Response,
  ) {
    const imageName = intra_id;
    const imagePath = './uploads/' + imageName + '.png';
    console.log(imageName, image);
    fs.writeFile(imagePath, image.buffer, function (err) {
      if (err) {
        console.error(err);
        throw new Error('Failed to save image to disk');
      }
      console.log(`Image ${imageName} saved successfully to ${imagePath}`);
    });
    await this.authService.updateProfileImage(intra_id, intra_id + '.png');
    const data = await this.authService.findUserInfo(intra_id);
    res.status(HttpStatus.OK).send(data);
  }

  @Post('/user/introduce')
  async updateIntroduce(
    @Res() res: Response,
    @Body('intra_id') intra_id: string,
    @Body('introduce') introduce: string,
  ) {
    await this.authService.updateUserIntroduce(intra_id, introduce);
    const data = await this.authService.findUserInfo(intra_id);
    res.status(HttpStatus.OK).send(data);
  }
}
