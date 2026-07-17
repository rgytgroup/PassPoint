import { Injectable } from '@nestjs/common';
import { EntitlementScope } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EntitlementsService {
  constructor(private readonly prisma: PrismaService) {}

  /** ¿El usuario tiene acceso pagado al estado (por estado o all-access)? */
  async hasAccess(userId: string, code: string): Promise<boolean> {
    const state = await this.prisma.state.findUnique({
      where: { code: code.toUpperCase() },
      select: { id: true },
    });
    if (!state) return false;

    const entitlement = await this.prisma.entitlement.findFirst({
      where: {
        userId,
        OR: [
          { scope: EntitlementScope.ALL },
          { scope: EntitlementScope.STATE, stateId: state.id },
        ],
      },
      select: { id: true },
    });
    return entitlement !== null;
  }

  /**
   * Otorga un derecho de acceso de forma idempotente por stripeSessionId
   * (un webhook repetido no duplica el entitlement — CLAUDE.md). Lo usará
   * el webhook de Stripe.
   */
  async grant(params: {
    userId: string;
    scope: EntitlementScope;
    stateId?: string | null;
    stripeSessionId: string;
  }) {
    return this.prisma.entitlement.upsert({
      where: { stripeSessionId: params.stripeSessionId },
      update: {},
      create: {
        userId: params.userId,
        scope: params.scope,
        stateId: params.stateId ?? null,
        stripeSessionId: params.stripeSessionId,
      },
    });
  }
}
