import { GameType } from 'src/entity/common.enum';

export class RecordDto {
  id: number;
  gameType: GameType;
  winner: string;
  loser: string;
  time: Date;
}
