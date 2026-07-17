import { Injectable } from '@nestjs/common';
import { QuestionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReadinessService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * "Probabilidad de aprobar" v1 (SPEC §5): heurística que pondera el % de
   * aciertos por la cobertura del banco del estado. NO inventa precisión: el
   * resultado se redondea a múltiplos de 5.
   *
   *   precisión = dominadas / vistas         (de lo que has visto, cuánto dominas)
   *   cobertura = vistas / total del banco   (cuánto del banco has tocado)
   *   percent   = round(precisión × cobertura × 100 / 5) × 5
   *
   * Devuelve null si el estado no existe.
   */
  async computeForState(userId: string, code: string) {
    const state = await this.prisma.state.findUnique({
      where: { code: code.toUpperCase() },
      select: { id: true },
    });
    if (!state) return null;

    const total = await this.prisma.question.count({
      where: {
        status: QuestionStatus.HUMAN_APPROVED,
        topic: { stateId: state.id },
      },
    });
    if (total === 0) {
      return { percent: 0, seen: 0, mastered: 0, total: 0 };
    }

    const stats = await this.prisma.userQuestionStat.findMany({
      where: {
        userId,
        question: {
          status: QuestionStatus.HUMAN_APPROVED,
          topic: { stateId: state.id },
        },
      },
      select: { timesWrong: true },
    });

    const seen = stats.length;
    const mastered = stats.filter((s) => s.timesWrong === 0).length;
    const accuracy = seen > 0 ? mastered / seen : 0;
    const coverage = seen / total;
    const percent = Math.round((accuracy * coverage * 100) / 5) * 5;

    return { percent, seen, mastered, total };
  }
}
