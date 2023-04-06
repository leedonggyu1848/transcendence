import { InjectRepository } from '@nestjs/typeorm';
import { RecordDto } from 'src/dto/record.dto';
import { GameType } from 'src/entity/common.enum';
import { Record } from 'src/entity/record.entity';
import { Repository } from 'typeorm';

export class RecordRepository {
  constructor(
    @InjectRepository(Record) private recordRepository: Repository<Record>,
  ) {}

  recordToRecordDto(record: Record) {
    const recordDto: RecordDto = {
      id: record.id,
      gameType: record.gameType,
      winner: record.winner,
      loser: record.loser,
      time: record.time,
    };
    return recordDto;
  }

  async addRecord(gameType: GameType, winner: string, loser: string) {
    console.log(gameType, winner, loser);
    await this.recordRepository.save({
      gameType: gameType,
      winner: winner,
      loser: loser,
      time: new Date(Date.now()),
    });
  }

  async findAll() {
    return await this.recordRepository.find();
  }

  async findById(id: number) {
    return await this.recordRepository.findOneBy({ id: id });
  }

  async findPage(page: number, pageSize: number) {
    return await this.recordRepository.find({
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
  }

  async findByPlayer(player: string) {
    const rec1 = await this.recordRepository.findBy({ winner: player });
    const rec2 = await this.recordRepository.findBy({ loser: player });
    const records = rec1.concat(rec2);
    return records.sort((r1, r2) => r1.time.getTime() - r2.time.getTime());
  }
}
