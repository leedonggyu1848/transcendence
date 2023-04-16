import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from 'src/entity/user.entity';
import { UserRepository } from 'src/user/repository/users.repository';
import { EventsGateway } from './events.gateway';

const userRepo = {
  provide: 'IUserRepository',
  useClass: UserRepository,
};

@Module({
  imports: [TypeOrmModule.forFeature([Users])],
  providers: [EventsGateway, userRepo],
})
export class EventsModule {}
