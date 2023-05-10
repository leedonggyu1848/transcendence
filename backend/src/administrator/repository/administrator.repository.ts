import { InjectRepository } from '@nestjs/typeorm';
import { Administrator } from 'src/entity/administrator.entity';
import { Chat } from 'src/entity/chat.entity';
import { User } from 'src/entity/user.entity';
import { Repository } from 'typeorm';
import { IAdministratorRepository } from './administrator.interface.repository';

export class AdministratorRepository implements IAdministratorRepository {
  constructor(
    @InjectRepository(Administrator)
    private administratorRepository: Repository<Administrator>,
  ) {}

  async addAdministrator(chat: Chat, user: User) {
    const data = this.administratorRepository.create({
      chat: chat,
      userId: user.userId,
    });
    await this.administratorRepository.save(data);
  }

  async findAll() {
    return await this.administratorRepository.find();
  }

  async deleteAdministrator(admin: Administrator) {
    await this.administratorRepository.remove(admin);
  }
}
