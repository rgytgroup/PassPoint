import { Module } from '@nestjs/common';
import { EntitlementsController } from './entitlements.controller';
import { EntitlementsService } from './entitlements.service';
import { CheckoutController } from './checkout.controller';
import { CheckoutService } from './checkout.service';
import { AuthModule } from '../auth/auth.module';

// Compra única de por vida vía Stripe Checkout + webhook idempotente
// (SPEC §5, §8 / CLAUDE.md).
@Module({
  imports: [AuthModule],
  controllers: [EntitlementsController, CheckoutController],
  providers: [EntitlementsService, CheckoutService],
  exports: [EntitlementsService],
})
export class EntitlementsModule {}
