import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { SupabaseAuthGuard } from './supabase-auth.guard';
import { MeController } from './me.controller';

@Module({
  imports: [UsersModule],
  controllers: [MeController],
  providers: [SupabaseAuthGuard],
  // Re-exporta UsersModule para que el guard resuelva UsersService en el
  // contexto de cualquier módulo que lo use vía @UseGuards.
  exports: [SupabaseAuthGuard, UsersModule],
})
export class AuthModule {}
