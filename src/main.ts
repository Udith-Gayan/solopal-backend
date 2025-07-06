import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';
import { PrismaClient } from '../prisma/generated/prisma';

// Load environment variables from .env file
config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
