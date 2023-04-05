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
import JwtGuard from 'src/user/jwt/guard/jwtauth.guard';
import { UserDeco } from 'src/decorator/user.decorator';
import { GameService } from './game.service';
import { UserService } from 'src/user/user.service';
import { GameDto } from 'src/dto/game.dto';
import { UserSessionDto } from 'src/dto/usersession.dto';
import { Response } from 'express';

@Controller('/api/game')
export class GameController {
  private logger = new Logger(GameController.name);
  constructor(
    private userService: UserService,
    private gameService: GameService,
  ) {}

  @Get('/lobby')
  @UseGuards(JwtGuard)
  async lobby(@Res() res: Response) {
    this.logger.log('Request lobby info');
    let games = await this.gameService.getLobbyInfo();
    // test code => TODO: delete
    if (games.length === 0) games = await this.gameService.addDummyData();
    res.status(HttpStatus.OK).send(games);
  }

  @Get('/userinfo')
  @UseGuards(JwtGuard)
  async getUserInfo(@Res() res: Response, @UserDeco() user: UserSessionDto) {
    this.logger.log(`User info request: ${user.intra_id}`);
    const data = await this.gameService.getUserInfo(user.intra_id);
    res.status(HttpStatus.OK).send(data);
  }

  @Post('/new_game')
  @UseGuards(JwtGuard)
  async newGame(
    @Res() res: Response,
    @Body() gameDto: GameDto,
    @UserDeco() user: UserSessionDto,
  ) {
    this.logger.log(`Create new game: ${user.intra_id}`);
    const found_user = await this.userService.findUser(user.intra_id);
    const data = await this.gameService.createGame(gameDto, found_user);
    if (!data.success) {
      this.logger.log(`Bad request: ${data.data}`);
      throw new BadRequestException(data.data);
    }
    res.status(HttpStatus.OK).send(data.data);
  }

  @Post('/join')
  @UseGuards(JwtGuard)
  async joinGame(
    @Res() res: Response,
    @Body('title') title: string,
    @Body('password') password: string,
    @UserDeco() user: UserSessionDto,
  ) {
    this.logger.log(`Join game: ${title} / ${user.intra_id}`);
    const found_user = await this.userService.findUser(user.intra_id);
    const data = await this.gameService.serviceJoinGame(
      title,
      password,
      found_user,
    );
    if (!data.success) {
      this.logger.log(`Bad request: ${data.data}`);
      throw new BadRequestException(data.data);
    }
    res.status(HttpStatus.OK).send(data.data);
  }

  @Post('/watch')
  @UseGuards(JwtGuard)
  async watchGame(
    @Res() res: Response,
    @Body('title') title: string,
    @Body('password') password: string,
    @UserDeco() user: UserSessionDto,
  ) {
    this.logger.log(`Watch game: ${title} / ${user.intra_id}`);
    const found_user = await this.userService.findUser(user.intra_id);
    const data = await this.gameService.serviceWatchGame(
      title,
      password,
      found_user,
    );
    if (!data.success) {
      this.logger.log(`Bad request: ${data.data}`);
      throw new BadRequestException(data.data);
    }
    res.status(HttpStatus.OK).send(data.data);
  }

  @Post('/normal')
  @UseGuards(JwtGuard)
  async gameResult(
    @Res() res: Response,
    @Body('win') win: string,
    @Body('lose') lose: string,
    @Body('type') type: string,
  ) {
    const winner = await this.userService.findUser(win);
    const loser = await this.userService.findUser(lose);
    const data = await this.gameService.saveGameResult(winner, loser, type);
    if (!data.success) throw new BadRequestException(data.data);
    res.status(HttpStatus.OK).send();
  }

  @Post('/flush') // test code => TODO: delete
  @UseGuards(JwtGuard)
  async flush(@Res() res: Response, @Body('title') title: string) {
    await this.gameService.flushGame(title);
    res.status(HttpStatus.OK).send();
  }

  @Get('/leave')
  @UseGuards(JwtGuard)
  async leaveGame(@Res() res: Response, @UserDeco() user: UserSessionDto) {
    this.logger.log(`Leave game: ${user.intra_id}`);
    const found_user = await this.userService.findUser(user.intra_id);
    const data = await this.gameService.serviceLeaveGame(found_user);
    if (!data.success) {
      this.logger.log(`Bad request: ${data.data}`);
      throw new BadRequestException(data.data);
    }
    res.status(HttpStatus.OK).send();
  }
}
