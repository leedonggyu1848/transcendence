import { NotEquals } from 'class-validator';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

@Entity()
export class Game {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @NotEquals(null)
  title: string;

  @Column()
  @NotEquals(null)
  interrupt_mode: boolean;

  @Column()
  @NotEquals(null)
  private_mode: boolean;

  @Column()
  @NotEquals(null)
  password: string;

  @BeforeInsert()
  @BeforeUpdate()
  async setPassword(password: string) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(password || this.password, salt);
  }

  @Column()
  @NotEquals(null)
  count: number;

  @OneToMany(() => User, (user) => user.play_game, { cascade: true })
  players: User[];

  @OneToMany(() => User, (user) => user.watch_game, { cascade: true })
  watchers: User[];
}
