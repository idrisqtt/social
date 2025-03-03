import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getUserByToken } from '@/lib/auth-mongo';

export async function GET(request: NextRequest) {
  try {
    // Подключение к базе данных
    await connectToDatabase();
    
    // Получение токена из заголовка Authorization
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Токен авторизации не предоставлен' },
        { status: 401 }
      );
    }
    
    // Извлечение токена
    const token = authHeader.split(' ')[1];
    
    // Получение пользователя по токену
    const user = await getUserByToken(token);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Недействительный токен или пользователь не найден' },
        { status: 401 }
      );
    }
    
    // Возвращаем данные пользователя
    return NextResponse.json(
      { user },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in me route:', error);
    
    // Возвращаем ошибку
    return NextResponse.json(
      { error: error.message || 'Ошибка при получении данных пользователя' },
      { status: 500 }
    );
  }
} 