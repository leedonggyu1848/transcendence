import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class PhGuard extends AuthGuard('42') {
	handleRequest<TUser = any>(err: any, user: any): TUser {
		if (err || !user)
			throw err || new UnauthorizedException();
		return user;
	}
}
