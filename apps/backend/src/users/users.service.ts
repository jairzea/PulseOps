import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { RegisterDto, UpdateUserDto, ChangePasswordDto } from './dto/user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: RegisterDto): Promise<UserDocument> {
    const user = new this.userModel(createUserDto);
    return user.save();
  }

  async findAll(includeInactive = false): Promise<UserDocument[]> {
    const filter = includeInactive ? {} : { isActive: true };
    return this.userModel.find(filter).select('-password').exec();
  }

  async findById(id: string): Promise<UserDocument> {
    // Support demo ids in AUTH_MODE=demo to avoid CastError and DB lookups
    if (id === 'demo-admin' || id === 'demo-user') {
      const role = id === 'demo-admin' ? 'admin' : 'user';
      const demoUser = new this.userModel({
        _id: new Types.ObjectId(),
        email: `${id}@local`,
        role,
        isActive: true,
        name: id === 'demo-admin' ? 'Demo Admin' : 'Demo User',
      });
      return demoUser as UserDocument;
    }

    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserDocument> {
    // Si se actualiza el email, verificar que no exista
    if (updateUserDto.email) {
      const existingUser = await this.findByEmail(updateUserDto.email);
      if (existingUser && existingUser._id.toString() !== id) {
        throw new ConflictException('Email already in use');
      }
    }

    // Si se actualiza password, hashearlo
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const user = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .select('-password')
      .exec();

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const user = await this.findById(userId);

    // Verificar password actual
    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Actualizar password
    user.password = await bcrypt.hash(changePasswordDto.newPassword, 10);
    await user.save();
  }

  async delete(id: string): Promise<void> {
    // Support demo ids in AUTH_MODE=demo: no-op to avoid CastError
    if (id === 'demo-admin' || id === 'demo-user') {
      return;
    }

    // Soft delete: marcar como inactivo
    const user = await this.userModel.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true },
    );

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  async hardDelete(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, { lastLogin: new Date() });
  }

  async countByRole(role: string): Promise<number> {
    return this.userModel.countDocuments({ role, isActive: true });
  }
}
