import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ban } from 'src/entity/ban.entity';
import { BanRepository } from 'src/events/repository/ban.repository';
import { EventsService } from './ban.service';

const banRepo = {
  provide: 'IBanRepository',
  useClass: BanRepository,
};

@Module({
  imports: [TypeOrmModule.forFeature([Ban])],
  providers: [EventsService, banRepo],
})
export class BanModule {}
