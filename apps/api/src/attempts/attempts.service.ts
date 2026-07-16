import { Injectable } from '@nestjs/common';
import { QuestionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AttemptsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Arma un simulacro para un estado (SPEC §4.4): preguntas HUMAN_APPROVED de
   * todos los temas del estado, barajadas y limitadas a examQuestionCount.
   * Cada pregunta incluye su tema para el desglose de resultados.
   * Devuelve null si el estado no existe.
   *
   * Nota: con pocos datos sembrados sirve las que haya disponibles; con el
   * banco completo llegará a examQuestionCount.
   */
  async buildMock(code: string) {
    const state = await this.prisma.state.findUnique({
      where: { code: code.toUpperCase() },
      select: {
        id: true,
        code: true,
        nameEn: true,
        nameEs: true,
        examQuestionCount: true,
        passThreshold: true,
      },
    });
    if (!state) return null;

    const pool = await this.prisma.question.findMany({
      where: {
        status: QuestionStatus.HUMAN_APPROVED,
        topic: { stateId: state.id },
      },
      include: {
        topic: { select: { slug: true, nameEn: true, nameEs: true } },
      },
    });

    const questions = shuffle(pool).slice(0, state.examQuestionCount);
    return { state, questions };
  }
}

/** Baraja una copia del arreglo (Fisher–Yates). */
function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
