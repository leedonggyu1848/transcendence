import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Block } from 'src/entity/block.entity';
import { BlockRepository } from './repository/block.repository';
import { BlockService } from './block.service';

const blockRepo = {
  provide: 'IBlockRepository',
  useClass: BlockRepository,
};

@Module({
  imports: [TypeOrmModule.forFeature([Block])],
  providers: [BlockService, blockRepo],
  exports: [BlockService, blockRepo],
})
export class BlockModule {}
