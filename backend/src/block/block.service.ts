import { Inject, Injectable } from '@nestjs/common';
import { User } from 'src/entity/user.entity';
import { IBlockRepository } from 'src/events/repository/block.interface.repository';
import { UserService } from 'src/user/user.service';

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

  async blockUser(user: User, blockUser: string) {
    const isBan = user.blockUsers.filter(
      (block) => block.blockUser === blockUser,
    );
    if (isBan.length !== 0) return false;
    await this.blockRepository.addBlockUser(user, blockUser);
    return true;
  }

  async blockCancel(user: User, blockUser: string) {
    const block = user.blockUsers.find(
      (block) => block.blockUser === blockUser,
    );
    if (!block) return false;
    await this.blockRepository.deleteBlockUser(block);
    return true;
  }
}
