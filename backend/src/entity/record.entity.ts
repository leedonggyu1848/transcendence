import { NotEquals } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { GameType } from './common.enum';

@Entity()
export class Record {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @NotEquals(null)
  gameType: GameType;

  @Column()
  @NotEquals(null)
  winner: string;

  @Column()
  @NotEquals(null)
  loser: string;

  @Column()
  @NotEquals(null)
  time: Date;
}
