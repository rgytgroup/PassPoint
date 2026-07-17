import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  // rawBody: true expone req.rawBody (Buffer) para verificar la firma del
  // webhook de Stripe, sin romper el parseo JSON del resto de rutas.
  const app = await NestFactory.create(AppModule, { rawBody: true });
  const config = app.get(ConfigService);

  app.enableCors({ origin: config.get<string>('APP_BASE_URL') ?? true });
  app.setGlobalPrefix('api');

  const port = config.get<number>('PORT') ?? 3000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`PassPoint API escuchando en http://localhost:${port}/api`);
}

bootstrap();
