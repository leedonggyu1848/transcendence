import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from 'src/entity/game.entity';
import { Users } from 'src/entity/user.entity';
import { GameRepository } from './repository/game.repository';
import { UserService } from 'src/user/user.service';
import { UserModule } from 'src/user/user.module';
import { UserRepository } from 'src/user/repository/users.repository';
import { RecordRepository } from './repository/record.repository';
import { Record } from 'src/entity/record.entity';
import { ChatRepository } from './repository/chat.repository';
import { Chat } from 'src/entity/chat.entity';
import { ChatUser } from 'src/entity/chatuser.entity';
import { ChatUserRepository } from './repository/chatuser.repository';

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

const chatRepo = {
  provide: 'IChatRepository',
  useClass: ChatRepository,
};

const chatUser = {
  provide: 'IChatUserRepository',
  useClass: ChatUserRepository,
};

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([Users, Game, Record, Chat, ChatUser]),
  ],
  controllers: [GameController],
  providers: [
    userRepo,
    gameRepo,
    recordRepo,
    chatRepo,
    GameService,
    UserService,
  ],
})
export class GameModule {}
