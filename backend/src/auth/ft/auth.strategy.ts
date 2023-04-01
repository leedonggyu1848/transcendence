import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from 'passport-42';
import { UserDto } from "src/dto/user.dto";

@Injectable()
export class PhStrategy extends PassportStrategy(Strategy, '42') {
	constructor(private readonly configService: ConfigService) {
		super({
			clientID: configService.get<string>('auth.clientid'),
			clientSecret: configService.get<string>('auth.secret'),
			callbackURL: configService.get<string>('auth.callbackurl'),
			passReqToCallback: true,
			profileFields: {
				userId: 'id',
				email: 'email',
				login: 'login',
			}
		});
	}

	async validate(req, access_token, refreshToken, profile, cb) {
		const userEmail = profile.email.split('.');
		const user: UserDto = {
			user_id: profile.userId,
			intra_id: profile.login,
			email: profile.email
		}
		cb(null, user);
	}
}
