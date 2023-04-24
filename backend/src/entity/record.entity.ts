import { NotEquals } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { GameType } from './common.enum';

@Entity()
export class Record {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  gameType: GameType;

  @Column()
  winner: string;

  @Column()
  loser: string;

  @Column()
  time: Date;
}
