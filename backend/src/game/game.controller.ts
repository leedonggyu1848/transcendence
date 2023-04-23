import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Logger,
  NotFoundException,
  Param,
  Post,
  Query,
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
import { GameType } from 'src/entity/common.enum';

@Controller('/api/game')
export class GameController {
  private logger = new Logger(GameController.name);
  constructor(
    private userService: UserService,
    private gameService: GameService,
  ) {}

  @Get('/lobby')
  @UseGuards(JwtGuard)
  async lobby(@Res() res: Response, @UserDeco() user: UserSessionDto) {
    this.logger.log('Request lobby info');
    let games = await this.gameService.getLobbyInfo();
    // test code => TODO: delete
    if (games.length === 0) games = await this.gameService.addDummyData();
    res.status(HttpStatus.OK).send(games);
  }

  @Get('/userinfo')
  @UseGuards(JwtGuard)
  async getMyInfo(@Res() res: Response, @UserDeco() user: UserSessionDto) {
    this.logger.log(`User info request: ${user.intraId}`);
    const data = await this.gameService.getUserInfo(user.intraId);
    res.status(HttpStatus.OK).send(data);
  }

  @Get('/userinfo/:userName')
  @UseGuards(JwtGuard)
  async getUserInfo(@Res() res: Response, @Param('userName') userName: string) {
    this.logger.log(`User info request: ${userName}`);
    const data = await this.gameService.getUserInfo(userName);
    res.status(HttpStatus.OK).send(data);
  }

  @Post('/new_game')
  @UseGuards(JwtGuard)
  async newGame(
    @Res() res: Response,
    @Body() gameDto: GameDto,
    @UserDeco() user: UserSessionDto,
  ) {
    this.logger.log(`Create new game: ${user.intraId}`);
    const found_user = await this.userService.getUserByUserNameWithGame(
      user.intraId,
    );
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
    this.logger.log(`Join game: ${title} / ${user.intraId}`);
    const found_user = await this.userService.getUserByUserNameWithGame(
      user.intraId,
    );
    const data = await this.gameService.joinGame(title, password, found_user);
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
    this.logger.log(`Watch game: ${title} / ${user.intraId}`);
    const found_user = await this.userService.getUserByUserNameWithGame(
      user.intraId,
    );
    const data = await this.gameService.watchGame(title, password, found_user);
    if (!data.success) {
      this.logger.log(`Bad request: ${data.data}`);
      throw new BadRequestException(data.data);
    }
    res.status(HttpStatus.OK).send(data.data);
  }

  @Post('/result')
  @UseGuards(JwtGuard)
  async gameResult(
    @Res() res: Response,
    @Body('win') win: string,
    @Body('lose') lose: string,
    @Body('type') type: GameType,
  ) {
    const winner = await this.userService.getUserByUserNameWithGame(win);
    const loser = await this.userService.getUserByUserNameWithGame(lose);
    if (!winner || !loser) throw new BadRequestException('잘못된 요청입니다.');
    this.logger.log(`Save game result: ${winner.userName} / ${loser.userName}`);
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
    this.logger.log(`Leave game: ${user.intraId}`);
    const found_user = await this.userService.getUserByUserNameWithGame(
      user.intraId,
    );
    const data = await this.gameService.serviceLeaveGame(found_user);
    if (!data.success) {
      this.logger.log(`Bad request: ${data.data}`);
      throw new BadRequestException(data.data);
    }
    res.status(HttpStatus.OK).send();
  }

  @Get('/history')
  @UseGuards(JwtGuard)
  async getHistory(@Res() res: Response, @Query('page') page: number) {
    this.logger.log(`Get history: ${page} page`);
    let data = await this.gameService.getTotalHistory(page);
    // test code -> TODO: delete
    if (data.records.length === 0) {
      await this.gameService.addDummyHistory();
      data = await this.gameService.getTotalHistory(page);
    }
    res.status(HttpStatus.OK).send(data);
  }

  @Get('/history/:id')
  @UseGuards(JwtGuard)
  async getRecord(@Res() res: Response, @Param('id') id: number) {
    this.logger.log(`Get record: ${id}`);
    const data = await this.gameService.getRecordById(id);
    if (!data) throw new BadRequestException('잘못된 데이터 요청입니다.');
    res.status(HttpStatus.OK).send(data);
  }
}
