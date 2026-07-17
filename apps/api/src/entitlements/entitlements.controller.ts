import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import type { User } from '@prisma/client';
import { EntitlementsService } from './entitlements.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

// Acceso del usuario por estado (SPEC §5) — requiere sesión.
@Controller('me/access')
@UseGuards(SupabaseAuthGuard)
export class EntitlementsController {
  constructor(private readonly entitlements: EntitlementsService) {}

  @Get(':code')
  async forState(@CurrentUser() user: User, @Param('code') code: string) {
    const access = await this.entitlements.hasAccess(user.id, code);
    return { access };
  }
}
