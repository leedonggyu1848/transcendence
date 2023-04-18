import { NotEquals } from 'class-validator';
import {
  BeforeInsert,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Ban } from './ban.entity';
import { ChatUser } from './chatuser.entity';
import { ChatType } from './common.enum';
import * as bcrypt from 'bcrypt';

@Entity()
export class Chat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @NotEquals(null)
  title: string;

  @Column()
  @NotEquals(null)
  type: ChatType;

  @Column()
  @NotEquals(null)
  password: string;

  @BeforeInsert()
  async setPassword(password: string) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(password || this.password, salt);
  }

  @Column()
  @NotEquals(null)
  operator: string;

  @Column()
  @NotEquals(null)
  count: number;

  @OneToMany(() => ChatUser, (user) => user.chat, { cascade: true })
  users: ChatUser[];

  @OneToMany(() => Ban, (ban) => ban.channel, { cascade: true })
  banUsers: Ban[];
}
