import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { QuestionsService } from './questions.service';

// Preguntas para la práctica por tema (SPEC §4.3).
// NOTA: en práctica se revela la respuesta al instante, por eso se envían las
// opciones con su flag `correct` y la explicación. El filtrado por entitlement
// (freemium, SPEC §5) se añadirá con el módulo de pagos; por ahora sirve todas
// las HUMAN_APPROVED del tema.
@Controller('states/:code/topics/:slug')
export class QuestionsController {
  constructor(private readonly questions: QuestionsService) {}

  @Get('questions')
  async forTopic(@Param('code') code: string, @Param('slug') slug: string) {
    const result = await this.questions.findForStateTopic(code, slug);
    if (result === null) {
      throw new NotFoundException(`Tema «${slug}» no encontrado en ${code}.`);
    }
    return result;
  }
}
