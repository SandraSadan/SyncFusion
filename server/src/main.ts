import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import helmet from 'helmet';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.enableCors();
  app.use(helmet());

  // For handling validation of input datas
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix(configService.get('BACKEND_PREFIX'));

  await app.listen(configService.get('PORT'));
  console.log(`App running on`, await app.getUrl());
}
bootstrap();
