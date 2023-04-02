import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import JwtGuard from 'src/auth/jwt/guard/jwtauth.guard';
import { UserDeco } from 'src/decorator/user.decorator';
import { GameService } from './game.service';
import { AuthService } from 'src/auth/auth.service';
import { GameDto } from 'src/dto/game.dto';
import { UserSessionDto } from 'src/dto/usersession.dto';
import { Response } from 'express';

@Controller('/api/game')
export class GameController {
  constructor(
    private authService: AuthService,
    private gameService: GameService,
  ) {}

  @Get('/lobby')
  @UseGuards(JwtGuard)
  async lobby() {
    console.log('game : request lobby info');
    let games = await this.gameService.getLobbyInfo();
    if (games.length === 0) {
      // test code => TODO: delete
      const user1 = {
        user_id: 123,
        intra_id: 'asdf',
      };
      const user2 = {
        user_id: 124,
        intra_id: 'qwer',
      };
      await this.authService.addUser(user1);
      await this.authService.addUser(user2);
      let found_user = await this.authService.findUserByIntraId(user1.intra_id);
      this.gameService.createGame(
        {
          title: 'game1',
          interrupt_mode: false,
          private_mode: true,
          password: 'asdf',
        },
        found_user,
      );
      found_user = await this.authService.findUserByIntraId(user2.intra_id);
      this.gameService.createGame(
        {
          title: 'game2',
          interrupt_mode: true,
          private_mode: false,
          password: '',
        },
        found_user,
      );
      games = await this.gameService.getLobbyInfo();
    }
    return games;
  }

  @Post('/new_game')
  @UseGuards(JwtGuard)
  async newGame(
    @Res() res: Response,
    @Body() gameDto: GameDto,
    @UserDeco() user: UserSessionDto,
  ) {
    console.log('game : create new game');
    const found_user = await this.authService.findUserByIntraId(user.intra_id);
    if (!(await this.gameService.createGame(gameDto, found_user)))
      throw BadRequestException;
    res.status(HttpStatus.OK).send();
  }
}
