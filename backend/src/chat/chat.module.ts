import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from 'src/entity/chat.entity';
import { Users } from 'src/entity/user.entity';
import { UserRepository } from 'src/user/repository/users.repository';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatRepository } from './repository/chat.repository';

const userRepo = {
  provide: 'IUserRepository',
  useClass: UserRepository,
};

const chatRepo = {
  provide: 'IChatRepository',
  useClass: ChatRepository,
};

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([Users, Chat])],
  controllers: [ChatController],
  providers: [userRepo, chatRepo, ChatService],
})
export class ChatModule {}
