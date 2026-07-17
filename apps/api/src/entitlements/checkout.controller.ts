import {
  Controller,
  Post,
  Body,
  Req,
  Headers,
  HttpCode,
  UseGuards,
  RawBodyRequest,
} from '@nestjs/common';
import type { Request } from 'express';
import type { User } from '@prisma/client';
import { CheckoutService } from './checkout.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

interface CheckoutDto {
  scope: 'STATE' | 'ALL';
  stateCode?: string;
}

@Controller()
export class CheckoutController {
  constructor(private readonly checkout: CheckoutService) {}

  // Inicia el pago (SPEC §4.7) — requiere sesión.
  @Post('checkout')
  @UseGuards(SupabaseAuthGuard)
  create(@CurrentUser() user: User, @Body() dto: CheckoutDto) {
    return this.checkout.createSession(user.id, dto.scope, dto.stateCode);
  }

  // Webhook de Stripe (público, verificado por firma). Cuerpo crudo requerido.
  @Post('stripe/webhook')
  @HttpCode(200)
  webhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.checkout.handleWebhook(req.rawBody, signature);
  }
}
