import { Inject, Injectable } from '@nestjs/common';
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
}
