'use server';

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from './mongodb';
import User from '@/models/User';

/**
 * Хеширует пароль с использованием bcrypt (только на стороне сервера)
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Сравнивает обычный пароль с хешированным (только на стороне сервера)
 */
export async function comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Получает пользователя из JWT токена
 */
export async function getUserFromToken(token: string) {
  try {
    // Проверяем JWT токен
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET не найден в переменных окружения');
    }
    
    // Декодируем токен
    const decoded = jwt.verify(token, secret) as { id: string };
    
    // Подключаемся к базе данных
    await connectToDatabase();
    
    // Ищем пользователя в базе данных
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      throw new Error('Пользователь не найден');
    }
    
    // Преобразуем Mongoose документ в обычный объект
    const userObject = user.toObject();
    
    return {
      id: userObject._id.toString(),
      name: userObject.name,
      email: userObject.email,
      image: userObject.image,
    };
  } catch (error) {
    console.error('Ошибка при проверке токена:', error);
    return null;
  }
} 