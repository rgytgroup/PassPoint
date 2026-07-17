import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import type { User } from '@prisma/client';
import { AttemptsService } from './attempts.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { SaveAttemptDto } from './dto';

@Controller()
export class AttemptsController {
  constructor(private readonly attempts: AttemptsService) {}

  // Simulacro por estado (SPEC §4.4) — público.
  @Get('states/:code/mock')
  async mock(@Param('code') code: string) {
    const mock = await this.attempts.buildMock(code);
    if (mock === null) {
      throw new NotFoundException(`Estado «${code}» no encontrado.`);
    }
    return mock;
  }

  // Guardar un intento (SPEC §3) — requiere sesión.
  @Post('attempts')
  @UseGuards(SupabaseAuthGuard)
  save(@CurrentUser() user: User, @Body() dto: SaveAttemptDto) {
    return this.attempts.saveAttempt(user.id, dto);
  }
}
