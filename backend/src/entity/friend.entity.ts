import { NotEquals } from 'class-validator';
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
  @NotEquals(null)
  friendname: string;

  @Column()
  @NotEquals(null)
  accept: boolean;

  @Column()
  @NotEquals(null)
  time: Date;
}
