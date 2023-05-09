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

  async addRecord(gameType: GameType, player: User, opponent: string) {
    const record = this.recordRepository.create({
      gameType: gameType,
      player: player,
      opponent: opponent,
      win: true,
      time: new Date(Date.now()),
    });
    await this.recordRepository.save(record);
    return record;
  }

  async findAll() {
    return await this.recordRepository.find();
  }

  async findByUserIdWithJoin(user: User) {
    return await this.recordRepository.find({
      where: { player: { id: user.id } },
      relations: ['player'],
    });
  }

  async findByIdWithJoin(id: number) {
    return await this.recordRepository.findOne({
      where: { id: id },
      relations: ['player'],
    });
  }
}
