import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/server-auth';
import { connectToDatabase } from '@/lib/mongodb';
import { createChat, getUserChats } from '@/lib/chat-mongo';

// GET - получение всех чатов пользователя
export async function GET(request: NextRequest) {
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
    
    // Получаем все чаты пользователя
    const chats = await getUserChats(user.id);
    
    // Возвращаем успешный ответ
    return NextResponse.json({ chats });
  } catch (error: any) {
    console.error('Error in GET /api/chats:', error);
    
    // Возвращаем ошибку
    return NextResponse.json(
      { error: error.message || 'Ошибка при получении чатов' },
      { status: 500 }
    );
  }
}

// POST - создание нового чата
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
    const { participantId } = body;
    
    // Проверка наличия участника
    if (!participantId) {
      return NextResponse.json(
        { error: 'ID участника обязателен' },
        { status: 400 }
      );
    }
    
    // Проверяем, что создатель не пытается создать чат с самим собой
    if (participantId === user.id) {
      return NextResponse.json(
        { error: 'Нельзя создать чат с самим собой' },
        { status: 400 }
      );
    }
    
    // Создаем новый чат
    const chat = await createChat([user.id, participantId]);
    
    // Возвращаем успешный ответ
    return NextResponse.json({ chat }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/chats:', error);
    
    // Возвращаем ошибку
    return NextResponse.json(
      { error: error.message || 'Ошибка при создании чата' },
      { status: 500 }
    );
  }
} 