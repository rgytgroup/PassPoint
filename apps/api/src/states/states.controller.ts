import { Controller, Get, Param } from '@nestjs/common';
import { StatesService } from './states.service';

@Controller('states')
export class StatesController {
  constructor(private readonly states: StatesService) {}

  @Get()
  list() {
    return this.states.findActive();
  }

  @Get(':code')
  byCode(@Param('code') code: string) {
    return this.states.findByCode(code);
  }
}
