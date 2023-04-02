import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entity/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PhStrategy } from './ft/auth.strategy';
import { JwtStrategy } from './jwt/jwt.strategy';

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
          expiresIn: `${configService.get<string>('jwt.expire')}s`
        }
      })
    }),
  ],
  controllers: [AuthController],
  providers: [PhStrategy, JwtStrategy, ConfigService, AuthService]
})
export class AuthModule {}
