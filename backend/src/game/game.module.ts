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

const userRepo = {
  provide: 'IUserRepository',
  useClass: UserRepository,
};

const gameRepo = {
  provide: 'IGameRepository',
  useClass: GameRepository,
};

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([Users, Game])],
  controllers: [GameController],
  providers: [userRepo, gameRepo, GameService, UserService],
})
export class GameModule {}
