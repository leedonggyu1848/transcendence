import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { UserSessionDto } from 'src/dto/usersession.dto';
import { User } from 'src/entity/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
	constructor(
		private readonly configService: ConfigService,
		@InjectRepository(User)
		private userRepository: Repository<User>,
	) {}

	async findUserById(user_id: number) {
		return await this.userRepository.findOneBy({user_id: user_id});
	}

	async addUser(user: UserSessionDto) {
		const found = await this.findUserById(user.user_id);
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
			});
		}
	}
}
