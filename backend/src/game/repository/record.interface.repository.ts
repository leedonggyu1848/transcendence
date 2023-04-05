import { RecordDto } from 'src/dto/record.dto';
import { GameType } from 'src/entity/common.enum';
import { Record } from 'src/entity/record.entity';

export interface IRecordRepository {
  recordToRecordDto(record: Record);

  addRecord(gameType: GameType, winner: string, loser: string);

  findAll();

  findByPlayer(player: string);

  findByWinner(winner: string);
}
