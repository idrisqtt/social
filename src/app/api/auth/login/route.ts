import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { signIn } from '@/lib/auth-mongo';
import { ApiError } from '@/lib/error-types';

export async function POST(request: NextRequest) {
  try {
    // Подключение к базе данных
    await connectToDatabase();
    
    // Получение данных из запроса
    const body = await request.json();
    const { email, password } = body;
    
    // Проверка наличия всех необходимых полей
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email и пароль обязательны' },
        { status: 400 }
      );
    }
    
    // Вход пользователя
    const { user, token } = await signIn(email, password);
    
    // Возвращаем успешный ответ
    return NextResponse.json(
      { user, token },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Ошибка при входе:', error);
    
    const apiError = error as ApiError;
    return NextResponse.json(
      { error: apiError.message || 'Ошибка при входе в систему' },
      { status: 500 }
    );
  }
} 