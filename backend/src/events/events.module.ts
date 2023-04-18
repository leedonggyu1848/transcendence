import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Server } from 'socket.io';
import { Ban } from 'src/entity/ban.entity';
import { Chat } from 'src/entity/chat.entity';
import { ChatUser } from 'src/entity/chatuser.entity';
import { Friend } from 'src/entity/friend.entity';
import { Users } from 'src/entity/user.entity';
import { FriendRepository } from 'src/friend/repository/friend.repository';
import { UserRepository } from 'src/user/repository/users.repository';
import { UserService } from 'src/user/user.service';
import { EventsGateway } from './events.gateway';
import { EventsService } from './events.service';
import { BanRepository } from './repository/ban.repository';
import { ChatRepository } from './repository/chat.repository';
import { ChatUserRepository } from './repository/chatuser.repository';

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

const banRepo = {
  provide: 'IBanRepository',
  useClass: BanRepository,
};

@Module({
  imports: [TypeOrmModule.forFeature([Users, Friend, Chat, ChatUser, Ban])],
  providers: [
    EventsGateway,
    EventsService,
    UserService,
    userRepo,
    friendRepo,
    chatRepo,
    chatUserRepo,
    banRepo,
  ],
})
export class EventsModule {}
