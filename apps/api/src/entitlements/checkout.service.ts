import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EntitlementScope } from '@prisma/client';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';
import { EntitlementsService } from './entitlements.service';

const PRICE_CENTS = { STATE: 1299, ALL: 1999 };

@Injectable()
export class CheckoutService {
  private readonly stripe: Stripe | null;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly entitlements: EntitlementsService,
  ) {
    const key = this.config.get<string>('STRIPE_SECRET_KEY');
    this.stripe = key ? new Stripe(key) : null;
  }

  private client(): Stripe {
    if (!this.stripe) {
      throw new ServiceUnavailableException(
        'Pagos no configurados (falta STRIPE_SECRET_KEY).',
      );
    }
    return this.stripe;
  }

  /** Crea una sesión de Stripe Checkout para una compra única (SPEC §4.7). */
  async createSession(
    userId: string,
    scope: 'STATE' | 'ALL',
    stateCode?: string,
  ) {
    const stripe = this.client();
    const base =
      this.config.get<string>('APP_BASE_URL') ?? 'http://localhost:5173';

    let stateId: string | null = null;
    let productName = 'PassPoint — Acceso total';

    if (scope === 'STATE') {
      if (!stateCode) {
        throw new BadRequestException('Falta stateCode para compra por estado.');
      }
      const state = await this.prisma.state.findUnique({
        where: { code: stateCode.toUpperCase() },
        select: { id: true, nameEs: true },
      });
      if (!state) {
        throw new NotFoundException(`Estado «${stateCode}» no encontrado.`);
      }
      stateId = state.id;
      productName = `PassPoint — ${state.nameEs}`;
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: PRICE_CENTS[scope],
            product_data: { name: productName },
          },
        },
      ],
      success_url: `${base}/${scope === 'STATE' ? stateCode!.toLowerCase() : ''}?purchase=success`,
      cancel_url: `${base}/precios`,
      // El webhook usa esta metadata para otorgar el acceso.
      metadata: { userId, scope, stateId: stateId ?? '' },
    });

    return { url: session.url };
  }

  /**
   * Procesa el webhook de Stripe. Verifica la firma y, en
   * checkout.session.completed, otorga el entitlement de forma idempotente
   * (un evento repetido no duplica — CLAUDE.md).
   */
  async handleWebhook(rawBody: Buffer | undefined, signature: string) {
    const stripe = this.client();
    const secret = this.config.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!secret) {
      throw new ServiceUnavailableException('Falta STRIPE_WEBHOOK_SECRET.');
    }
    if (!rawBody || !signature) {
      throw new BadRequestException('Webhook sin cuerpo o firma.');
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, secret);
    } catch {
      throw new BadRequestException('Firma de webhook inválida.');
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const md = session.metadata ?? {};
      if (md.userId && (md.scope === 'STATE' || md.scope === 'ALL')) {
        await this.entitlements.grant({
          userId: md.userId,
          scope: md.scope as EntitlementScope,
          stateId: md.stateId || null,
          stripeSessionId: session.id,
        });
      }
    }

    return { received: true };
  }
}
