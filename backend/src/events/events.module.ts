import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BanModule } from 'src/ban/ban.module';
import { Block } from 'src/entity/block.entity';
import { Chat } from 'src/entity/chat.entity';
import { ChatUser } from 'src/entity/chatuser.entity';
import { Game } from 'src/entity/game.entity';
import { Record } from 'src/entity/record.entity';
import { friendModule } from 'src/friend/friend.module';
import { GameService } from 'src/game/game.service';
import { GameRepository } from 'src/game/repository/game.repository';
import { RecordRepository } from 'src/game/repository/record.repository';
import { UserService } from 'src/user/user.service';
import { EventsGateway } from './events.gateway';
import { EventsService } from './events.service';
import { BlockRepository } from './repository/block.repository';
import { ChatRepository } from './repository/chat.repository';
import { ChatUserRepository } from './repository/chatuser.repository';

const gameRepo = {
  provide: 'IGameRepository',
  useClass: GameRepository,
};

const recordRepo = {
  provide: 'IRecordRepository',
  useClass: RecordRepository,
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
    TypeOrmModule.forFeature([Game, Record, Chat, ChatUser, Block]),
  ],
  providers: [
    EventsGateway,
    EventsService,
    GameService,
    gameRepo,
    recordRepo,
    chatRepo,
    chatUserRepo,
    blockRepo,
  ],
})
export class EventsModule {}
