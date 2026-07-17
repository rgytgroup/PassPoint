import { Injectable } from '@nestjs/common';
import { QuestionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Preguntas que el usuario ha fallado (cross-tema), para el repaso (SPEC §4.6).
   * Solo HUMAN_APPROVED. Se ordenan por las más falladas primero.
   */
  async listMissed(userId: string) {
    const stats = await this.prisma.userQuestionStat.findMany({
      where: {
        userId,
        timesWrong: { gt: 0 },
        question: { status: QuestionStatus.HUMAN_APPROVED },
      },
      orderBy: { timesWrong: 'desc' },
      include: {
        question: {
          include: {
            topic: {
              select: {
                slug: true,
                nameEn: true,
                nameEs: true,
                state: { select: { code: true } },
              },
            },
          },
        },
      },
    });

    return stats.map((s) => {
      const { topic, ...question } = s.question;
      return {
        ...question,
        timesWrong: s.timesWrong,
        stateCode: topic.state.code,
        topic: { slug: topic.slug, nameEn: topic.nameEn, nameEs: topic.nameEs },
      };
    });
  }

  /**
   * Registra la respuesta de una pregunta en el repaso. Si el usuario acierta,
   * la pregunta se "limpia" del repaso (timesWrong = 0); si falla, se mantiene.
   */
  async recordAnswer(userId: string, questionId: string, correct: boolean) {
    await this.prisma.userQuestionStat.upsert({
      where: { userId_questionId: { userId, questionId } },
      create: {
        userId,
        questionId,
        timesSeen: 1,
        timesWrong: correct ? 0 : 1,
      },
      update: {
        timesSeen: { increment: 1 },
        lastSeenAt: new Date(),
        ...(correct ? { timesWrong: 0 } : { timesWrong: { increment: 1 } }),
      },
    });
    return { ok: true };
  }
}
