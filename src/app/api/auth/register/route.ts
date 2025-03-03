import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { registerUser } from '@/lib/auth-mongo';

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
  } catch (error: any) {
    console.error('Error in register route:', error);
    
    // Возвращаем ошибку
    return NextResponse.json(
      { error: error.message || 'Ошибка при регистрации пользователя' },
      { status: 500 }
    );
  }
} 