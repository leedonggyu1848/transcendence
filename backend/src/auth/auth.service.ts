import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { UserDto } from 'src/dto/user.dto';
import { User } from 'src/entity/entity.user';
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

	async addUser(user: UserDto) {
		const found = await this.findUserById(user.user_id);
		if (!found)
			await this.userRepository.save({
				user_id: user.user_id,
				username: user.intra_id,
				email: user.email
			});
	}
}
