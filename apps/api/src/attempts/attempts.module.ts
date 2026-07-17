import { Module } from '@nestjs/common';
import { AttemptsController } from './attempts.controller';
import { AttemptsService } from './attempts.service';
import { AuthModule } from '../auth/auth.module';

// Práctica y simulacro (SPEC §4.3, §4.4) + persistencia de intentos (§3).
@Module({
  imports: [AuthModule],
  controllers: [AttemptsController],
  providers: [AttemptsService],
})
export class AttemptsModule {}
