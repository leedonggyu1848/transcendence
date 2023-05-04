import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from 'src/entity/chat.entity';
import { ChatUser } from 'src/entity/chatuser.entity';
import { ChatRepository } from 'src/chat/repository/chat.repository';
import { ChatUserRepository } from 'src/chat/repository/chatuser.repository';
import { ChatService } from './chat.service';

const chatRepo = {
  provide: 'IChatRepository',
  useClass: ChatRepository,
};

const chatUserRepo = {
  provide: 'IChatUserRepository',
  useClass: ChatUserRepository,
};

@Module({
  imports: [TypeOrmModule.forFeature([Chat, ChatUser])],
  providers: [ChatService, chatRepo, chatUserRepo],
  exports: [ChatService, chatRepo, chatUserRepo],
})
export class ChatModule {}
