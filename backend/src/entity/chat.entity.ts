import { NotEquals } from 'class-validator';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Ban } from './ban.entity';
import { ChatUser } from './chatuser.entity';
import { ChatType } from './common.enum';

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
