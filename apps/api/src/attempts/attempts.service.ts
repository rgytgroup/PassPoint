import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { AttemptMode, Prisma, QuestionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { SaveAttemptDto } from './dto';

@Injectable()
export class AttemptsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Guarda un intento (práctica o simulacro) y actualiza las estadísticas por
   * pregunta del usuario (SPEC §3 Attempt/UserQuestionStat). El puntaje se
   * calcula en el servidor: nunca se confía en el cliente para la corrección.
   */
  async saveAttempt(userId: string, dto: SaveAttemptDto) {
    if (dto.mode !== 'PRACTICE' && dto.mode !== 'MOCK') {
      throw new BadRequestException('mode debe ser PRACTICE o MOCK.');
    }
    const state = await this.prisma.state.findUnique({
      where: { code: dto.stateCode.toUpperCase() },
      select: { id: true, examQuestionCount: true, passThreshold: true },
    });
    if (!state) {
      throw new NotFoundException(`Estado «${dto.stateCode}» no encontrado.`);
    }

    const ids = dto.answers.map((a) => a.questionId);
    const questions = await this.prisma.question.findMany({
      where: { id: { in: ids } },
      select: { id: true, options: true },
    });
    const optsById = new Map(
      questions.map((q) => [q.id, q.options as { correct: boolean }[]]),
    );

    // Solo respuestas a preguntas reales; el puntaje se calcula aquí.
    const graded = dto.answers
      .filter((a) => optsById.has(a.questionId))
      .map((a) => ({
        questionId: a.questionId,
        chosenIndex: a.chosenIndex,
        correct: optsById.get(a.questionId)?.[a.chosenIndex]?.correct === true,
      }));

    const score = graded.filter((g) => g.correct).length;
    const total = graded.length;
    const ratio = state.passThreshold / state.examQuestionCount;
    const passed = total > 0 && score >= Math.ceil(total * ratio);

    const [attempt] = await this.prisma.$transaction([
      this.prisma.attempt.create({
        data: {
          userId,
          stateId: state.id,
          mode: dto.mode as AttemptMode,
          answers: graded as unknown as Prisma.InputJsonValue,
          score,
          passed,
        },
        select: { id: true, createdAt: true },
      }),
      ...graded.map((g) =>
        this.prisma.userQuestionStat.upsert({
          where: {
            userId_questionId: { userId, questionId: g.questionId },
          },
          create: {
            userId,
            questionId: g.questionId,
            timesSeen: 1,
            timesWrong: g.correct ? 0 : 1,
          },
          update: {
            timesSeen: { increment: 1 },
            ...(g.correct ? {} : { timesWrong: { increment: 1 } }),
            lastSeenAt: new Date(),
          },
        }),
      ),
    ]);

    return { id: attempt.id, score, total, passed };
  }

  /**
   * Arma un simulacro para un estado (SPEC §4.4): preguntas HUMAN_APPROVED de
   * todos los temas del estado, barajadas y limitadas a examQuestionCount.
   * Cada pregunta incluye su tema para el desglose de resultados.
   * Devuelve null si el estado no existe.
   *
   * Nota: con pocos datos sembrados sirve las que haya disponibles; con el
   * banco completo llegará a examQuestionCount.
   */
  async buildMock(code: string, onlyFree = false) {
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
        ...(onlyFree ? { isFree: true } : {}),
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
