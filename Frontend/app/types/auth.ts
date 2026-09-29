export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  message: string;
  user: UserResponse | null;
  token: string;
}