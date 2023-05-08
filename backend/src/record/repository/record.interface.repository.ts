import { GameType } from 'src/entity/common.enum';
import { Record } from 'src/entity/record.entity';
import { User } from 'src/entity/user.entity';

export interface IRecordRepository {
  recordToRecordDto(record: Record);
  addRecord(gameType: GameType, winner: User, loser: User);
  findAll();
  findByUserIdWithJoin(userId: number);
  findByIdWithJoin(id: number);
  findPage(page: number, pageSize: number);
}
