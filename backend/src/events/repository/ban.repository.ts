import { InjectRepository } from '@nestjs/typeorm';
import { Ban } from 'src/entity/ban.entity';
import { Chat } from 'src/entity/chat.entity';
import { Repository } from 'typeorm';
import { IBanRepository } from './ban.interface.repository';

export class BanRepository implements IBanRepository {
  constructor(@InjectRepository(Ban) private banRepository: Repository<Ban>) {}

  async addBanUser(chat: Chat, username: string) {
    const data = await this.banRepository.create({
      channel: chat,
      username: username,
    });
    await this.banRepository.save(data);
    return data;
  }

  async deleteBanUser(id: number) {
    await this.banRepository.delete(id);
  }
}