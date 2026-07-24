import { Module } from '@nestjs/common';
import { StudyController } from './study.controller';
import { StudyService } from './study.service';
import { AuthModule } from '../auth/auth.module';

// Smart Study + gamificación determinística (SPEC §11.1, §11.3, §11.6).
@Module({
  imports: [AuthModule],
  controllers: [StudyController],
  providers: [StudyService],
})
export class StudyModule {}
