import { NotEquals } from 'class-validator';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Users } from './user.entity';

@Entity()
export class Friend {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Users, (user) => user.friends)
  @JoinColumn()
  user: Users;

  @Column()
  @NotEquals(null)
  friendname: string;

  @Column()
  @NotEquals(null)
  accept: boolean;
}
