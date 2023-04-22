import { NotEquals } from 'class-validator';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Block } from './block.entity';
import { ChatUser } from './chatuser.entity';
import { JoinType } from './common.enum';
import { Friend } from './friend.entity';
import { Game } from './game.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @NotEquals(null)
  userId: number;

  @Column()
  socketId: string;

  @Column()
  @NotEquals(null)
  userName: string;

  @Column()
  profile: string;

  @Column()
  introduce: string;

  @Column()
  @NotEquals(null)
  normalWin: number;

  @Column()
  @NotEquals(null)
  normalLose: number;

  @Column()
  @NotEquals(null)
  rankWin: number;

  @Column()
  @NotEquals(null)
  rankLose: number;

  @ManyToOne(() => Game, (game) => game.players)
  @JoinColumn({ name: 'playGameId' })
  playGame: Game;

  @ManyToOne(() => Game, (game) => game.watchers)
  @JoinColumn({ name: 'watchGameId' })
  watchGame: Game;

  @Column({ type: 'enum', name: 'join_type', enum: JoinType })
  @NotEquals(null)
  joinType: JoinType;

  @OneToMany(() => Friend, (friend) => friend.user, { cascade: true })
  friends: Friend[];

  @OneToMany(() => ChatUser, (chat) => chat.user, { cascade: true })
  chats: ChatUser[];

  @OneToMany(() => Block, (block) => block.user, { cascade: true })
  blockUsers: Block[];
}
