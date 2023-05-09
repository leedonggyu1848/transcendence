import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Administrator } from 'src/entity/administrator.entity';
import { UserModule } from 'src/user/user.module';
import { AdministratorService } from './administrator.service';
import { AdministratorRepository } from './repository/administrator.repository';

const adminRepo = {
  provide: 'IAdministratorRepository',
  useClass: AdministratorRepository,
};

@Module({
  imports: [UserModule, TypeOrmModule.forFeature([Administrator])],
  providers: [AdministratorService, adminRepo],
  exports: [AdministratorService, adminRepo],
})
export class AdministratorModule {}
