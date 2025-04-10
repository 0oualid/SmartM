
// Common types for authentication services
export interface User {
  id: number;
  username: string;
  email?: string;
}

export interface AuthResult {
  success: boolean;
  token?: string;
  user?: User;
}
