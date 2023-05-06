import { Inject, Injectable } from '@nestjs/common';
import { Ban } from 'src/entity/ban.entity';
import { Chat } from 'src/entity/chat.entity';
import { IsolationLevel, Transactional } from 'typeorm-transactional';
import { IBanRepository } from './repository/ban.interface.repository';

@Injectable()
export class BanService {
  constructor(
    @Inject('IBanRepository')
    private banRepository: IBanRepository,
  ) {}

  @Transactional({ isolationLevel: IsolationLevel.REPEATABLE_READ })
  async addBanUser(chat: Chat, userName: string) {
    await this.banRepository.addBanUser(chat, userName);
  }

  @Transactional({ isolationLevel: IsolationLevel.REPEATABLE_READ })
  async deleteBanUser(banUser: Ban) {
    await this.banRepository.deleteBanUser(banUser);
  }
}
