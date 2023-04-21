import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ban } from 'src/entity/ban.entity';
import { Block } from 'src/entity/block.entity';
import { Chat } from 'src/entity/chat.entity';
import { ChatUser } from 'src/entity/chatuser.entity';
import { Friend } from 'src/entity/friend.entity';
import { Game } from 'src/entity/game.entity';
import { Record } from 'src/entity/record.entity';
import { User } from 'src/entity/user.entity';
import { GameService } from 'src/game/game.service';
import { GameRepository } from 'src/game/repository/game.repository';
import { RecordRepository } from 'src/game/repository/record.repository';
import { UserRepository } from 'src/user/repository/user.repository';
import { UserService } from 'src/user/user.service';
import { EventsGateway } from './events.gateway';
import { EventsService } from './events.service';
import { BanRepository } from './repository/ban.repository';
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

const banRepo = {
  provide: 'IBanRepository',
  useClass: BanRepository,
};

const blockRepo = {
  provide: 'IBlockRepository',
  useClass: BlockRepository,
};

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Game,
      Record,
      Friend,
      Chat,
      ChatUser,
      Ban,
      Block,
    ]),
  ],
  providers: [
    EventsGateway,
    EventsService,
    UserService,
    GameService,
    userRepo,
    gameRepo,
    recordRepo,
    friendRepo,
    chatRepo,
    chatUserRepo,
    banRepo,
    blockRepo,
  ],
})
export class EventsModule {}
