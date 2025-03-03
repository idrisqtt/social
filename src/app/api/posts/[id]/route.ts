import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/server-auth';
import { connectToDatabase } from '@/lib/mongodb';
import { likePost, addComment } from '@/lib/posts-mongo';

// PUT - лайк/дизлайк поста
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Подключение к базе данных
    await connectToDatabase();
    
    // Получаем id поста из параметров
    const postId = params.id;
    
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
    
    // Обновляем лайк поста
    const updatedPost = await likePost(postId, user.id);
    
    // Возвращаем успешный ответ
    return NextResponse.json({ post: updatedPost });
  } catch (error: any) {
    console.error(`Error in PUT /api/posts/${params.id}:`, error);
    
    // Возвращаем ошибку
    return NextResponse.json(
      { error: error.message || 'Ошибка при обновлении поста' },
      { status: 500 }
    );
  }
}

// POST - добавление комментария к посту
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Подключение к базе данных
    await connectToDatabase();
    
    // Получаем id поста из параметров
    const postId = params.id;
    
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
    const { text } = body;
    
    // Проверка наличия текста
    if (!text) {
      return NextResponse.json(
        { error: 'Текст комментария обязателен' },
        { status: 400 }
      );
    }
    
    // Добавляем комментарий к посту
    const updatedPost = await addComment(postId, user.id, text);
    
    // Возвращаем успешный ответ
    return NextResponse.json({ post: updatedPost });
  } catch (error: any) {
    console.error(`Error in POST /api/posts/${params.id}:`, error);
    
    // Возвращаем ошибку
    return NextResponse.json(
      { error: error.message || 'Ошибка при добавлении комментария' },
      { status: 500 }
    );
  }
} 