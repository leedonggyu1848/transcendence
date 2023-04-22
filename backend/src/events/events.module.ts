import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BanModule } from 'src/ban/ban.module';
import { BanService } from 'src/ban/ban.service';
import { Ban } from 'src/entity/ban.entity';
import { Block } from 'src/entity/block.entity';
import { Chat } from 'src/entity/chat.entity';
import { ChatUser } from 'src/entity/chatuser.entity';
import { Friend } from 'src/entity/friend.entity';
import { Game } from 'src/entity/game.entity';
import { Record } from 'src/entity/record.entity';
import { User } from 'src/entity/user.entity';
import { friendModule } from 'src/friend/friend.module';
import { FriendService } from 'src/friend/friend.service';
import { GameService } from 'src/game/game.service';
import { GameRepository } from 'src/game/repository/game.repository';
import { RecordRepository } from 'src/game/repository/record.repository';
import { UserRepository } from 'src/user/repository/user.repository';
import { UserService } from 'src/user/user.service';
import { EventsGateway } from './events.gateway';
import { EventsService } from './events.service';
import { BlockRepository } from './repository/block.repository';
import { ChatRepository } from './repository/chat.repository';
import { ChatUserRepository } from './repository/chatuser.repository';
import { FriendRepository } from './repository/friend.repository';

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

const blockRepo = {
  provide: 'IBlockRepository',
  useClass: BlockRepository,
};

@Module({
  imports: [
    BanModule,
    friendModule,
    TypeOrmModule.forFeature([User, Game, Record, Chat, ChatUser, Block]),
  ],
  providers: [
    EventsGateway,
    EventsService,
    UserService,
    GameService,
    userRepo,
    gameRepo,
    recordRepo,
    chatRepo,
    chatUserRepo,
    blockRepo,
  ],
})
export class EventsModule {}
