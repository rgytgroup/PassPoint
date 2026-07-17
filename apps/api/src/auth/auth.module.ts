import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { SupabaseAuthGuard } from './supabase-auth.guard';
import { OptionalSupabaseAuthGuard } from './optional-auth.guard';
import { MeController } from './me.controller';

@Module({
  imports: [UsersModule],
  controllers: [MeController],
  providers: [SupabaseAuthGuard, OptionalSupabaseAuthGuard],
  // Re-exporta UsersModule para que los guards resuelvan UsersService en el
  // contexto de cualquier módulo que los use vía @UseGuards.
  exports: [SupabaseAuthGuard, OptionalSupabaseAuthGuard, UsersModule],
})
export class AuthModule {}
