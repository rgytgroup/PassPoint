import { Module } from '@nestjs/common';
import { AttemptsController } from './attempts.controller';
import { AttemptsService } from './attempts.service';

// Práctica y simulacro (SPEC §4.3, §4.4). El simulacro ya está; la
// persistencia de intentos (Attempt) se añade con auth de usuario.
@Module({
  controllers: [AttemptsController],
  providers: [AttemptsService],
})
export class AttemptsModule {}
