import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api', { exclude: ['auth'] });
  // app.enableCors({
  //   origin:'*',
  //    //origin: 'https://north-link-corporation.vercel.app', // your frontend URL
  //   //credentials: true, // allow cookies
  // });
app.enableCors({
  origin: [
    'http://localhost:5173',
    'https://north-link-corporation.vercel.app',
  ],
  credentials: true,
});

  await app.listen(3000);
  
}
bootstrap();
