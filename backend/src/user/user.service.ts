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

  async findUserByIntraId(intra_id: string) {
    return this.userRepository.findByIntraId(intra_id);
  }

  async findUserBySocketId(socket_id: string) {
    return this.userRepository.findBySocketId(socket_id);
  }

  async findUserWithGame(intra_id: string) {
    return this.userRepository.findByIntraIdWithJoinGame(intra_id);
  }

  async addUserFromSession(user: UserSessionDto) {
    const found = await this.findUserWithGame(user.intra_id);
    if (!found) {
      await this.userRepository.createUser(user.user_id, user.intra_id);
    }
  }

  async updateProfileImage(user: UserSessionDto, image: Express.Multer.File) {
    let found = await this.findUserByIntraId(user.intra_id);
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
    found = await this.findUserByIntraId(user.intra_id);
    return { success: true, data: found };
  }

  async updateUserIntroduce(user: UserSessionDto, introduce: string) {
    let found = await this.findUserByIntraId(user.intra_id);
    await this.userRepository.updateUserIntroduce(found.id, introduce);
  }
}
