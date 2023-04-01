import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request, Response } from "express";
import { UserDto } from "src/dto/user.dto";

@Injectable()
export class JwtSignGuard implements CanActivate {
	constructor(private jwtService: JwtService) {}

	canActivate(context: ExecutionContext): boolean {
		const req = context.switchToHttp().getRequest();
		const res = context.switchToHttp().getResponse();
		return this.generateToken(req, res);
	}

	private generateToken(req: Request, res: Response): boolean {
		const user = req.user as UserDto | undefined;
		if (user === undefined)
			return false;
		const token = this.jwtService.sign(user);
		res.cookie('access_token', token);
		return true;
	}
}
