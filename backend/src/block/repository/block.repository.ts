import { InjectRepository } from '@nestjs/typeorm';
import { Block } from 'src/entity/block.entity';
import { User } from 'src/entity/user.entity';
import { Repository } from 'typeorm';
import { IBlockRepository } from './block.interface.repository';

export class BlockRepository implements IBlockRepository {
  constructor(
    @InjectRepository(Block) private blockRepository: Repository<Block>,
  ) {}

  async addBlockUser(user: User, blockUser: string) {
    const data = await this.blockRepository.create({
      user: user,
      blockUser: blockUser,
    });
    await this.blockRepository.save(data);
    return data;
  }

  async deleteBlockUser(blockUser: Block) {
    await this.blockRepository.remove(blockUser);
  }
}
