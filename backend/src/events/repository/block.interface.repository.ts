import { Block } from 'src/entity/block.entity';
import { User } from 'src/entity/user.entity';

export interface IBlockRepository {
  addBlockUser(user: User, blockUser: string);
  deleteBlockUser(blockUser: Block);
}
