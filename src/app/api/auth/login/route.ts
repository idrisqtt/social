import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { signIn } from '@/lib/auth-mongo';

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
  } catch (error: any) {
    console.error('Error in login route:', error);
    
    // Различные ошибки могут требовать разных статус-кодов
    if (error.message === 'Пользователь не найден' || error.message === 'Неверный пароль') {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    
    // Возвращаем общую ошибку
    return NextResponse.json(
      { error: error.message || 'Ошибка при входе в систему' },
      { status: 500 }
    );
  }
} 