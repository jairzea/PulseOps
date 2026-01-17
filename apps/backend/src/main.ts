import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  console.log('[DEBUG] Starting bootstrap...');
  console.log('[DEBUG] Environment:', {
    PORT: process.env.PORT,
    MONGODB_URI: process.env.MONGODB_URI,
    AUTH_MODE: process.env.AUTH_MODE,
    NODE_ENV: process.env.NODE_ENV,
  });

  try {
    console.log('[DEBUG] Creating NestJS application...');
    const app = await NestFactory.create(AppModule);
    console.log('[DEBUG] NestJS application created');

    // Global exception filter
    app.useGlobalFilters(new GlobalExceptionFilter());
    console.log('[DEBUG] Global exception filter configured');

    // Global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    console.log('[DEBUG] Validation pipe configured');

    // CORS configuration
    app.enableCors();
    console.log('[DEBUG] CORS enabled');

    const port = process.env.PORT || 3000;
    console.log(`[DEBUG] Listening on port ${port}...`);
    await app.listen(port);

    console.log(`🚀 PulseOps Backend running on: http://localhost:${port}`);
  } catch (error) {
    console.error('[ERROR] Bootstrap failed:', error);
    throw error;
  }
}

console.log('[DEBUG] Calling bootstrap()...');
bootstrap().catch((err) => {
  console.error('[ERROR] Bootstrap crashed:', err);
  process.exit(1);
});
