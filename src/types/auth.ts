import { Request } from 'express';

// Extended Request interface with authenticated user data
export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    role?: string;
  };
}

// Supabase JWT payload structure
export interface SupabaseJWTPayload {
  aud: string;
  exp: number;
  sub: string;
  email?: string;
  role?: string;
  app_metadata?: {
    provider?: string;
    providers?: string[];
  };
  user_metadata?: Record<string, any>;
}

// Auth error types
export interface AuthError {
  code: string;
  message: string;
  status: number;
} 