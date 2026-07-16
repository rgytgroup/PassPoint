import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // El webhook de Stripe necesita el cuerpo crudo; se habilitará al montar ese módulo.
  app.enableCors({ origin: config.get<string>('APP_BASE_URL') ?? true });
  app.setGlobalPrefix('api');

  const port = config.get<number>('PORT') ?? 3000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`PassPoint API escuchando en http://localhost:${port}/api`);
}

bootstrap();
