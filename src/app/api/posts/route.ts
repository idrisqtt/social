import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/server-auth';
import { connectToDatabase } from '@/lib/mongodb';
import { createPost, getAllPosts } from '@/lib/posts-mongo';
import { ApiError } from '@/lib/error-types';

// GET - получение всех постов
export async function GET(request: NextRequest) {
  try {
    // Подключение к базе данных
    await connectToDatabase();
    
    // Получаем токен из заголовка
    const authHeader = request.headers.get('Authorization');
    const token = authHeader ? authHeader.split(' ')[1] : null;
    
    // Если есть токен, получаем пользователя
    const currentUserId = token ? (await getUserFromToken(token))?.id : undefined;
    
    // Получаем все посты
    const posts = await getAllPosts(currentUserId);
    
    // Возвращаем успешный ответ
    return NextResponse.json({ posts });
  } catch (error: unknown) {
    console.error('Ошибка в GET /api/posts:', error);
    
    const apiError = error as ApiError;
    return NextResponse.json(
      { error: apiError.message || 'Ошибка при получении постов' },
      { status: 500 }
    );
  }
}

// POST - создание нового поста
export async function POST(request: NextRequest) {
  try {
    // Подключение к базе данных
    await connectToDatabase();
    
    // Получаем токен из заголовка
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 }
      );
    }
    
    const token = authHeader.split(' ')[1];
    const user = await getUserFromToken(token);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Недействительный токен' },
        { status: 401 }
      );
    }
    
    // Получаем данные из запроса
    const body = await request.json();
    const { text, imageUrl } = body;
    
    // Проверка наличия текста
    if (!text) {
      return NextResponse.json(
        { error: 'Текст поста обязателен' },
        { status: 400 }
      );
    }
    
    // Создаем новый пост
    const post = await createPost(user.id, text, imageUrl);
    
    // Возвращаем успешный ответ
    return NextResponse.json({ post }, { status: 201 });
  } catch (error: unknown) {
    console.error('Ошибка в POST /api/posts:', error);
    
    const apiError = error as ApiError;
    return NextResponse.json(
      { error: apiError.message || 'Ошибка при создании поста' },
      { status: 500 }
    );
  }
} 