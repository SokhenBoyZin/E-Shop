export enum UserRole {
  USER = 0, // Or 'USER' depending on your backend preference
  ADMIN = 1
}

export interface UpdateRoleRequest {
  role: UserRole | string | number
}

export interface UserResponse {
  id: number
  username: string
  email: string
  role: UserRole | string
  createdAt: string
  updatedAt: string
}

export interface CreateUserRequest {
  username: string
  email: string
  password: string
  confirm_password: string
}