import { Module } from '@nestjs/common';
import { GameModule } from './game/game.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeORMConfig } from './configs/typeorm.config';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import configurations from './configs/configurations';
import { EventsModule } from './events/events.module';
import { FriendModule } from './friend/friend.module';

@Module({
  imports: [
    UserModule,
    GameModule,
    FriendModule,
    EventsModule,
    ConfigModule.forRoot({
      load: [configurations],
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(typeORMConfig),
  ],
})
export class AppModule {}
