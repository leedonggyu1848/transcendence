import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Logger,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { UserDeco } from 'src/decorator/user.decorator';
import { UserSessionDto } from 'src/dto/usersession.dto';
import JwtGuard from 'src/user/jwt/guard/jwtauth.guard';
import { UserService } from 'src/user/user.service';
import { FriendService } from './friend.service';

@Controller('/api/friend')
export class FriendController {
  private logger = new Logger(FriendController.name);
  constructor(
    private authService: UserService,
    private friendService: FriendService,
  ) {}

  @Post('/send-request')
  @UseGuards(JwtGuard)
  async sendFriendRequest(
    @Res() res: Response,
    @UserDeco() user: UserSessionDto,
    @Body('friendname') friendname: string,
  ) {
    this.logger.log(`Friend request: ${user.intra_id} to ${friendname}`);
    const found_user = await this.authService.findUser(user.intra_id);
    const friend = await this.authService.findUser(friendname);
    if (!friend) throw new BadRequestException('없는 유저입니다.');
    let data = await this.friendService.requestFriend(found_user, friend);
    if (!data.success) throw new BadRequestException(data.data);
    res.status(HttpStatus.OK).send();
  }

  @Post('/accept-request')
  @UseGuards(JwtGuard)
  async acceptFriend(
    @Res() res: Response,
    @UserDeco() user: UserSessionDto,
    @Body('friendname') friendname: string,
  ) {
    this.logger.log(`Friend accept: ${user.intra_id} to ${friendname}`);
    const found_user = await this.authService.findUser(user.intra_id);
    const friend = await this.authService.findUser(friendname);
    if (!friend) throw new BadRequestException('없는 유저입니다.');
    this.friendService.acceptFriend(found_user, friend);
    res.status(HttpStatus.OK).send();
  }

  @Get('/list')
  @UseGuards(JwtGuard)
  async getFriendList(@Res() res: Response, @UserDeco() user: UserSessionDto) {
    this.logger.log(`Friend list request: ${user.intra_id}`);
    const found_user = await this.authService.findUser(user.intra_id);
    let data = await this.friendService.getFriendList(found_user);
    // testcode -> TODO: delete
    if (!data) {
      await this.friendService.addDummyFriends(found_user);
      data = await this.friendService.getFriendList(found_user);
    }
    res.status(HttpStatus.OK).send(data);
  }

  @Get('/request-list')
  @UseGuards(JwtGuard)
  async getFriendRequestList(
    @Res() res: Response,
    @UserDeco() user: UserSessionDto,
  ) {
    this.logger.log(`Get friend request list: ${user.intra_id}`);
    const found_user = await this.authService.findUser(user.intra_id);
    const data = await this.friendService.getFriendRequestList(found_user);
    res.status(HttpStatus.OK).send(data);
  }
}
