'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { api, ApiError } from '@/lib/api';
import { User, LoginDto, RegisterDto } from '@/types';

export function useAuth() {
  const { user, setUser, logout: clearUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchMe = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const userData = await api.get<User>('/auth/me');
      setUser(userData);
      return userData;
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setUser(null);
        return null;
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setUser]);

  const login = useCallback(
    async (credentials: LoginDto) => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.post<{ user: User; message: string }>('/auth/login', credentials);
        setUser(response.user);
        return response.user;
      } catch (err) {
        const errorMessage = err instanceof ApiError 
          ? err.errors?.[0] || err.message 
          : 'Login failed. Please try again.';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setUser]
  );

  const register = useCallback(
    async (data: RegisterDto) => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.post<{ user: User; message: string }>('/auth/register', data);
        setUser(response.user);
        return response.user;
      } catch (err) {
        const errorMessage = err instanceof ApiError 
          ? err.errors?.[0] || err.message 
          : 'Registration failed. Please try again.';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setUser]
  );

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await api.post('/auth/logout');
      clearUser();
      router.push('/auth/login');
    } catch (err) {
      console.error('Logout error:', err);
      clearUser();
      router.push('/auth/login');
    } finally {
      setLoading(false);
    }
  }, [clearUser, router]);

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    fetchMe,
  };
}
