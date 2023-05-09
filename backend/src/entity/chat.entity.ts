import {
  BeforeInsert,
  BeforeUpdate,
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

  @Column({ unique: true })
  title: string;

  @Column()
  type: ChatType;

  @Column()
  password: string;

  @BeforeInsert()
  @BeforeUpdate()
  async setPassword(password: string) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(password || this.password, salt);
  }

  @Column()
  operator: string;

  @Column()
  count: number;

  @OneToMany(() => ChatUser, (user) => user.chat, { cascade: true })
  users: ChatUser[];

  @OneToMany(() => Ban, (ban) => ban.chat, { cascade: true })
  banUsers: Ban[];
}
