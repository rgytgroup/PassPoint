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
import { OptionalSupabaseAuthGuard } from '../auth/optional-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { EntitlementsService } from '../entitlements/entitlements.service';
import type { SaveAttemptDto } from './dto';

@Controller()
export class AttemptsController {
  constructor(
    private readonly attempts: AttemptsService,
    private readonly entitlements: EntitlementsService,
  ) {}

  // Simulacro por estado (SPEC §4.4). Freemium (§5): sin acceso, solo isFree.
  @Get('states/:code/mock')
  @UseGuards(OptionalSupabaseAuthGuard)
  async mock(@Param('code') code: string, @CurrentUser() user?: User) {
    const entitled = user
      ? await this.entitlements.hasAccess(user.id, code)
      : false;
    const mock = await this.attempts.buildMock(code, !entitled);
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
