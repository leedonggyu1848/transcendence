import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from 'src/entity/game.entity';
import { User } from 'src/entity/user.entity';
import { GameRepository } from './repository/game.repository';
import { Record } from 'src/entity/record.entity';
import { RecordModule } from 'src/record/record.module';
import { UserModule } from 'src/user/user.module';

const gameRepo = {
  provide: 'IGameRepository',
  useClass: GameRepository,
};

@Module({
  imports: [
    HttpModule,
    UserModule,
    RecordModule,
    TypeOrmModule.forFeature([Game]),
  ],
  controllers: [GameController],
  providers: [gameRepo, GameService],
  exports: [gameRepo, GameService],
})
export class GameModule {}
