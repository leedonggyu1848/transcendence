import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from 'src/entity/game.entity';
import { User } from 'src/entity/user.entity';
import { GameRepository } from './repository/game.repository';
import { UserService } from 'src/user/user.service';
import { UserRepository } from 'src/user/repository/user.repository';
import { Record } from 'src/entity/record.entity';
import { RecordRepository } from 'src/record/repository/record.repository';
import { RecordService } from 'src/record/record.service';

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

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([User, Game, Record])],
  controllers: [GameController],
  providers: [
    userRepo,
    gameRepo,
    recordRepo,
    GameService,
    UserService,
    RecordService,
  ],
})
export class GameModule {}
