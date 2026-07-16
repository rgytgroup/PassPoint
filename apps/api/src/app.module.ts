import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { HealthController } from './health/health.controller';
import { StatesModule } from './states/states.module';
import { QuestionsModule } from './questions/questions.module';
import { AttemptsModule } from './attempts/attempts.module';
import { EntitlementsModule } from './entitlements/entitlements.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    // Módulos por dominio (CLAUDE.md → Estilo técnico)
    StatesModule,
    QuestionsModule,
    AttemptsModule,
    EntitlementsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
