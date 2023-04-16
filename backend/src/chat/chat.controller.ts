import { Controller, Get, Logger, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import JwtGuard from 'src/user/jwt/guard/jwtauth.guard';
import { UserService } from 'src/user/user.service';

@Controller('/api/chat')
export class ChatController {
  private logger = new Logger(ChatController.name);
  constructor(private userService: UserService) {}

  @Get('/list')
  @UseGuards(JwtGuard)
  async getChatList(@Res() res: Response) {}
}
