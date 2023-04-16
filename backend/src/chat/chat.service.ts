import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository } from 'src/user/repository/users.interface.repository';
import { IChatRepository } from './repository/chat.interface.repository';

@Injectable()
export class ChatService {
  constructor(
    @Inject('IUserRepository')
    private userRepository: IUserRepository,
    @Inject('IChatRepostiory')
    private chatRepository: IChatRepository,
  ) {}
}
