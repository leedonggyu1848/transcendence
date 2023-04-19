import { InjectRepository } from '@nestjs/typeorm';
import { JoinType } from 'src/entity/common.enum';
import { Game } from 'src/entity/game.entity';
import { User } from 'src/entity/user.entity';
import { Repository } from 'typeorm';
import { IUserRepository } from './user.interface.repository';

export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createUser(user_id: number, intra_id: string) {
    await this.userRepository.save({
      user_id: user_id,
      intra_id: intra_id,
      socket_id: '',
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

  async findByIntraIdWithJoinGame(intra_id: string) {
    return await this.userRepository.findOne({
      where: { intra_id: intra_id },
      relations: ['play_game', 'watch_game'],
    });
  }

  async findByIntraIdWithJoinChat(intra_id: string) {
    return await this.userRepository.findOne({
      where: { intra_id: intra_id },
      relations: ['chats', 'chats.chat'],
    });
  }

  async findBySocketId(socket_id: string) {
    return await this.userRepository.findOneBy({ socket_id: socket_id });
  }

  async findBySocketIdWithJoinGame(socket_id: string) {
    return await this.userRepository.findOne({
      where: { socket_id: socket_id },
      relations: ['play_game', 'watch_game'],
    });
  }

  async findBySocketIdWithJoinChat(socket_id: string) {
    return await this.userRepository.findOne({
      where: { socket_id: socket_id },
      relations: ['chats', 'chats.chat', 'chats.user'],
    });
  }

  async updateSocketId(id: number, socket_id: string) {
    await this.userRepository.update(id, {
      socket_id: socket_id,
    });
  }

  async updateOwnGame(id: number, game: Game) {
    await this.userRepository.update(id, {
      play_game: game,
      join_type: JoinType.OWNER,
    });
  }

  async updatePlayGame(id: number, game: Game) {
    await this.userRepository.update(id, {
      play_game: game,
      join_type: JoinType.PLAYER,
    });
  }

  async updateWatchGame(id: number, game: Game) {
    await this.userRepository.update(id, {
      watch_game: game,
      join_type: JoinType.WATCHER,
    });
  }

  async updateGameNone(id: number) {
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

  async updateProfileImage(id: number, filename: string) {
    await this.userRepository.update(id, { profile: filename });
  }

  async updateUserIntroduce(id: number, introduce: string) {
    await this.userRepository.update(id, { introduce });
  }
}
