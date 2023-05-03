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
import { GameService } from './game.service';
import { Response } from 'express';
import TwoFactorGuard from 'src/user/jwt/guard/twofactor.guard';
import { RecordService } from 'src/record/record.service';

@Controller('/api/game')
export class GameController {
  private logger = new Logger(GameController.name);
  constructor(private gameService: GameService) {}

  @Get('/history')
  @UseGuards(TwoFactorGuard)
  async getHistory(@Res() res: Response, @Query('page') page: number) {
    this.logger.log(`Get history: ${page} page`);
    let data = await this.gameService.getGameHistory(page);
    res.status(HttpStatus.OK).send(data);
  }

  @Get('/history/:id')
  @UseGuards(TwoFactorGuard)
  async getRecord(@Res() res: Response, @Param('id') id: number) {
    this.logger.log(`Get record: ${id}`);
    const data = await this.gameService.getGameRecord(id);
    if (!data) throw new BadRequestException('잘못된 데이터 요청입니다.');
    res.status(HttpStatus.OK).send(data);
  }
}
