import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { GameType } from './common.enum';
import { User } from './user.entity';

@Entity()
export class Record {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  gameType: GameType;

  @ManyToOne(() => User, (user) => user.records)
  player: User;

  @Column()
  opponent: string;

  @Column()
  win: boolean;

  @Column()
  time: Date;
}
