import { GameType } from 'src/entity/common.enum';

export class RecordDto {
  gameType: GameType;
  winner: string;
  loser: string;
  time: Date;
}
