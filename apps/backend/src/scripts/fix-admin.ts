import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { UserRole } from '../users/schemas/user.schema';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  try {
    // Buscar usuario admin
    const admin = await usersService.findByEmail('admin@pulseops.com');

    if (!admin) {
      console.log('❌ No se encontró el usuario admin, creándolo...');

      // Crear nuevo admin
      const newPassword = 'Admin123!';
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      const newAdmin = await usersService.create({
        email: 'admin@pulseops.com',
        password: hashedPassword,
        name: 'Administrador',
        role: UserRole.ADMIN,
      });

      // Activar después de crear
      await newAdmin.updateOne({ $set: { isActive: true } });

      console.log('✅ Usuario administrador creado exitosamente');
      console.log('📧 Email: admin@pulseops.com');
      console.log('🔑 Nueva contraseña: ' + newPassword);
    } else {
      // Actualizar admin existente
      const newPassword = 'Admin123!';
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Actualizar directamente en la base de datos
      await admin.updateOne({
        $set: {
          password: hashedPassword,
          isActive: true,
          role: UserRole.ADMIN,
        },
      });

      console.log('✅ Usuario administrador actualizado exitosamente');
      console.log('📧 Email: admin@pulseops.com');
      console.log('🔑 Nueva contraseña: ' + newPassword);
      console.log('🔓 Estado: ACTIVO');
      console.log('👑 Rol: ADMIN');
    }

    console.log('\n⚠️  Usa estas credenciales para iniciar sesión');
  } catch (error) {
    console.error('❌ Error al actualizar usuario admin:', error);
  }

  await app.close();
}

bootstrap();
