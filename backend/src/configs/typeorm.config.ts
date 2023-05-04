import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { Ban } from 'src/entity/ban.entity';
import { Block } from 'src/entity/block.entity';
import { Chat } from 'src/entity/chat.entity';
import { ChatUser } from 'src/entity/chatuser.entity';
import { Friend } from 'src/entity/friend.entity';
import { Game } from 'src/entity/game.entity';
import { Record } from 'src/entity/record.entity';
import { User } from 'src/entity/user.entity';

@Injectable()
export default class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions | Promise<TypeOrmModuleOptions> {
    return {
      type: 'postgres',
      host: this.configService.get<string>('database.host'),
      port: this.configService.get<number>('database.port'),
      username: this.configService.get<string>('database.username'),
      password: this.configService.get<string>('database.password'),
      database: this.configService.get<string>('database'),
      entities: [User, Game, Record, Friend, Chat, ChatUser, Ban, Block],
      synchronize: true,
    };
  }
}
