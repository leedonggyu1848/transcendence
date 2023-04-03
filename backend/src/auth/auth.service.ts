import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { UserSessionDto } from 'src/dto/usersession.dto';
import { JoinType } from 'src/entity/common.enum';
import { User } from 'src/entity/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findUserById(id: number) {
    return this.userRepository.findOneBy({ id: id });
  }

  async findUserByUserId(user_id: number) {
    return this.userRepository.findOneBy({ user_id: user_id });
  }

  async findUserByIntraId(intra_id: string) {
    return this.userRepository.findOneBy({ intra_id: intra_id });
  }

  async addUser(user: UserSessionDto) {
    const found = await this.findUserByUserId(user.user_id);
    if (!found) {
      await this.userRepository.save({
        user_id: user.user_id,
        intra_id: user.intra_id,
        profile: '',
        introduce: '',
        normal_win: 0,
        normal_lose: 0,
        rank_win: 0,
        rank_lose: 0,
        join_type: JoinType.NONE,
      });
    }
  }
}
