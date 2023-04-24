import { NotEquals } from 'class-validator';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
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

  @Column({ unique: true })
  userId: number;

  @Column({ unique: true, default: '' })
  socketId: string;

  @Column({ unique: true })
  userName: string;

  @Column()
  email: string;

  @Column()
  auth: boolean;

  @Column()
  profile: string;

  @Column()
  introduce: string;

  @Column()
  normalWin: number;

  @Column()
  normalLose: number;

  @Column()
  rankWin: number;

  @Column()
  rankLose: number;

  @ManyToOne(() => Game, (game) => game.players)
  @JoinColumn({ name: 'playGameId' })
  playGame: Game;

  @ManyToOne(() => Game, (game) => game.watchers)
  @JoinColumn({ name: 'watchGameId' })
  watchGame: Game;

  @Column({ type: 'enum', name: 'join_type', enum: JoinType })
  joinType: JoinType;

  @OneToMany(() => Friend, (friend) => friend.user, { cascade: true })
  friends: Friend[];

  @OneToMany(() => ChatUser, (chat) => chat.user, { cascade: true })
  chats: ChatUser[];

  @OneToMany(() => Block, (block) => block.user, { cascade: true })
  blockUsers: Block[];
}
