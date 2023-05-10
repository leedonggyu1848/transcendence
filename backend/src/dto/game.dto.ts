import { GameType } from 'src/entity/common.enum';

export class GameDto {
  title: string;
  interruptMode: boolean;
  privateMode: boolean;
  password: string;
  type: GameType;
}
