import { NotEquals } from 'class-validator';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ChatUser } from './chatuser.entity';

@Entity()
export class Chat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @NotEquals(null)
  title: string;

  @Column()
  @NotEquals(null)
  password: string;

  @Column()
  @NotEquals(null)
  count: number;

  @OneToMany(() => ChatUser, (user) => user, { cascade: true })
  users: ChatUser[];
}
