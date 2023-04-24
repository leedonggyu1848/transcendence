import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Friend {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.friends)
  @JoinColumn()
  user: User;

  @Column()
  friendName: string;

  @Column()
  friendProfile: string;

  @Column()
  accept: boolean;

  @Column()
  time: Date;
}
