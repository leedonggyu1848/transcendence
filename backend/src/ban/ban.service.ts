import { Inject, Injectable } from '@nestjs/common';
import { Ban } from 'src/entity/ban.entity';
import { Chat } from 'src/entity/chat.entity';
import { Repository } from 'typeorm';
import { IBanRepository } from './repository/ban.interface.repository';

@Injectable()
export class BanService {
  constructor(
    @Inject('IBanRepository')
    private banRepository: IBanRepository,
  ) {}

  async addBanUser(chat: Chat, userName: string) {
    await this.banRepository.addBanUser(chat, userName);
  }

  async deleteBanUser(banUser: Ban) {
    await this.banRepository.deleteBanUser(banUser);
  }
}
