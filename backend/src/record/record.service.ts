import { Inject, Injectable } from '@nestjs/common';
import { User } from 'src/entity/user.entity';
import { GameType } from 'src/entity/common.enum';
import { IRecordRepository } from './repository/record.interface.repository';
import { UserService } from 'src/user/user.service';
import { IsolationLevel, Transactional } from 'typeorm-transactional';
import { UserSessionDto } from 'src/dto/usersession.dto';
import { Record } from 'src/entity/record.entity';
import { RecordDto } from 'src/dto/record.dto';

@Injectable()
export class RecordService {
  constructor(
    @Inject('IRecordRepository')
    private recordRepository: IRecordRepository,
    private userService: UserService,
  ) {}

  recordToRecordDto(record: Record) {
    const winner = record.win ? record.player.userName : record.opponent;
    const loser = record.win ? record.opponent : record.player.userName;
    const recordDto: RecordDto = {
      id: record.id,
      gameType: record.gameType,
      winner: winner,
      loser: loser,
      time: record.time,
    };
    return recordDto;
  }

  @Transactional({ isolationLevel: IsolationLevel.REPEATABLE_READ })
  async saveGameResult(winner: User, loser: User, type: GameType) {
    const win = await this.recordRepository.addRecord(
      type,
      winner,
      loser.userName,
      true,
    );
    await this.userService.updateGameWin(winner, type, win);
    const lose = await this.recordRepository.addRecord(
      type,
      loser,
      winner.userName,
      false,
    );
    await this.userService.updateGameLose(loser, type, lose);
  }

  async getGameHistory(userSession: UserSessionDto) {
    const user = await this.userService.getUserByUserId(userSession.userId);
    const records = await this.recordRepository.findByUserIdWithJoin(user);
    const tmp = records.map(async (record) => this.recordToRecordDto(record));
    const recordsDto = await Promise.all(tmp);
    const recordCount = records.length;
    return { recordsDto, recordCount };
  }

  async getRecordById(id: number) {
    const record = await this.recordRepository.findByIdWithJoin(id);
    let player = record.player;
    let opponent = await this.userService.getUserByUserName(record.opponent);
    if (!record || !player || !opponent)
      throw new Error('잘못된 데이터 입니다.');
    return {
      record: this.recordToRecordDto(record),
      winner: this.userService.userToUserDto(record.win ? player : opponent),
      loser: this.userService.userToUserDto(record.win ? opponent : player),
    };
  }
}
