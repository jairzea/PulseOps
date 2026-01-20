export interface User {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'user';
}

export interface AuthResponse {
    access_token: string;
    user: User;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    name: string;
    role?: 'admin' | 'user';
    resourceProfile?: Record<string, any>;
}

export interface UpdateUserData {
    name?: string;
    email?: string;
    password?: string;
    role?: 'admin' | 'user';
    isActive?: boolean;
}

export interface ChangePasswordData {
    currentPassword: string;
    newPassword: string;
}

export interface UserWithMetadata extends User {
    isActive: boolean;
    lastLogin?: string;
    createdAt?: string;
}
