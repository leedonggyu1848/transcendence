import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Chat } from './chat.entity';
import { User } from './user.entity';

@Entity()
export class ChatUser {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Chat, (chat) => chat.users)
  chat: Chat;

  @ManyToOne(() => User, (user) => user.chats)
  user: User;
}
