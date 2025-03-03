import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/server-auth';
import { connectToDatabase } from '@/lib/mongodb';
import { getChatMessages, sendMessage, markMessagesAsRead } from '@/lib/chat-mongo';
import { ApiError } from '@/lib/error-types';

// GET - получение сообщений чата
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Подключение к базе данных
    await connectToDatabase();
    
    // Получаем id чата из параметров
    const chatId = params.id;
    
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
    
    // Получаем сообщения чата
    const messages = await getChatMessages(chatId);
    
    // Отмечаем сообщения как прочитанные
    await markMessagesAsRead(chatId, user.id);
    
    // Возвращаем успешный ответ
    return NextResponse.json({ messages });
  } catch (error: unknown) {
    console.error(`Ошибка в GET /api/chats/${params.id}/messages:`, error);
    
    const apiError = error as ApiError;
    return NextResponse.json(
      { error: apiError.message || 'Ошибка при получении сообщений' },
      { status: 500 }
    );
  }
}

// POST - отправка нового сообщения
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Подключение к базе данных
    await connectToDatabase();
    
    // Получаем id чата из параметров
    const chatId = params.id;
    
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
        { error: 'Текст сообщения обязателен' },
        { status: 400 }
      );
    }
    
    // Отправляем новое сообщение
    const message = await sendMessage(chatId, user.id, text);
    
    // Возвращаем успешный ответ
    return NextResponse.json({ message }, { status: 201 });
  } catch (error: unknown) {
    console.error(`Ошибка в POST /api/chats/${params.id}/messages:`, error);
    
    const apiError = error as ApiError;
    return NextResponse.json(
      { error: apiError.message || 'Ошибка при отправке сообщения' },
      { status: 500 }
    );
  }
} 