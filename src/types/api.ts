// Basit API Types
export interface User {
  id: number
  username: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  password: string
  colorCode?: string
  inviteToken?: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  username: string
  userId: number
  inviteToken?: string
} 