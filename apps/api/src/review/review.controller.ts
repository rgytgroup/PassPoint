import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import type { User } from '@prisma/client';
import { ReviewService } from './review.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

interface ReviewAnswerDto {
  questionId: string;
  correct: boolean;
}

// Repaso de falladas del usuario (SPEC §4.6) — requiere sesión.
@Controller('me/review')
@UseGuards(SupabaseAuthGuard)
export class ReviewController {
  constructor(private readonly review: ReviewService) {}

  @Get()
  list(@CurrentUser() user: User) {
    return this.review.listMissed(user.id);
  }

  @Post('answer')
  answer(@CurrentUser() user: User, @Body() dto: ReviewAnswerDto) {
    return this.review.recordAnswer(user.id, dto.questionId, dto.correct);
  }
}
