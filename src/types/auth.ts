export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'pharmacist';
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role?: 'user' | 'pharmacist';
}