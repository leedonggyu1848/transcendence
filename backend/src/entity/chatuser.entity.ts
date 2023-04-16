import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Chat } from './chat.entity';
import { Users } from './user.entity';

@Entity()
export class ChatUser {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Chat, (chat) => chat.users)
  chat: Chat;

  @ManyToOne(() => Users, (user) => user.chats)
  user: Users;
}
