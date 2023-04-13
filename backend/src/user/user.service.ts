import { Inject, Injectable } from '@nestjs/common';
import { UserSessionDto } from 'src/dto/usersession.dto';
import { IUserRepository } from './repository/users.interface.repository';
import * as fs from 'fs';

@Injectable()
export class UserService {
  constructor(
    @Inject('IUserRepository')
    private userRepository: IUserRepository,
  ) {}

  async findUser(intra_id: string) {
    return this.userRepository.findByIntraId(intra_id);
  }

  async findUserWithGame(intra_id: string) {
    return this.userRepository.findByIntraIdWithJoin(intra_id);
  }

  async addUserFromSession(user: UserSessionDto) {
    const found = await this.findUserWithGame(user.intra_id);
    if (!found) {
      await this.userRepository.createUser(user.user_id, user.intra_id);
    }
  }

  async updateProfileImage(user: UserSessionDto, image: Express.Multer.File) {
    const found = await this.findUser(user.intra_id);
    const imagePath = './uploads/' + user.intra_id + '.png';
    fs.writeFile(imagePath, image.buffer, function (err) {
      if (err) return { success: false, data: err };
    });
    await this.userRepository.updateProfileImage(found.id, imagePath);
    return { success: true, data: null };
  }

  async updateUserIntroduce(user: UserSessionDto, detail: string) {
    const found = await this.findUser(user.intra_id);
    await this.userRepository.updateUserIntroduce(found.id, detail);
  }
}
