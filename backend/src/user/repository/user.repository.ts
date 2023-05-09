import { InjectRepository } from '@nestjs/typeorm';
import { JoinType } from 'src/entity/common.enum';
import { Game } from 'src/entity/game.entity';
import { Record } from 'src/entity/record.entity';
import { User } from 'src/entity/user.entity';
import { Repository } from 'typeorm';
import { IUserRepository } from './user.interface.repository';

export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createUser(userId: number, userName: string, email: string) {
    const user = this.userRepository.create({
      userId: userId,
      userName: userName,
      email: email,
      auth: false,
      socketId: '',
      profile: '',
      introduce: '',
      normalWin: 0,
      normalLose: 0,
      rankWin: 0,
      rankLose: 0,
      joinType: JoinType.NONE,
    });
    await this.userRepository.save(user);
    return user;
  }

  async findAll() {
    return await this.userRepository.find();
  }

  async findByUserId(userId: number) {
    return await this.userRepository.findOneBy({ userId: userId });
  }

  async findByUserIdWithJoinGame(userId: number) {
    return await this.userRepository.findOne({
      where: { userId: userId },
      relations: ['playGame', 'watchGame'],
    });
  }

  async findByUserName(userName: string) {
    return await this.userRepository.findOneBy({ userName: userName });
  }

  async findByUserNameWithJoinGame(userName: string) {
    return await this.userRepository.findOne({
      where: { userName: userName },
      relations: ['playGame', 'watchGame'],
    });
  }

  async findByUserNameWithJoinChat(userName: string) {
    return await this.userRepository.findOne({
      where: { userName: userName },
      relations: ['chats', 'chats.chat'],
    });
  }

  async findByUserNameWithJoinAll(userName: string) {
    return await this.userRepository.findOne({
      where: { userName: userName },
      relations: ['chats', 'chats.chat', 'playGame', 'watchGame'],
    });
  }

  async findByUserNameWithJoinFriend(userName: string) {
    return await this.userRepository.findOne({
      where: { userName: userName },
      relations: ['friends', 'friends.user'],
    });
  }

  async findByUserNameWithJoinBlock(userName: string) {
    return await this.userRepository.findOne({
      where: { userName: userName },
      relations: ['blockUsers'],
    });
  }

  async findBySocketId(socketId: string) {
    return await this.userRepository.findOneBy({ socketId: socketId });
  }

  async findBySocketIdWithJoinGame(socketId: string) {
    return await this.userRepository.findOne({
      where: { socketId: socketId },
      relations: ['playGame', 'watchGame'],
    });
  }

  async findBySocketIdWithJoinChat(socketId: string) {
    return await this.userRepository.findOne({
      where: { socketId: socketId },
      relations: ['chats', 'chats.chat', 'chats.user'],
    });
  }

  async findBySocketIdWithJoinAll(socketId: string) {
    return await this.userRepository.findOne({
      where: { socketId: socketId },
      relations: ['chats', 'chats.chat', 'playGame', 'watchGame'],
    });
  }

  async findBySocketIdWithJoinFriend(socketId: string) {
    return await this.userRepository.findOne({
      where: { socketId: socketId },
      relations: ['friends', 'friends.user'],
    });
  }

  async findBySocketIdWithJoinBlock(socketId: string) {
    return await this.userRepository.findOne({
      where: { socketId: socketId },
      relations: ['blockUsers'],
    });
  }

  async findBySocketIdWithJoinRecord(socketId: string) {
    return await this.userRepository.findOne({
      where: { socketId: socketId },
      relations: ['records'],
    });
  }

  async findByUserNameWithJoinRecord(userName: string) {
    return await this.userRepository.findOne({
      where: { userName: userName },
      relations: ['records'],
    });
  }

  async updateSocketId(id: number, socketId: string) {
    await this.userRepository.update(id, {
      socketId: socketId,
    });
  }

  async updateUserName(id: number, userName: string) {
    await this.userRepository.update(id, {
      userName: userName,
    });
  }

  async updateAuth(id: number, auth: boolean) {
    await this.userRepository.update(id, { auth: auth });
  }

  async updateOwnGame(id: number, game: Game) {
    await this.userRepository.update(id, {
      playGame: game,
      joinType: JoinType.OWNER,
    });
  }

  async updatePlayGame(id: number, game: Game) {
    await this.userRepository.update(id, {
      playGame: game,
      joinType: JoinType.PLAYER,
    });
  }

  async updateWatchGame(id: number, game: Game) {
    await this.userRepository.update(id, {
      watchGame: game,
      joinType: JoinType.WATCHER,
    });
  }

  async updateGameRank(id: number) {
    await this.userRepository.update(id, {
      joinType: JoinType.RANK,
    });
  }

  async updateGameNone(id: number) {
    await this.userRepository.update(id, {
      playGame: null,
      watchGame: null,
      joinType: JoinType.NONE,
    });
  }

  async updateNormalWin(id: number, win: number) {
    await this.userRepository.update(id, { normalWin: win + 1 });
  }

  async updateNormalLose(id: number, lose: number) {
    await this.userRepository.update(id, { normalLose: lose + 1 });
  }

  async updateRankWin(id: number, win: number) {
    await this.userRepository.update(id, { rankWin: win + 1 });
  }

  async updateRankLose(id: number, lose: number) {
    await this.userRepository.update(id, { rankLose: lose + 1 });
  }

  async updateProfileImage(id: number, filename: string) {
    await this.userRepository.update(id, { profile: filename });
  }

  async updateUserIntroduce(id: number, introduce: string) {
    await this.userRepository.update(id, { introduce });
  }

  async addRecord(user: User, record: Record) {
    if (user.records) user.records.push(record);
    else user.records = [record];
    await this.userRepository.save(user);
  }
}
