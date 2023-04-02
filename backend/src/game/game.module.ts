import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { DataController } from './game.controller';
import { DataService } from './game.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entity/user.entity';
import { Game } from 'src/entity/game.entity';

@Module({
	imports: [
		HttpModule,
		TypeOrmModule.forFeature([User, Game]),
	],
	controllers: [DataController],
	providers: [DataService],
})
export class DataModule {}
