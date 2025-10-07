import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api', { exclude: ['auth'] });
  app.enableCors({
     origin: 'http://localhost:5173', // your frontend URL
    credentials: true, // allow cookies
  });
  await app.listen(3000);
  
}
bootstrap();
