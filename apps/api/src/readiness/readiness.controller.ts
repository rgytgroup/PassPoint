import {
  Controller,
  Get,
  Param,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import type { User } from '@prisma/client';
import { ReadinessService } from './readiness.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

// Probabilidad de aprobar por estado (SPEC §5) — requiere sesión.
@Controller('me/readiness')
@UseGuards(SupabaseAuthGuard)
export class ReadinessController {
  constructor(private readonly readiness: ReadinessService) {}

  @Get(':code')
  async forState(@CurrentUser() user: User, @Param('code') code: string) {
    const result = await this.readiness.computeForState(user.id, code);
    if (result === null) {
      throw new NotFoundException(`Estado «${code}» no encontrado.`);
    }
    return result;
  }
}
