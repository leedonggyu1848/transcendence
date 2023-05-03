import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BanModule } from 'src/ban/ban.module';
import { Block } from 'src/entity/block.entity';
import { Chat } from 'src/entity/chat.entity';
import { ChatUser } from 'src/entity/chatuser.entity';
import { friendModule } from 'src/friend/friend.module';
import { GameModule } from 'src/game/game.module';
import { RecordModule } from 'src/record/record.module';
import { UserModule } from 'src/user/user.module';
import { EventsGateway } from './events.gateway';
import { EventsService } from './events.service';
import { BlockRepository } from './repository/block.repository';
import { ChatRepository } from './repository/chat.repository';
import { ChatUserRepository } from './repository/chatuser.repository';

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
    GameModule,
    TypeOrmModule.forFeature([Chat, ChatUser, Block]),
  ],
  providers: [EventsGateway, EventsService, chatRepo, chatUserRepo, blockRepo],
})
export class EventsModule {}
