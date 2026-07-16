import { Module } from '@nestjs/common';

// Compra única de por vida vía Stripe Checkout + webhook idempotente
// (SPEC §5, §8 / CLAUDE.md). Se implementa en la fase de pagos.
@Module({})
export class EntitlementsModule {}
