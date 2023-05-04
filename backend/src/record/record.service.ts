import { Inject, Injectable } from '@nestjs/common';
import { User } from 'src/entity/user.entity';
import { GameType } from 'src/entity/common.enum';
import { IRecordRepository } from './repository/record.interface.repository';
import { UserService } from 'src/user/user.service';
import {
  IsolationLevel,
  Transactional,
} from 'typeorm-transactional-cls-hooked';

@Injectable()
export class RecordService {
  constructor(
    @Inject('IRecordRepository')
    private recordRepository: IRecordRepository,
    private userService: UserService,
  ) {}

  async saveGameResult(winner: User, loser: User, type: GameType) {
    await this.userService.updateGameWin(winner, type);
    await this.userService.updateGameLose(loser, type);
    await this.recordRepository.addRecord(
      type,
      winner.userName,
      loser.userName,
    );
  }

  @Transactional({ isolationLevel: IsolationLevel.REPEATABLE_READ })
  async getTotalHistory(page: number) {
    const allRecords = await this.recordRepository.findAll();
    const pageRecords = await this.recordRepository.findPage(page, 10);
    const tmp = pageRecords.map(
      async (record) => await this.recordRepository.recordToRecordDto(record),
    );
    const records = await Promise.all(tmp);
    const recordCount = allRecords.length;
    return { records, recordCount };
  }

  @Transactional({ isolationLevel: IsolationLevel.REPEATABLE_READ })
  async getRecordById(id: number) {
    const record = await this.recordRepository.findById(id);
    const winner = await this.userService.getUserByUserName(record.winner);
    const loser = await this.userService.getUserByUserName(record.loser);
    if (!record || !winner || !loser) return null;
    return { record: record, winner: winner, loser: loser };
  }
}
