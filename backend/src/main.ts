import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Library Management System')
    .setDescription(
      'REST API for managing a library system, including authentication, user accounts, book catalog, inventory, and borrowings.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addCookieAuth('rt', { type: 'apiKey', in: 'cookie', name: 'rt' }, 'rt')
    .addCookieAuth('sid', { type: 'apiKey', in: 'cookie', name: 'sid' }, 'sid')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory, { swaggerOptions: { showExtensions: true } });

  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
