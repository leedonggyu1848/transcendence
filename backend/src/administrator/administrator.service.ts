import { Inject, Injectable } from '@nestjs/common';
import { IAdministratorRepository } from './repository/administrator.interface.repository';

@Injectable()
export class AdministratorService {
  constructor(
    @Inject('IAdministratorRepositroy')
    private administratorRepository: IAdministratorRepository,
  ) {}
}
