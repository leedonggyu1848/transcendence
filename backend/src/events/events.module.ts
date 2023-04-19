import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Server } from 'socket.io';
import { Ban } from 'src/entity/ban.entity';
import { Chat } from 'src/entity/chat.entity';
import { ChatUser } from 'src/entity/chatuser.entity';
import { Friend } from 'src/entity/friend.entity';
import { Game } from 'src/entity/game.entity';
import { Record } from 'src/entity/record.entity';
import { User } from 'src/entity/user.entity';
import { FriendService } from 'src/friend/friend.service';
import { FriendRepository } from 'src/friend/repository/friend.repository';
import { GameService } from 'src/game/game.service';
import { GameRepository } from 'src/game/repository/game.repository';
import { RecordRepository } from 'src/game/repository/record.repository';
import { UserRepository } from 'src/user/repository/user.repository';
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

const gameRepo = {
  provide: 'IGameRepository',
  useClass: GameRepository,
};

const recordRepo = {
  provide: 'IRecordRepository',
  useClass: RecordRepository,
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
  imports: [
    TypeOrmModule.forFeature([User, Game, Record, Friend, Chat, ChatUser, Ban]),
  ],
  providers: [
    EventsGateway,
    EventsService,
    UserService,
    GameService,
    FriendService,
    userRepo,
    gameRepo,
    recordRepo,
    friendRepo,
    chatRepo,
    chatUserRepo,
    banRepo,
  ],
})
export class EventsModule {}
