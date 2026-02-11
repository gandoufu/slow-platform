export interface User {
  id: number;
  username: string;
  email: string | null;
  display_name: string;
  role: string;
  is_active: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
