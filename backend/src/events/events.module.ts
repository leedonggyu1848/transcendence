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
import { RecordModule } from 'src/record/record.module';
import { RecordRepository } from 'src/record/repository/record.repository';
import { UserModule } from 'src/user/user.module';
import { EventsGateway } from './events.gateway';
import { EventsService } from './events.service';
import { BlockRepository } from './repository/block.repository';
import { ChatRepository } from './repository/chat.repository';
import { ChatUserRepository } from './repository/chatuser.repository';

const gameRepo = {
  provide: 'IGameRepository',
  useClass: GameRepository,
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
    UserModule,
    BanModule,
    friendModule,
    RecordModule,
    TypeOrmModule.forFeature([Game, Chat, ChatUser, Block]),
  ],
  providers: [
    EventsGateway,
    EventsService,
    GameService,
    gameRepo,
    chatRepo,
    chatUserRepo,
    blockRepo,
  ],
})
export class EventsModule {}
