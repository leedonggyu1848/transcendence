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
      user_id: user.user_id,
      intra_id: user.intra_id,
      profile: user.profile,
      introduce: user.introduce,
      normal_win: user.normal_win,
      normal_lose: user.normal_lose,
      rank_win: user.rank_win,
      rank_lose: user.rank_lose,
    };
    return userDto;
  }

  async getUserByIntraId(intra_id: string) {
    return await this.userRepository.findByIntraId(intra_id);
  }

  async getUserBySocketId(socket_id: string) {
    return await this.userRepository.findBySocketId(socket_id);
  }

  async getUserByIntraIdWithGame(intra_id: string) {
    return await this.userRepository.findByIntraIdWithJoinGame(intra_id);
  }

  async getUserBySocketIdWithGame(socketId: string) {
    return await this.userRepository.findBySocketIdWithJoinGame(socketId);
  }

  async getUserByIntraIdWithChat(intra_id: string) {
    return await this.userRepository.findByIntraIdWithJoinChat(intra_id);
  }

  async getUserBySocketIdWithChat(socketId: string) {
    return await this.userRepository.findBySocketIdWithJoinChat(socketId);
  }

  async getUserByIntraIdWithAll(intra_id: string) {
    return await this.userRepository.findByIntraIdWithJoinAll(intra_id);
  }

  async getUserBySocketIdWithAll(socketId: string) {
    return await this.userRepository.findBySocketIdWithJoinAll(socketId);
  }

  async getUserByIntraIdWithFriend(intra_id: string) {
    return await this.userRepository.findByIntraIdWithJoinFriend(intra_id);
  }

  async getUserBySocketIdWithFriend(socketId: string) {
    return await this.userRepository.findBySocketIdWithJoinFriend(socketId);
  }

  async getUserByIntraIdWithBlock(intra_id: string) {
    return await this.userRepository.findByIntraIdWithJoinBlock(intra_id);
  }

  async getUserBySocketIdWithBlock(socketId: string) {
    return await this.userRepository.findBySocketIdWithJoinBlock(socketId);
  }

  async addUserFromSession(user: UserSessionDto) {
    const found = await this.getUserByIntraIdWithGame(user.intra_id);
    if (!found) {
      await this.userRepository.createUser(user.user_id, user.intra_id);
    }
  }

  async updateProfileImage(user: UserSessionDto, image: Express.Multer.File) {
    let found = await this.getUserByIntraId(user.intra_id);
    if (found.profile) {
      fs.unlinkSync('./uploads/' + found.profile);
    }
    const timeVal = new Date().getTime();
    const imagePath =
      './uploads/' + user.intra_id + timeVal.toString() + '.png';
    fs.writeFile(imagePath, image.buffer, function (err) {
      if (err) return { success: false, data: err };
    });
    const findPath = user.intra_id + timeVal.toString() + '.png';
    await this.userRepository.updateProfileImage(found.id, findPath);
    found = await this.getUserByIntraId(user.intra_id);
    return { success: true, data: found };
  }

  async updateUserIntroduce(user: UserSessionDto, introduce: string) {
    let found = await this.getUserByIntraId(user.intra_id);
    await this.userRepository.updateUserIntroduce(found.id, introduce);
  }
}
