import { InjectRepository } from '@nestjs/typeorm';
import { UserDto } from 'src/dto/user.dto';
import { JoinType } from 'src/entity/common.enum';
import { Game } from 'src/entity/game.entity';
import { Users } from 'src/entity/user.entity';
import { Repository } from 'typeorm';

export class UserRepository {
  constructor(
    @InjectRepository(Users)
    private userRepository: Repository<Users>,
  ) {}

  userToUserDto(user: Users) {
    if (!user) return null;
    const userDto: UserDto = {
      user_id: user.user_id,
      intra_id: user.intra_id,
      profile: user.profile,
      introduce: user.introduce,
      normal_win: user.normal_win,
      normal_lose: user.normal_lose,
      rank_win: user.rank_win,
      rank_lose: user.rank_lose,
    };
    return userDto;
  }

  async createUser(user_id: number, intra_id: string) {
    await this.userRepository.save({
      user_id: user_id,
      intra_id: intra_id,
      profile: '',
      introduce: '',
      normal_win: 0,
      normal_lose: 0,
      rank_win: 0,
      rank_lose: 0,
      join_type: JoinType.NONE,
    });
  }

  async findByIntraId(intra_id: string) {
    return await this.userRepository.findOneBy({ intra_id: intra_id });
  }

  async findByIntraIdWithJoin(intra_id: string) {
    return await this.userRepository.findOne({
      where: { intra_id: intra_id },
      relations: ['play_game', 'watch_game'],
    });
  }

  async updateOwnGameById(id: number, game: Game) {
    await this.userRepository.update(id, {
      play_game: game,
      join_type: JoinType.OWNER,
    });
  }

  async updatePlayGameById(id: number, game: Game) {
    await this.userRepository.update(id, {
      play_game: game,
      join_type: JoinType.PLAYER,
    });
  }

  async updateWatchGameById(id: number, game: Game) {
    await this.userRepository.update(id, {
      watch_game: game,
      join_type: JoinType.WATCHER,
    });
  }

  async updateGameNoneById(id: number) {
    await this.userRepository.update(id, {
      play_game: null,
      watch_game: null,
      join_type: JoinType.NONE,
    });
  }

  async updateNormalWin(id: number, win: number) {
    await this.userRepository.update(id, { normal_win: win + 1 });
  }

  async updateNormalLose(id: number, lose: number) {
    await this.userRepository.update(id, { normal_lose: lose + 1 });
  }

  async updateRankWin(id: number, win: number) {
    await this.userRepository.update(id, { rank_win: win + 1 });
  }

  async updateRankLose(id: number, lose: number) {
    await this.userRepository.update(id, { rank_lose: lose + 1 });
  }

  async updateProfileImage(intra_id: string, filename: string) {
    await this.userRepository.update(
      { intra_id: intra_id },
      { profile: filename },
    );
  }

  async updateUserIntroduce(intra_id: string, introduce: string) {
    await this.userRepository.update({ intra_id }, { introduce });
  }
}
