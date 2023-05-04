import { Inject, Injectable } from '@nestjs/common';
import { UserSessionDto } from 'src/dto/usersession.dto';
import * as fs from 'fs';
import { IUserRepository } from './repository/user.interface.repository';
import { User } from 'src/entity/user.entity';
import { UserDto } from 'src/dto/user.dto';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { Game } from 'src/entity/game.entity';
import { GameType } from 'src/entity/common.enum';
import { IsolationLevel, Transactional } from 'typeorm-transactional';

@Injectable()
export class UserService {
  private tfauthMap = {};
  constructor(
    private configService: ConfigService,
    @Inject('IUserRepository')
    private userRepository: IUserRepository,
  ) {}

  userToUserDto(user: User) {
    if (!user) return null;
    const userDto: UserDto = {
      userId: user.userId,
      userName: user.userName,
      profile: user.profile,
      introduce: user.introduce,
      normalWin: user.normalWin,
      normalLose: user.normalLose,
      rankWin: user.rankWin,
      rankLose: user.rankLose,
    };
    return userDto;
  }

  @Transactional({ isolationLevel: IsolationLevel.REPEATABLE_READ })
  async addUserFromSession(user: UserSessionDto) {
    const found = await this.userRepository.findByUserIdWithJoinGame(
      user.userId,
    );
    if (found) return found;
    else
      return await this.userRepository.createUser(
        user.userId,
        user.intraId,
        user.email,
      );
  }

  @Transactional({ isolationLevel: IsolationLevel.REPEATABLE_READ })
  async sendAuthMail(user: User) {
    const mailer = require('nodemailer');
    const uuid = randomUUID().toString();
    const key = uuid.slice(0, 6);
    this.tfauthMap[user.id] = key;
    const transporter = mailer.createTransport({
      service: 'gmail',
      host: 'smtp@gmail.com',
      port: 465,
      auth: {
        user: this.configService.get<string>('tf.email.id'),
        pass: this.configService.get<string>('tf.email.password'),
      },
      secure: true,
    });
    const sendMail = (email) => {
      let mailOptions = {
        to: email,
        subject: 'PH18 Pong 로그인',
        text:
          'PH18 Pong 2차 인증 코드입니다.\n' +
          '************************\n' +
          '**         ' +
          key +
          '         **\n' +
          '************************',
      };
      transporter.sendMail(mailOptions, function (err, info) {
        if (err) this.logger.error(err);
        else this.logger.log(email + ': ' + info.response);
      });
    };
    sendMail(user.email);
    this.tfauthMap[user.id] = key;
    setTimeout(() => {
      delete this.tfauthMap[user.id];
    }, 300000);
  }

  @Transactional({ isolationLevel: IsolationLevel.REPEATABLE_READ })
  async checkAuthCode(userSession: UserSessionDto, code: string) {
    const user = await this.userRepository.findByUserId(userSession.userId);
    if (this.tfauthMap[user.id] === code) {
      await this.userRepository.updateAuth(user.id, true);
      delete this.tfauthMap[user.id];
      return true;
    }
    return user.auth;
  }

  async getUserByUserId(userId: number) {
    return await this.userRepository.findByUserId(userId);
  }

  async getUserByUserName(userName: string) {
    return await this.userRepository.findByUserName(userName);
  }

  async getUserBySocketId(socketId: string) {
    return await this.userRepository.findBySocketId(socketId);
  }

  async getUserDtoByUserName(userName: string) {
    const user = await this.userRepository.findByUserName(userName);
    return this.userToUserDto(user);
  }

  async getUserDtoByUserId(userId: number) {
    const user = await this.userRepository.findByUserId(userId);
    return this.userToUserDto(user);
  }

  async getUserByUserNameWithGame(userName: string) {
    return await this.userRepository.findByUserNameWithJoinGame(userName);
  }

  async getUserBySocketIdWithGame(socketId: string) {
    return await this.userRepository.findBySocketIdWithJoinGame(socketId);
  }

  async getUserByUserNameWithChat(userName: string) {
    return await this.userRepository.findByUserNameWithJoinChat(userName);
  }

  async getUserBySocketIdWithChat(socketId: string) {
    return await this.userRepository.findBySocketIdWithJoinChat(socketId);
  }

  async getUserByUserNameWithAll(userName: string) {
    return await this.userRepository.findByUserNameWithJoinAll(userName);
  }

  async getUserBySocketIdWithAll(socketId: string) {
    return await this.userRepository.findBySocketIdWithJoinAll(socketId);
  }

  async getUserByUserNameWithFriend(userName: string) {
    return await this.userRepository.findByUserNameWithJoinFriend(userName);
  }

  async getUserBySocketIdWithFriend(socketId: string) {
    return await this.userRepository.findBySocketIdWithJoinFriend(socketId);
  }

  async getUserByUserNameWithBlock(userName: string) {
    return await this.userRepository.findByUserNameWithJoinBlock(userName);
  }

  async getUserBySocketIdWithBlock(socketId: string) {
    return await this.userRepository.findBySocketIdWithJoinBlock(socketId);
  }

  async updateSocketId(user: User, socketId: string) {
    await this.userRepository.updateSocketId(user.id, socketId);
  }

  async updateUserName(user: User, userName: string) {
    const found = await this.userRepository.findByUserName(userName);
    if (found) return false;
    await this.userRepository.updateUserName(user.id, userName);
    return true;
  }

  async updateProfileImage(user: User, image: Express.Multer.File) {
    if (user.profile) fs.unlinkSync('./uploads/' + user.profile);
    const timeValue = new Date().getTime().toString();
    const imagePath = `./uploads/${user.userId}-${timeValue}.png`;
    fs.writeFile(imagePath, image.buffer, function () {});
    const findPath = `${user.userId}-${timeValue.toString()}.png`;
    await this.userRepository.updateProfileImage(user.id, findPath);
    const data = await this.getUserByUserName(user.userName);
    return { userInfo: this.userToUserDto(data), findPath };
  }

  @Transactional({ isolationLevel: IsolationLevel.REPEATABLE_READ })
  async updateUserIntroduce(user: UserSessionDto, introduce: string) {
    let found = await this.userRepository.findByUserId(user.userId);
    await this.userRepository.updateUserIntroduce(found.id, introduce);
  }

  async updateGameNone(user: User) {
    await this.userRepository.updateGameNone(user.id);
  }

  async updateOwnGame(user: User, game: Game) {
    await this.userRepository.updateOwnGame(user.id, game);
  }

  async updatePlayGame(user: User, game: Game) {
    await this.userRepository.updatePlayGame(user.id, game);
  }

  async updateWatchGame(user: User, game: Game) {
    await this.userRepository.updateWatchGame(user.id, game);
  }

  async updateGameWin(user: User, type: GameType) {
    if (type === GameType.NORMAL)
      await this.userRepository.updateNormalWin(user.id, user.normalWin);
    else await this.userRepository.updateRankWin(user.id, user.normalLose);
  }

  async updateGameLose(user: User, type: GameType) {
    if (type === GameType.NORMAL)
      await this.userRepository.updateNormalLose(user.id, user.normalWin);
    else await this.userRepository.updateRankLose(user.id, user.normalLose);
  }
}
