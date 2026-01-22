import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { UserRole } from '../users/schemas/user.schema';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  try {
    // Verificar si ya existe un admin
    const existingAdmin = await usersService.findByEmail('admin@pulseops.com');

    if (existingAdmin) {
      console.log('⚠️  El usuario admin ya existe');
      await app.close();
      return;
    }

    // Crear usuario admin por defecto
    const hashedPassword = await bcrypt.hash('Admin1234!', 10);

    await usersService.create({
      email: 'admin@pulseops.com',
      password: hashedPassword,
      name: 'Administrador',
      role: UserRole.ADMIN,
    });

    console.log('✅ Usuario administrador creado exitosamente');
    console.log('📧 Email: admin@pulseops.com');
    console.log('🔑 Password: Admin1234!');
    console.log('⚠️  Recuerda cambiar la contraseña después del primer login');
  } catch (error) {
    console.error('❌ Error al crear usuario admin:', error);
  }

  await app.close();
}

bootstrap();
