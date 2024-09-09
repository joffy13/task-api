import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { CustomValidationPipe } from './common/pipes/custom-validation.pipe';
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, {});
    app.enableCors({ origin: '*' });
    const configService = app.get(ConfigService);
    const port = configService.get('APP_PORT', 8000);
    const config = new DocumentBuilder()
      .setTitle('tasker api')
      .setDescription('The tasker API docs')
      .setVersion('2.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalInterceptors(new ResponseInterceptor());
    app.useGlobalPipes(new CustomValidationPipe());
    app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

    SwaggerModule.setup('api', app, document);

    await app.listen(port);
    Logger.log(`Backend started at port: ${port}`);
  } catch (err) {
    Logger.error(`Starting Backend error: ${err}`);
  }
}
bootstrap();
