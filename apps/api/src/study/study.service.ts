import { Injectable } from '@nestjs/common';
import { AttemptMode, QuestionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Motor de reglas de "Smart Study" y gamificación (SPEC §11.1, §11.3).
 *
 * REGLA DE ORO (SPEC §11.6): esto es matemática sobre estadísticas propias del
 * usuario — CERO llamadas a un LLM en runtime. Todo lo que sigue es
 * determinístico y calculado desde Attempt / UserQuestionStat / Question.
 */
@Injectable()
export class StudyService {
  constructor(private readonly prisma: PrismaService) {}

  /** Redondeo honesto a múltiplos de 5 (SPEC §11.2 — nunca fingir precisión). */
  private round5(n: number): number {
    return Math.round(n / 5) * 5;
  }

  // ─────────────────────── Dominio por tema + plan ───────────────────────

  /**
   * Dominio por tema (dashboard) + "Plan de hoy". El dominio de un tema es la
   * cobertura de preguntas dominadas (respondidas sin fallar nunca) sobre el
   * total HUMAN_APPROVED del tema, redondeada a múltiplos de 5.
   *
   * Devuelve null si el estado no existe.
   */
  async computeForState(userId: string, code: string) {
    const state = await this.prisma.state.findUnique({
      where: { code: code.toUpperCase() },
      select: { id: true },
    });
    if (!state) return null;

    const topics = await this.prisma.topic.findMany({
      where: { stateId: state.id },
      select: { id: true, slug: true, nameEn: true, nameEs: true, order: true },
      orderBy: { order: 'asc' },
    });

    // Preguntas aprobadas del estado con las estadísticas del usuario.
    const questions = await this.prisma.question.findMany({
      where: {
        status: QuestionStatus.HUMAN_APPROVED,
        topic: { stateId: state.id },
      },
      select: {
        id: true,
        topicId: true,
        userStats: {
          where: { userId },
          select: { timesSeen: true, timesWrong: true },
        },
      },
    });

    const byTopic = new Map<
      string,
      { total: number; seen: number; mastered: number; weakestWrong: number }
    >();
    for (const t of topics) {
      byTopic.set(t.id, { total: 0, seen: 0, mastered: 0, weakestWrong: 0 });
    }

    for (const q of questions) {
      const bucket = byTopic.get(q.topicId);
      if (!bucket) continue;
      bucket.total += 1;
      const stat = q.userStats[0];
      if (stat) {
        bucket.seen += 1;
        if (stat.timesWrong === 0) bucket.mastered += 1;
        else bucket.weakestWrong += stat.timesWrong;
      }
    }

    const topicMastery = topics
      .map((t) => {
        const b = byTopic.get(t.id)!;
        const mastery = b.total > 0 ? this.round5((b.mastered / b.total) * 100) : 0;
        return {
          slug: t.slug,
          nameEn: t.nameEn,
          nameEs: t.nameEs,
          total: b.total,
          seen: b.seen,
          mastered: b.mastered,
          mastery,
          // "Débil" = tiene banco, se ha tocado poco o se falla, y dominio < 60.
          weak: b.total > 0 && mastery < 60,
        };
      })
      .filter((t) => t.total > 0);

    // Tema de foco: el débil con menor dominio; a igualdad, el de más fallos.
    const focus = [...topicMastery]
      .filter((t) => t.weak)
      .sort((a, b) => a.mastery - b.mastery || b.seen - a.seen)[0] ?? null;

    // Sesión Smart Study: preguntas más falladas + no vistas de los temas
    // débiles (o de todo el estado si no hay temas débiles todavía).
    const weakTopicIds = new Set(
      topicMastery.filter((t) => t.weak).map((t) => t.slug),
    );
    const slugById = new Map(topics.map((t) => [t.id, t.slug]));
    const candidates = questions
      .map((q) => {
        const stat = q.userStats[0];
        return {
          id: q.id,
          slug: slugById.get(q.topicId)!,
          timesWrong: stat?.timesWrong ?? 0,
          seen: stat ? stat.timesSeen > 0 : false,
        };
      })
      .filter((q) => (weakTopicIds.size ? weakTopicIds.has(q.slug) : true))
      // Prioridad: más falladas primero, luego no vistas, luego el resto.
      .sort((a, b) => {
        if (b.timesWrong !== a.timesWrong) return b.timesWrong - a.timesWrong;
        if (a.seen !== b.seen) return a.seen ? 1 : -1;
        return 0;
      });

    const SESSION_SIZE = 15;
    const sessionQuestionIds = candidates.slice(0, SESSION_SIZE).map((q) => q.id);
    const count = sessionQuestionIds.length;

    return {
      topicMastery,
      focusTopic: focus
        ? { slug: focus.slug, nameEn: focus.nameEn, nameEs: focus.nameEs, mastery: focus.mastery }
        : null,
      plan: {
        count,
        // ~45s por pregunta, redondeado a minutos (mínimo 1 si hay preguntas).
        estMinutes: count > 0 ? Math.max(1, Math.round((count * 45) / 60)) : 0,
        sessionQuestionIds,
      },
    };
  }

  /**
   * Preguntas de la sesión Smart Study (para el modo de estudio dirigido).
   * Reutiliza la priorización de computeForState. Solo HUMAN_APPROVED.
   */
  async smartSession(userId: string, code: string) {
    const plan = await this.computeForState(userId, code);
    if (!plan) return null;
    const ids = plan.plan.sessionQuestionIds;
    if (ids.length === 0) return [];

    const questions = await this.prisma.question.findMany({
      where: { id: { in: ids }, status: QuestionStatus.HUMAN_APPROVED },
      select: {
        id: true,
        topicId: true,
        textEn: true,
        textEs: true,
        options: true,
        explanationEn: true,
        explanationEs: true,
        manualRef: true,
        difficulty: true,
        isFree: true,
        topic: { select: { slug: true, nameEn: true, nameEs: true } },
      },
    });
    // Conservar el orden de prioridad calculado.
    const order = new Map(ids.map((id, i) => [id, i]));
    return questions.sort((a, b) => (order.get(a.id)! - order.get(b.id)!));
  }

  // ─────────────────────────── Gamificación ───────────────────────────

  /**
   * Racha, logros y reto diario (SPEC §11.3) — gamificación LIGERA sin social.
   * Todo se deriva de los intentos y estadísticas propias del usuario.
   */
  async gamification(userId: string, lang: 'ES' | 'EN' = 'ES') {
    const es = lang === 'ES';
    const attempts = await this.prisma.attempt.findMany({
      where: { userId },
      select: { createdAt: true, mode: true, passed: true, score: true },
      orderBy: { createdAt: 'desc' },
    });

    // Días (UTC) con actividad → racha actual y racha más larga.
    const days = [...new Set(attempts.map((a) => this.dayKey(a.createdAt)))].sort(
      (x, y) => (x < y ? 1 : -1),
    ); // desc
    const { current: streak, longest: longestStreak } = this.streaks(days);

    const passedMock = attempts.some((a) => a.mode === AttemptMode.MOCK && a.passed);

    // Dominio 90%+ en algún tema, a través de cualquier estado del usuario.
    const topic90 = await this.hasTopic90(userId);

    const achievements = [
      {
        id: 'first_attempt',
        title: es ? 'Primer paso' : 'First step',
        description: es ? 'Completa tu primera práctica' : 'Complete your first practice',
        icon: '🚗',
        unlocked: attempts.length > 0,
      },
      {
        id: 'streak_5',
        title: es ? 'Racha de 5' : '5-day streak',
        description: es ? 'Estudia 5 días seguidos' : 'Study 5 days in a row',
        icon: '🔥',
        unlocked: longestStreak >= 5,
      },
      {
        id: 'mock_passed',
        title: es ? 'Simulacro aprobado' : 'Mock passed',
        description: es ? 'Aprueba tu primer simulacro' : 'Pass your first mock exam',
        icon: '✅',
        unlocked: passedMock,
      },
      {
        id: 'topic_90',
        title: es ? 'Tema dominado' : 'Topic mastered',
        description: es ? 'Alcanza 90% de dominio en un tema' : 'Reach 90% mastery in a topic',
        icon: '🎯',
        unlocked: topic90,
      },
    ];

    // Reto diario: supera tu mejor puntaje de ayer (SPEC §11.3).
    const today = this.dayKey(new Date());
    const yKey = this.previousDayKey(today);
    const bestOf = (key: string) =>
      attempts
        .filter((a) => this.dayKey(a.createdAt) === key)
        .reduce((max, a) => Math.max(max, a.score), -1);
    const todayBest = bestOf(today);
    const yesterdayBest = bestOf(yKey);
    const dailyChallenge = {
      yesterdayBest: yesterdayBest < 0 ? null : yesterdayBest,
      todayBest: todayBest < 0 ? null : todayBest,
      // Batido si hoy superó el mejor de ayer (o si ayer no hubo referencia).
      beaten: todayBest >= 0 && (yesterdayBest < 0 || todayBest > yesterdayBest),
    };

    return {
      streak,
      longestStreak,
      studiedToday: todayBest >= 0,
      achievements,
      dailyChallenge,
    };
  }

  // ─────────────────────────── Helpers ───────────────────────────

  /** Clave de día en UTC (YYYY-MM-DD) para agrupar rachas. */
  private dayKey(d: Date): string {
    return d.toISOString().slice(0, 10);
  }

  private previousDayKey(key: string): string {
    const d = new Date(`${key}T00:00:00.000Z`);
    d.setUTCDate(d.getUTCDate() - 1);
    return this.dayKey(d);
  }

  /**
   * Racha actual (días consecutivos terminando hoy o ayer) y racha más larga,
   * a partir de una lista de claves de día ordenada descendente.
   */
  private streaks(daysDesc: string[]): { current: number; longest: number } {
    if (daysDesc.length === 0) return { current: 0, longest: 0 };

    const todayKey = this.dayKey(new Date());
    const yesterdayKey = this.previousDayKey(todayKey);

    // Racha actual: solo cuenta si el último día activo es hoy o ayer.
    let current = 0;
    if (daysDesc[0] === todayKey || daysDesc[0] === yesterdayKey) {
      current = 1;
      for (let i = 1; i < daysDesc.length; i++) {
        if (daysDesc[i] === this.previousDayKey(daysDesc[i - 1])) current += 1;
        else break;
      }
    }

    // Racha más larga en todo el historial.
    let longest = 1;
    let run = 1;
    for (let i = 1; i < daysDesc.length; i++) {
      if (daysDesc[i] === this.previousDayKey(daysDesc[i - 1])) run += 1;
      else run = 1;
      if (run > longest) longest = run;
    }

    return { current, longest };
  }

  /** ¿Tiene el usuario 90%+ de dominio en algún tema (cualquier estado)? */
  private async hasTopic90(userId: string): Promise<boolean> {
    const rows = await this.prisma.question.findMany({
      where: { status: QuestionStatus.HUMAN_APPROVED },
      select: {
        topicId: true,
        userStats: {
          where: { userId },
          select: { timesWrong: true },
        },
      },
    });
    const byTopic = new Map<string, { total: number; mastered: number }>();
    for (const q of rows) {
      const b = byTopic.get(q.topicId) ?? { total: 0, mastered: 0 };
      b.total += 1;
      const stat = q.userStats[0];
      if (stat && stat.timesWrong === 0) b.mastered += 1;
      byTopic.set(q.topicId, b);
    }
    for (const b of byTopic.values()) {
      if (b.total >= 5 && this.round5((b.mastered / b.total) * 100) >= 90) return true;
    }
    return false;
  }
}
