import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import { env } from './config/env';
import { Logger } from '@nestjs/common';

import {
  initializeTransactionalContext,
  StorageDriver,
} from 'typeorm-transactional';
import { AllExceptionsFilter } from './core/exceptions/exception.filter';
import { globalValidationExceptionFactory } from './core/exceptions/exception.factory';

export const logger = new Logger('Electric Backend');

async function bootstrap() {
  initializeTransactionalContext({
    storageDriver: StorageDriver.ASYNC_LOCAL_STORAGE,
  });

  // Factory method NestJs Create app
  const app = await NestFactory.create(AppModule, { cors: true });

  // Protect the api
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // Set global prefix for all routes
  app.setGlobalPrefix('api/v1');
  app.useGlobalFilters(new AllExceptionsFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: globalValidationExceptionFactory,
    }),
  );

  logger.log(`Elecric backend running on port ${env.PORT}`);
  await app.listen(env.PORT);
}
bootstrap();
