import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { registerUser } from '@/lib/auth-mongo';
import { ApiError } from '@/lib/error-types';

export async function POST(request: NextRequest) {
  try {
    // Подключение к базе данных
    await connectToDatabase();
    
    // Получение данных из запроса
    const body = await request.json();
    const { email, password, displayName } = body;
    
    // Проверка наличия всех необходимых полей
    if (!email || !password || !displayName) {
      return NextResponse.json(
        { error: 'Все поля должны быть заполнены' },
        { status: 400 }
      );
    }
    
    // Регистрация пользователя
    const { user, token } = await registerUser(email, password, displayName);
    
    // Возвращаем успешный ответ
    return NextResponse.json(
      { user, token },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Ошибка при регистрации:', error);
    
    const apiError = error as ApiError;
    const errorMessage = apiError.message || 'Ошибка при регистрации';
    const status = apiError.message?.includes('уже существует') ? 409 : 500;
    
    return NextResponse.json(
      { error: errorMessage },
      { status }
    );
  }
} 