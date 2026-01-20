import {
    AuthResponse,
    LoginCredentials,
    RegisterData,
    User,
    UserWithMetadata,
    UpdateUserData,
    ChangePasswordData,
} from '../types/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class AuthAPI {
    private getHeaders(includeAuth = false): HeadersInit {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (includeAuth) {
            const token = localStorage.getItem('auth_token');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        return headers;
    }

    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed');
        }

        return response.json();
    }

    async register(data: RegisterData): Promise<AuthResponse> {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Registration failed');
        }

        return response.json();
    }

    async getProfile(): Promise<UserWithMetadata> {
        const response = await fetch(`${API_URL}/auth/profile`, {
            method: 'GET',
            headers: this.getHeaders(true),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch profile');
        }

        return response.json();
    }

    async validateToken(): Promise<{ valid: boolean; user: User }> {
        const response = await fetch(`${API_URL}/auth/validate`, {
            method: 'POST',
            headers: this.getHeaders(true),
        });

        if (!response.ok) {
            return { valid: false, user: null as any };
        }

        return response.json();
    }

    async getAllUsers(): Promise<UserWithMetadata[]> {
        const response = await fetch(`${API_URL}/users`, {
            method: 'GET',
            headers: this.getHeaders(true),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch users');
        }

        return response.json();
    }

    async getUserById(id: string): Promise<UserWithMetadata> {
        const response = await fetch(`${API_URL}/users/${id}`, {
            method: 'GET',
            headers: this.getHeaders(true),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user');
        }

        return response.json();
    }

    async createUser(data: RegisterData): Promise<UserWithMetadata> {
        const response = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: this.getHeaders(true),
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create user');
        }

        return response.json();
    }

    async updateUser(id: string, data: UpdateUserData): Promise<UserWithMetadata> {
        const response = await fetch(`${API_URL}/users/${id}`, {
            method: 'PUT',
            headers: this.getHeaders(true),
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update user');
        }

        return response.json();
    }

    async changePassword(id: string, data: ChangePasswordData): Promise<void> {
        const response = await fetch(`${API_URL}/users/${id}/change-password`, {
            method: 'POST',
            headers: this.getHeaders(true),
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to change password');
        }
    }

    async deleteUser(id: string, hard = false): Promise<void> {
        const url = `${API_URL}/users/${id}${hard ? '?hard=true' : ''}`;
        const response = await fetch(url, {
            method: 'DELETE',
            headers: this.getHeaders(true),
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errMsg = 'Failed to delete user';
            try {
                const parsed = JSON.parse(errorText);
                errMsg = parsed.message || errMsg;
            } catch (e) {
                if (errorText) errMsg = errorText;
            }
            throw new Error(errMsg);
        }
    }
}

export const authAPI = new AuthAPI();
