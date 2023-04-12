import { Inject, Injectable } from '@nestjs/common';
import { stringify } from 'querystring';
import { UserSessionDto } from 'src/dto/usersession.dto';
import { IUserRepository } from './repository/users.interface.repository';

@Injectable()
export class UserService {
  constructor(
    @Inject('IUserRepository')
    private userRepository: IUserRepository,
  ) {}

  async findUser(intra_id: string) {
    return this.userRepository.findByIntraIdWithJoin(intra_id);
  }

  async addUserFromSession(user: UserSessionDto) {
    const found = await this.findUser(user.intra_id);
    if (!found) {
      await this.userRepository.createUser(user.user_id, user.intra_id);
    }
  }

  async updateProfileImage(intra_id: string, filename: string) {
    await this.userRepository.updateProfileImage(intra_id, filename);
  }

  async findUserInfo(intra_id: string) {
    return this.userRepository.findByIntraId(intra_id);
  }

  async updateUserIntroduce(intra_id: string, detail: string) {
    await this.userRepository.updateUserIntroduce(intra_id, detail);
  }
}
