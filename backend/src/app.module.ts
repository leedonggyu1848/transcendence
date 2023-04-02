import { Module } from '@nestjs/common';
import { DataModule } from './game/game.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeORMConfig } from './configs/typeorm.config';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import configurations from './configs/configurations';

@Module({
  imports: [
    AuthModule,
    DataModule,
    ConfigModule.forRoot({
      load: [configurations],
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(typeORMConfig),
  ],
})
export class AppModule {}
