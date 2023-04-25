import { Inject, Injectable } from '@nestjs/common';
import { User } from 'src/entity/user.entity';
import { GameType } from 'src/entity/common.enum';
import { IUserRepository } from 'src/user/repository/user.interface.repository';
import { IRecordRepository } from './repository/record.interface.repository';
import { randomInt } from 'crypto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class RecordService {
  constructor(
    @Inject('IUserRepository')
    private userRepository: IUserRepository,
    @Inject('IRecordRepository')
    private recordRepository: IRecordRepository,
    private userService: UserService,
  ) {}

  async saveGameResult(winnerName: string, loserName: string, type: GameType) {
    const winner = await this.userService.getUserByUserNameWithGame(winnerName);
    const loser = await this.userService.getUserByUserNameWithGame(loserName);
    if (!winner || !loser)
      return { success: false, msg: '유저 이름이 맞지 않습니다.' };
    if (type == GameType.NORMAL) {
      await this.userRepository.updateNormalWin(winner.id, winner.normalWin);
      await this.userRepository.updateNormalLose(loser.id, loser.normalLose);
    } else {
      await this.userRepository.updateRankWin(winner.id, winner.rankWin);
      await this.userRepository.updateRankLose(loser.id, loser.rankLose);
    }
    await this.recordRepository.addRecord(
      type,
      winner.userName,
      loser.userName,
    );
    return { success: true };
  }

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

  async getRecordById(id: number) {
    const record = await this.recordRepository.findById(id);
    const winner = await this.userRepository.findByUserName(record.winner);
    const loser = await this.userRepository.findByUserName(record.loser);
    if (!record || !winner || !loser) return null;
    return { record: record, winner: winner, loser: loser };
  }
}
