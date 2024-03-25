import { NestFactory } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { INestApplication } from '@nestjs/common';
import { CustomLogger } from './service/logger/logger.service';
async function bootstrap() {
  const app: INestApplication = await NestFactory.create(
    AppModule,
    new FastifyAdapter(),
  );
  app.enableCors();
  app.useLogger(new CustomLogger());
  await app.listen(3000);
}
bootstrap();
