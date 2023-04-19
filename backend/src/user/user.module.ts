import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entity/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PhStrategy } from './ft/auth.strategy';
import { JwtStrategy } from './jwt/jwt.strategy';
import { UserRepository } from './repository/user.repository';

const userRepo = {
  provide: 'IUserRepository',
  useClass: UserRepository,
};

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: `${configService.get<string>('jwt.expire')}s`,
        },
      }),
    }),
  ],
  controllers: [UserController],
  providers: [PhStrategy, JwtStrategy, ConfigService, UserService, userRepo],
})
export class UserModule {}
