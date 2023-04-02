import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entity/user.entity';
import { Game } from 'src/entity/game.entity';
import { AuthService } from 'src/auth/auth.service';

@Module({
	imports: [
		HttpModule,
		TypeOrmModule.forFeature([User, Game]),
	],
	controllers: [GameController],
	providers: [GameService, AuthService],
})
export class GameModule {}
