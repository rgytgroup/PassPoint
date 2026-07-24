import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import type { User } from '@prisma/client';
import { StudyService } from './study.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

/**
 * Smart Study y gamificación (SPEC §11.1, §11.3). Requiere sesión.
 * Motor de reglas determinístico — cero IA en runtime (SPEC §11.6).
 */
@Controller('me')
@UseGuards(SupabaseAuthGuard)
export class StudyController {
  constructor(private readonly study: StudyService) {}

  // Dominio por tema + "Plan de hoy" para un estado (dashboard).
  @Get('study/:code')
  async forState(@CurrentUser() user: User, @Param('code') code: string) {
    const result = await this.study.computeForState(user.id, code);
    if (result === null) {
      throw new NotFoundException(`Estado «${code}» no encontrado.`);
    }
    return result;
  }

  // Preguntas de la sesión Smart Study dirigida.
  @Get('study/:code/session')
  async session(@CurrentUser() user: User, @Param('code') code: string) {
    const result = await this.study.smartSession(user.id, code);
    if (result === null) {
      throw new NotFoundException(`Estado «${code}» no encontrado.`);
    }
    return result;
  }

  // Racha, logros y reto diario (gamificación ligera, sin social).
  @Get('gamification')
  gamification(
    @CurrentUser() user: User,
    @Query('lang') lang?: string,
  ) {
    const l = lang?.toUpperCase() === 'EN' ? 'EN' : 'ES';
    return this.study.gamification(user.id, l);
  }
}
