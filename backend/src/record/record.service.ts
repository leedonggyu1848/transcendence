import { Inject, Injectable } from '@nestjs/common';
import { User } from 'src/entity/user.entity';
import { GameType } from 'src/entity/common.enum';
import { IRecordRepository } from './repository/record.interface.repository';
import { UserService } from 'src/user/user.service';
import { IsolationLevel, Transactional } from 'typeorm-transactional';
import { UserSessionDto } from 'src/dto/usersession.dto';

@Injectable()
export class RecordService {
  constructor(
    @Inject('IRecordRepository')
    private recordRepository: IRecordRepository,
    private userService: UserService,
  ) {}

  @Transactional({ isolationLevel: IsolationLevel.REPEATABLE_READ })
  async saveGameResult(winner: User, loser: User, type: GameType) {
    const data = await this.recordRepository.addRecord(type, winner, loser);
    await this.userService.updateGameWin(winner, type, data.win);
    await this.userService.updateGameLose(loser, type, data.lose);
  }

  async getGameHistory(user: UserSessionDto) {
    const records = await this.recordRepository.findByUserIdWithJoin(
      user.userId,
    );
    const tmp = records.map(
      async (record) => await this.recordRepository.recordToRecordDto(record),
    );
    const recordsDto = await Promise.all(tmp);
    const recordCount = records.length;
    return { recordsDto, recordCount };
  }

  async getRecordById(id: number) {
    const record = await this.recordRepository.findByIdWithJoin(id);
    let player = record.player;
    let opponent = await this.userService.getUserByUserName(record.opponent);
    if (!record || !player || !opponent) return null;
    return {
      record: this.recordRepository.recordToRecordDto(record),
      winner: this.userService.userToUserDto(record.win ? player : opponent),
      loser: this.userService.userToUserDto(record.win ? opponent : player),
    };
  }
}
