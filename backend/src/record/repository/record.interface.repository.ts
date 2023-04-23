import { GameType } from 'src/entity/common.enum';
import { Record } from 'src/entity/record.entity';

export interface IRecordRepository {
  recordToRecordDto(record: Record);
  addRecord(gameType: GameType, winner: string, loser: string);
  findAll();
  findById(id: number);
  findPage(page: number, pageSize: number);
  findByPlayer(player: string);
}
