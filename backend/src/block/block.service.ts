import { Inject, Injectable } from '@nestjs/common';
import { User } from 'src/entity/user.entity';
import { IBlockRepository } from 'src/block/repository/block.interface.repository';
import { IsolationLevel, Transactional } from 'typeorm-transactional';

@Injectable()
export class BlockService {
  constructor(
    @Inject('IBlockRepository')
    private blockRepository: IBlockRepository,
  ) {}

  async getBlockList(user: User) {
    const blockUsers = user.blockUsers.map((usr) => {
      return usr.user.blockUsers;
    });
    return blockUsers;
  }

  @Transactional({ isolationLevel: IsolationLevel.REPEATABLE_READ })
  async blockUser(user: User, blockUser: string) {
    const isBan = user.blockUsers.filter(
      (block) => block.blockUser === blockUser,
    );
    if (isBan.length !== 0) return false;
    await this.blockRepository.addBlockUser(user, blockUser);
    return true;
  }

  @Transactional({ isolationLevel: IsolationLevel.REPEATABLE_READ })
  async blockCancel(user: User, blockUser: string) {
    const block = user.blockUsers.find(
      (block) => block.blockUser === blockUser,
    );
    if (!block) return false;
    await this.blockRepository.deleteBlockUser(block);
    return true;
  }
}
