'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from './auth-mongo'; // Импортируем только тип, а не функции
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Проверка наличия токена в локальном хранилище при загрузке
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        
        // Безопасно проверяем, доступен ли localStorage (только на клиенте)
        const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
        
        if (token) {
          // Используем API маршрут вместо прямого вызова MongoDB
          const response = await fetch('/api/auth/me', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUser(userData.user);
          } else {
            // Если токен недействителен, удаляем его
            if (typeof window !== 'undefined') {
              localStorage.removeItem('authToken');
            }
          }
        }
      } catch (err) {
        console.error('Error checking auth:', err);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      // Используем API маршрут для входа
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при входе');
      }
      
      // Сохраняем данные пользователя и токен
      setUser(data.user);
      
      // Безопасно используем localStorage (только на клиенте)
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', data.token);
      }
      
      toast.success('Вход выполнен успешно!');
    } catch (err: any) {
      setError(err.message || 'Ошибка при входе');
      toast.error(err.message || 'Ошибка при входе');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      // Безопасно удаляем из localStorage (только на клиенте)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
      }
      toast.success('Вы вышли из аккаунта');
    } catch (err: any) {
      setError(err.message || 'Ошибка при выходе');
      toast.error(err.message || 'Ошибка при выходе');
    }
  };

  const register = async (email: string, password: string, displayName: string) => {
    try {
      setLoading(true);
      setError(null);

      // Используем API маршрут для регистрации
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, displayName })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при регистрации');
      }
      
      // Сохраняем данные пользователя и токен
      setUser(data.user);
      
      // Безопасно используем localStorage (только на клиенте)
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', data.token);
      }
      
      toast.success('Регистрация успешна!');
    } catch (error: any) {
      console.error('Registration error:', error);
      setError(error.message || 'Ошибка при регистрации пользователя');
      toast.error(error.message || 'Ошибка при регистрации пользователя');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 