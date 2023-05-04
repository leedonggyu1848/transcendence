import { Module } from '@nestjs/common';
import { BanModule } from 'src/ban/ban.module';
import { BlockModule } from 'src/block/block.module';
import { ChatModule } from 'src/chat/chat.module';
import { FriendModule } from 'src/friend/friend.module';
import { GameModule } from 'src/game/game.module';
import { RecordModule } from 'src/record/record.module';
import { UserModule } from 'src/user/user.module';
import { EventsGateway } from './events.gateway';
import { EventsService } from './events.service';

@Module({
  imports: [
    UserModule,
    BanModule,
    BlockModule,
    FriendModule,
    RecordModule,
    GameModule,
    ChatModule,
  ],
  providers: [EventsGateway, EventsService],
})
export class EventsModule {}
