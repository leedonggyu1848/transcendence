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
import { Response } from 'express';
import TwoFactorGuard from 'src/user/jwt/guard/twofactor.guard';
import { RecordService } from 'src/record/record.service';
import { UserDeco } from 'src/decorator/user.decorator';
import { UserSessionDto } from 'src/dto/usersession.dto';

@Controller('/api/game')
export class GameController {
  private logger = new Logger(GameController.name);
  constructor(private recordService: RecordService) {}

  @Get('/history')
  @UseGuards(TwoFactorGuard)
  async getGameHistory(@UserDeco() user: UserSessionDto, @Res() res: Response) {
    this.logger.log(`[GetHistory]`);
    let data = await this.recordService.getGameHistory(user);
    res.status(HttpStatus.OK).send(data);
  }

  @Get('/history/:id')
  @UseGuards(TwoFactorGuard)
  async getGameRecord(@Res() res: Response, @Param('id') id: number) {
    this.logger.log(`[GetRecord]`);
    const data = await this.recordService.getRecordById(id);
    if (!data) throw new BadRequestException('잘못된 데이터 요청입니다.');
    res.status(HttpStatus.OK).send(data);
  }
}
