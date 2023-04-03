import { NotEquals } from 'class-validator';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { JoinType } from './common.enum';
import { Game } from './game.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @NotEquals(null)
  user_id: number;

  @Column()
  @NotEquals(null)
  intra_id: string;

  @Column()
  profile: string;

  @Column()
  introduce: string;

  @Column()
  @NotEquals(null)
  normal_win: number;

  @Column()
  @NotEquals(null)
  normal_lose: number;

  @Column()
  @NotEquals(null)
  rank_win: number;

  @Column()
  @NotEquals(null)
  rank_lose: number;

  @ManyToOne(() => Game, (game) => game.users)
  @JoinColumn({ name: 'game_id' })
  join_game: Game;

  @Column({ type: 'enum', name: 'join_type', enum: JoinType })
  @NotEquals(null)
  join_type: JoinType;
}
