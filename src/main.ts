import { NestFactory } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { INestApplication } from '@nestjs/common';
async function bootstrap() {
  const app: INestApplication = await NestFactory.create(
    AppModule,
    new FastifyAdapter(),
  );
  app.enableCors();
  await app.listen(3000);
}
bootstrap();
