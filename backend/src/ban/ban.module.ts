import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ban } from 'src/entity/ban.entity';
import { BanService } from './ban.service';
import { BanRepository } from './repository/ban.repository';

const banRepo = {
  provide: 'IBanRepository',
  useClass: BanRepository,
};

@Module({
  imports: [TypeOrmModule.forFeature([Ban])],
  providers: [BanService, banRepo],
  exports: [banRepo, BanService],
})
export class BanModule {}
