import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { AttemptsService } from './attempts.service';

// Simulacro por estado (SPEC §4.4).
@Controller('states/:code')
export class AttemptsController {
  constructor(private readonly attempts: AttemptsService) {}

  @Get('mock')
  async mock(@Param('code') code: string) {
    const mock = await this.attempts.buildMock(code);
    if (mock === null) {
      throw new NotFoundException(`Estado «${code}» no encontrado.`);
    }
    return mock;
  }
}
