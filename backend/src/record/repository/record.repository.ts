import { InjectRepository } from '@nestjs/typeorm';
import { RecordDto } from 'src/dto/record.dto';
import { GameType } from 'src/entity/common.enum';
import { Record } from 'src/entity/record.entity';
import { User } from 'src/entity/user.entity';
import { Repository } from 'typeorm';
import { IRecordRepository } from './record.interface.repository';

export class RecordRepository implements IRecordRepository {
  constructor(
    @InjectRepository(Record) private recordRepository: Repository<Record>,
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

  async addRecord(gameType: GameType, winner: User, loser: User) {
    const win = {
      gameType: gameType,
      player: winner,
      opponent: loser.userName,
      win: true,
      time: new Date(Date.now()),
    };
    const lose = {
      gameType: gameType,
      player: loser,
      opponent: winner.userName,
      win: false,
      time: new Date(Date.now()),
    };
    await this.recordRepository.save(win);
    await this.recordRepository.save(lose);
    return { win, lose };
  }

  async findAll() {
    return await this.recordRepository.find();
  }

  async findByUserIdWithJoin(userId: number) {
    return await this.recordRepository.find({
      where: { player: { id: userId } },
      relations: ['player'],
    });
  }

  async findByIdWithJoin(id: number) {
    return await this.recordRepository.findOne({
      where: { id: id },
      relations: ['player'],
    });
  }

  async findPage(page: number, pageSize: number) {
    return await this.recordRepository.find({
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
  }
}
