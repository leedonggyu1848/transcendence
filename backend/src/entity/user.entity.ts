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
import { Friend } from './friend.entity';
import { Game } from './game.entity';

@Entity()
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @NotEquals(null)
  user_id: number;

  @Column()
  socket_id: string;

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

  @ManyToOne(() => Game, (game) => game.players)
  @JoinColumn({ name: 'play_game_id' })
  play_game: Game;

  @ManyToOne(() => Game, (game) => game.watchers)
  @JoinColumn({ name: 'watch_game_id' })
  watch_game: Game;

  @Column({ type: 'enum', name: 'join_type', enum: JoinType })
  @NotEquals(null)
  join_type: JoinType;

  @OneToMany(() => Friend, (friend) => friend.user, { cascade: true })
  friends: Friend[];
}
