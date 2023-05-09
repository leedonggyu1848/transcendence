import { Inject, Injectable } from '@nestjs/common';
import { Administrator } from 'src/entity/administrator.entity';
import { Chat } from 'src/entity/chat.entity';
import { User } from 'src/entity/user.entity';
import { IAdministratorRepository } from './repository/administrator.interface.repository';

@Injectable()
export class AdministratorService {
  constructor(
    @Inject('IAdministratorRepository')
    private administratorRepository: IAdministratorRepository,
  ) {}

  async addAdministrator(chat: Chat, user: User) {
    await this.administratorRepository.addAdministrator(chat, user);
  }

  async subtractAdministrator(admin: Administrator) {
    await this.administratorRepository.deleteAdministrator(admin);
  }
}
