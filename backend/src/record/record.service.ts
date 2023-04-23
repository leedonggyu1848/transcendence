import { Inject, Injectable } from '@nestjs/common';
import { User } from 'src/entity/user.entity';
import { GameType } from 'src/entity/common.enum';
import { IUserRepository } from 'src/user/repository/user.interface.repository';
import { IRecordRepository } from './repository/record.interface.repository';
import { randomInt } from 'crypto';

@Injectable()
export class RecordService {
  constructor(
    @Inject('IUserRepository')
    private userRepository: IUserRepository,
    @Inject('IRecordRepository')
    private recordRepository: IRecordRepository,
  ) {}

  async saveGameResult(winner: User, loser: User, type: GameType) {
    if (!winner || !loser)
      return { success: false, data: '유저 이름이 맞지 않습니다.' };
    if (winner.playGame.id !== loser.playGame.id)
      return { success: false, data: '두 사람이 참가 중인 게임이 다릅니다.' };

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
    return { success: true, data: null };
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

  // code for test -> TODO: delete
  async addDummyHistory() {
    const user1 = await this.userRepository.createUser(123132, 'dum1', '123');
    const user2 = await this.userRepository.createUser(123133, 'dum2', '123');
    let res = [];
    for (let i = 0; i < 50; i++) {
      let type = randomInt(0, 2);
      let score = randomInt(1, 11);
      if (score >= 5)
        res.push(await this.recordRepository.addRecord(type, 'dum1', 'dum2'));
      else
        res.push(await this.recordRepository.addRecord(type, 'dum2', 'dum1'));
    }
    await Promise.all(res);
  }
}
