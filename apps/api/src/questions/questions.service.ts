import { Injectable } from '@nestjs/common';
import { QuestionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QuestionsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * REGLA DE ORO (SPEC §3 / CLAUDE.md): solo se sirven preguntas
   * HUMAN_APPROVED. Este es el único punto de acceso para el runtime del
   * producto; nunca exponer DRAFT ni AI_VERIFIED a usuarios.
   */
  private servableWhere(topicId: string, onlyFree = false) {
    return {
      topicId,
      status: QuestionStatus.HUMAN_APPROVED,
      ...(onlyFree ? { isFree: true } : {}),
    };
  }

  /** Preguntas servibles de un tema. `onlyFree` para usuarios sin entitlement (SPEC §5). */
  findForTopic(topicId: string, onlyFree = false) {
    return this.prisma.question.findMany({
      where: this.servableWhere(topicId, onlyFree),
      orderBy: { difficulty: 'asc' },
    });
  }

  /**
   * Preguntas de un tema identificado por código de estado + slug (SPEC §4.3).
   * Devuelve null si el tema no existe (para responder 404).
   */
  async findForStateTopic(code: string, slug: string, onlyFree = false) {
    const topic = await this.prisma.topic.findFirst({
      where: { slug, state: { code: code.toUpperCase() } },
      select: { id: true },
    });
    if (!topic) return null;
    return this.findForTopic(topic.id, onlyFree);
  }
}
