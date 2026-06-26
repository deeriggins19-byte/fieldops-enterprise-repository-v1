import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  const swagger = new DocumentBuilder()
    .setTitle('FieldOps API')
    .setDescription('FieldOps Enterprise API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  SwaggerModule.setup('/docs', app, SwaggerModule.createDocument(app, swagger));
  await app.listen(process.env.API_PORT || 3001);
}

bootstrap();
