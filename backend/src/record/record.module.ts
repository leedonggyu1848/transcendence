import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Record } from 'src/entity/record.entity';
import { UserModule } from 'src/user/user.module';
import { RecordService } from './record.service';
import { RecordRepository } from './repository/record.repository';

const recordRepo = {
  provide: 'IRecordRepository',
  useClass: RecordRepository,
};

@Module({
  imports: [UserModule, TypeOrmModule.forFeature([Record])],
  providers: [RecordService, recordRepo],
  exports: [RecordService, recordRepo],
})
export class RecordModule {}
