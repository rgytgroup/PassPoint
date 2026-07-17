import {
  Controller,
  Get,
  Param,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import type { User } from '@prisma/client';
import { QuestionsService } from './questions.service';
import { OptionalSupabaseAuthGuard } from '../auth/optional-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { EntitlementsService } from '../entitlements/entitlements.service';

// Preguntas para la práctica por tema (SPEC §4.3).
// Freemium (SPEC §5): sin acceso pagado solo se sirven las preguntas isFree.
// En práctica se revela la respuesta al instante, por eso se envían las
// opciones con su flag `correct` y la explicación.
@Controller('states/:code/topics/:slug')
export class QuestionsController {
  constructor(
    private readonly questions: QuestionsService,
    private readonly entitlements: EntitlementsService,
  ) {}

  @Get('questions')
  @UseGuards(OptionalSupabaseAuthGuard)
  async forTopic(
    @Param('code') code: string,
    @Param('slug') slug: string,
    @CurrentUser() user?: User,
  ) {
    const entitled = user
      ? await this.entitlements.hasAccess(user.id, code)
      : false;
    const result = await this.questions.findForStateTopic(code, slug, !entitled);
    if (result === null) {
      throw new NotFoundException(`Tema «${slug}» no encontrado en ${code}.`);
    }
    return result;
  }
}
