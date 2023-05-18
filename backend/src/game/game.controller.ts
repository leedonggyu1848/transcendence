import {
  BadRequestException,
  Controller,
  Get,
  HttpStatus,
  Logger,
  Param,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import TwoFactorGuard from 'src/user/jwt/guard/twofactor.guard';
import { RecordService } from 'src/record/record.service';
import { UserDeco } from 'src/decorator/user.decorator';
import { UserSessionDto } from 'src/dto/usersession.dto';
import {
  ApiBadRequestResponse,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { RecordDto } from 'src/dto/record.dto';

@ApiTags('Game')
@ApiExtraModels(RecordDto)
@Controller('/api/game')
export class GameController {
  private logger = new Logger(GameController.name);
  constructor(private recordService: RecordService) {}

  @ApiOperation({
    summary: '게임 기록',
    description: '지금까지 했던 게임의 기록을 가져옵니다.',
  })
  @ApiOkResponse({
    description: '정상적으로 게임 기록을 가져왔습니다.',
    schema: {
      properties: {
        recordsDto: {
          type: 'array',
          items: { $ref: getSchemaPath(RecordDto) },
        },
        recordCount: {
          type: 'number',
          description: '총 기록의 개수',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: '유저가 로그인이 되어있지 않습니다.',
  })
  @Get('/history')
  @UseGuards(TwoFactorGuard)
  async getGameHistory(@UserDeco() user: UserSessionDto, @Res() res: Response) {
    this.logger.log(`[GetHistory]`);
    const data = await this.recordService.getGameHistory(user);
    res.status(HttpStatus.OK).send(data);
  }
  @ApiOperation({
    summary: '특졍 게임 기록',
    description: '특정 게임 기록을 가져옵니다.',
  })
  @ApiOkResponse({
    description: '정상적으로 게임 기록을 가져왔습니다.',
    type: RecordDto,
  })
  @ApiBadRequestResponse({
    description: '해당하는 게임 기록이 없습니다.',
  })
  @ApiUnauthorizedResponse({
    description: '유저가 로그인이 되어있지 않습니다.',
  })
  @Get('/history/:id')
  @UseGuards(TwoFactorGuard)
  async getGameRecord(@Res() res: Response, @Param('id') id: number) {
    this.logger.log(`[GetRecord] ${id}`);
    try {
      const data = await this.recordService.getRecordById(id);
      res.status(HttpStatus.OK).send(data);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }
}
