import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { UserSessionDto } from 'src/dto/usersession.dto';
import { JoinType } from 'src/entity/common.enum';
import { Users } from 'src/entity/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
  ) {}

  async findUserById(id: number) {
    return this.usersRepository.findOneBy({ id: id });
  }

  async findUserByUserId(user_id: number) {
    return this.usersRepository.findOneBy({ user_id: user_id });
  }

  async findUserByIntraId(intra_id: string) {
    return this.usersRepository.findOneBy({ intra_id: intra_id });
  }

  async addUser(user: UserSessionDto) {
    const found = await this.findUserByUserId(user.user_id);
    if (!found) {
      await this.usersRepository.save({
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
