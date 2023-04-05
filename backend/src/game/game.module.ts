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
  imports: [HttpModule, TypeOrmModule.forFeature([Users, Game, Record])],
  controllers: [GameController],
  providers: [userRepo, gameRepo, recordRepo, GameService, UserService],
})
export class GameModule {}
