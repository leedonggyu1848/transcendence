import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Logger,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UserDeco } from 'src/decorator/user.decorator';
import { GameService } from './game.service';
import { UserService } from 'src/user/user.service';
import { UserSessionDto } from 'src/dto/usersession.dto';
import { Response } from 'express';
import { GameType } from 'src/entity/common.enum';
import TwoFactorGuard from 'src/user/jwt/guard/twofactor.guard';
import { RecordService } from 'src/record/record.service';

@Controller('/api/game')
export class GameController {
  private logger = new Logger(GameController.name);
  constructor(
    private userService: UserService,
    private recordService: RecordService,
    private gameService: GameService,
  ) {}

  @Post('/flush') // test code => TODO: delete
  @UseGuards(TwoFactorGuard)
  async flush(@Res() res: Response, @Body('title') title: string) {
    await this.gameService.flushGame(title);
    res.status(HttpStatus.OK).send();
  }

  @Get('/history')
  @UseGuards(TwoFactorGuard)
  async getHistory(@Res() res: Response, @Query('page') page: number) {
    this.logger.log(`Get history: ${page} page`);
    let data = await this.recordService.getTotalHistory(page);
    res.status(HttpStatus.OK).send(data);
  }

  @Get('/history/:id')
  @UseGuards(TwoFactorGuard)
  async getRecord(@Res() res: Response, @Param('id') id: number) {
    this.logger.log(`Get record: ${id}`);
    const data = await this.recordService.getRecordById(id);
    if (!data) throw new BadRequestException('잘못된 데이터 요청입니다.');
    res.status(HttpStatus.OK).send(data);
  }
}
