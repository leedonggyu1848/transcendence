import { Inject, Injectable } from '@nestjs/common';
import { UserSessionDto } from 'src/dto/usersession.dto';
import * as fs from 'fs';
import { IUserRepository } from './repository/user.interface.repository';
import { User } from 'src/entity/user.entity';
import { UserDto } from 'src/dto/user.dto';

@Injectable()
export class UserService {
  constructor(
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

  async getUserByUserName(userName: string) {
    return await this.userRepository.findByUserName(userName);
  }

  async getUserBySocketId(socketId: string) {
    return await this.userRepository.findBySocketId(socketId);
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

  async addUserFromSession(user: UserSessionDto) {
    const found = await this.userRepository.findByUserIdWithJoinGame(
      user.userId,
    );
    if (!found) {
      await this.userRepository.createUser(user.userId, user.intraId);
    }
  }

  async updateProfileImage(user: UserSessionDto, image: Express.Multer.File) {
    let found = await this.userRepository.findByUserId(user.userId);
    if (found.profile) {
      fs.unlinkSync('./uploads/' + found.profile);
    }
    const timeVal = new Date().getTime();
    const imagePath = './uploads/' + user.intraId + timeVal.toString() + '.png';
    fs.writeFile(imagePath, image.buffer, function (err) {
      if (err) return { success: false, data: err };
    });
    const findPath = user.intraId + timeVal.toString() + '.png';
    await this.userRepository.updateProfileImage(found.id, findPath);
    found = await this.getUserByUserName(user.intraId);
    return { success: true, data: found };
  }

  async updateUserIntroduce(user: UserSessionDto, introduce: string) {
    let found = await this.userRepository.findByUserId(user.userId);
    await this.userRepository.updateUserIntroduce(found.id, introduce);
  }
}
