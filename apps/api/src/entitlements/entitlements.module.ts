import { Module } from '@nestjs/common';
import { EntitlementsController } from './entitlements.controller';
import { EntitlementsService } from './entitlements.service';
import { AuthModule } from '../auth/auth.module';

// Compra única de por vida vía Stripe Checkout + webhook idempotente
// (SPEC §5, §8 / CLAUDE.md). El checkout/webhook se añaden en la fase Stripe.
@Module({
  imports: [AuthModule],
  controllers: [EntitlementsController],
  providers: [EntitlementsService],
  exports: [EntitlementsService],
})
export class EntitlementsModule {}
