import { Module } from '@nestjs/common';
import { GameModule } from './game/game.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import TypeOrmConfigService from './configs/typeorm.config';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import configurations from './configs/configurations';
import { EventsModule } from './events/events.module';
import { DataSource } from 'typeorm';

@Module({
  imports: [
    UserModule,
    GameModule,
    EventsModule,
    ConfigModule.forRoot({
      load: [configurations],
      isGlobal: true,
      envFilePath: `.env`,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: TypeOrmConfigService,
      async dataSourceFactory(options) {
        if (!options) {
          throw new Error('No options');
        }
        return addTransactionalDataSource(new DataSource(options));
      },
    }),
  ],
})
export class AppModule {}
