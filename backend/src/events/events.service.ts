import { Inject, Injectable } from '@nestjs/common';
import { Namespace, Socket } from 'socket.io';
import { IFriendRepository } from 'src/friend/repository/friend.interface.repository';
import { IUserRepository } from 'src/user/repository/users.interface.repository';
import { IBanRepository } from './repository/ban.interface.repository';
import { IChatRepository } from './repository/chat.interface.repository';
import { IChatUserRepository } from './repository/chatuser.interface.repository';

@Injectable()
export class EventsService {
  constructor(
    @Inject('GameChat')
    private nsp: Namespace,
    @Inject('IUserRepository')
    private userRepository: IUserRepository,
    @Inject('IFriendRepository')
    private friendRepository: IFriendRepository,
    @Inject('IChatRepository')
    private chatRepository: IChatRepository,
    @Inject('IChatUserRepository')
    private chatUserRepository: IChatUserRepository,
    @Inject('IBanRepository')
    private banRepository: IBanRepository,
  ) {}

  async registUser(intra_id: string, socket_id: string) {
    const user = await this.userRepository.findByIntraId(intra_id);
    await this.userRepository.updateSocketId(user.id, socket_id);
  }

  async broadcast(socket: Socket, room: string, type: string, msg: any) {
    socket.broadcast.to(room).emit(type, msg);
  }

  async createRoom(socket: Socket, room: string) {
    if (this.nsp.adapter.rooms.has(room))
      return `fail: ${room} 방이 이미 존재합니다.`;
    await socket.join(room);
    this.nsp.emit('create-game', room);
    return `${room} 방 생성 완료`;
  }

  async joinRoom(socket: Socket, room: string, type: string) {
    const user = await this.userRepository.findBySocketId(socket.id);
    await socket.join(room);
    this.broadcast(socket, room, 'join-game', {
      message: `${user.intra_id}가 들어왔습니다.`,
      userInfo: this.userRepository.userToUserDto(user),
      type: type,
    });
    return `${room}에 ${user.intra_id}가 참가했습니다.`;
  }

  async leaveRoom(socket: Socket, room: string, type: string) {
    const user = await this.userRepository.findBySocketId(socket.id);
    socket.leave(room);
    this.broadcast(socket, room, 'leave-game', {
      message: `${user.intra_id}가 나갔습니다.`,
      userInfo: this.userRepository.userToUserDto(user),
      type: type,
    });
  }
}
