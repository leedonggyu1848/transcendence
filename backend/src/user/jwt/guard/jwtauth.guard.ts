import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export default class JwtGuard extends AuthGuard('jwt') {
	handleRequest<TUser = any>(err: any, user: any): TUser {
		if (err || !user)
			throw err || new UnauthorizedException();
		return user;
	}
}
