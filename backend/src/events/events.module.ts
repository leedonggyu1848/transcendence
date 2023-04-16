import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from 'src/entity/chat.entity';
import { ChatUser } from 'src/entity/chatuser.entity';
import { Friend } from 'src/entity/friend.entity';
import { Users } from 'src/entity/user.entity';
import { FriendRepository } from 'src/friend/repository/friend.repository';
import { ChatRepository } from 'src/game/repository/chat.repository';
import { ChatUserRepository } from 'src/game/repository/chatuser.repository';
import { UserRepository } from 'src/user/repository/users.repository';
import { EventsGateway } from './events.gateway';

const userRepo = {
  provide: 'IUserRepository',
  useClass: UserRepository,
};

const friendRepo = {
  provide: 'IFriendRepository',
  useClass: FriendRepository,
};

const chatRepo = {
  provide: 'IChatRepository',
  useClass: ChatRepository,
};

const chatUserRepo = {
  provide: 'IChatUserRepository',
  useClass: ChatUserRepository,
};

@Module({
  imports: [TypeOrmModule.forFeature([Users, Friend, Chat, ChatUser])],
  providers: [EventsGateway, userRepo, friendRepo, chatRepo, chatUserRepo],
})
export class EventsModule {}
