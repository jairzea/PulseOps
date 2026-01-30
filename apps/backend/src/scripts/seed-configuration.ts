import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ConfigurationService } from '../configuration/configuration.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const configService = app.get(ConfigurationService);

  try {
    const config = await configService.getActiveConfiguration();
    console.log('✅ Configuración activa asegurada:', config._id ? config._id.toString() : config);
  } catch (error) {
    console.error('❌ Error asegurando configuración:', error);
  }

  await app.close();
}

bootstrap();
