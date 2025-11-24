import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import session from 'express-session';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend
  app.enableCors({
    origin: 'http://localhost:3000', 
    credentials: true,
  });

  // Session configuration
  app.use(
    session({
      secret: 'your-secret-key-change-in-production',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
        httpOnly: true,
        secure: false, // set to true in production with HTTPS
      },
    }),
  );

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  await app.listen(4000);
  console.log('Backend running on http://localhost:4000');
}
void bootstrap();
