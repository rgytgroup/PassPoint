import { Controller, Get, UseGuards } from '@nestjs/common';
import type { User } from '@prisma/client';
import { SupabaseAuthGuard } from './supabase-auth.guard';
import { CurrentUser } from './current-user.decorator';

@Controller('me')
@UseGuards(SupabaseAuthGuard)
export class MeController {
  /** Devuelve el usuario autenticado (SPEC §3 User). */
  @Get()
  me(@CurrentUser() user: User): User {
    return user;
  }
}
