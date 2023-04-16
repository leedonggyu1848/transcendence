import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Chat } from 'src/entity/chat.entity';
import { ChatUser } from 'src/entity/chatuser.entity';
import { Friend } from 'src/entity/friend.entity';
import { Game } from 'src/entity/game.entity';
import { Record } from 'src/entity/record.entity';
import { Users } from 'src/entity/user.entity';

export const typeORMConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'postgres',
  port: 5432,
  username: 'postgres',
  password: 'qwe123',
  database: 'transcendence',
  entities: [Users, Game, Record, Friend, Chat, ChatUser],
  synchronize: true,
};
