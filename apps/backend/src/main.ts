import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS configuration
  app.enableCors();

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 PulseOps Backend running on: http://localhost:${port}`);
}

bootstrap();
