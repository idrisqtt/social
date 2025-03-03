import mongoose from 'mongoose';
import { connectToDatabase } from './mongodb';
import ChatModel, { IChat, IMessage } from '../models/Chat';
import UserModel from '../models/User';

// Тип данных для чата
export type Chat = {
  id: string;
  participants: {
    id: string;
    displayName: string;
    photoURL: string;
  }[];
  lastMessage: {
    senderId: string;
    text: string;
    createdAt: string;
    read: boolean;
  } | null;
  createdAt: string;
  updatedAt: string;
};

// Тип данных для сообщения
export type Message = {
  id?: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderPhoto: string;
  text: string;
  createdAt: string;
  read: boolean;
};

// Создание нового чата
export const createChat = async (
  participantIds: string[]
): Promise<Chat> => {
  try {
    await connectToDatabase();
    
    // Проверяем, существует ли уже чат с этими участниками
    const existingChat = await ChatModel.findOne({
      participants: { $all: participantIds, $size: participantIds.length }
    });
    
    if (existingChat) {
      throw new Error('Чат с этими участниками уже существует');
    }
    
    // Получаем информацию об участниках
    const participants = await Promise.all(
      participantIds.map(async (id) => {
        const user = await UserModel.findById(id);
        if (!user) {
          throw new Error(`Пользователь с ID ${id} не найден`);
        }
        return {
          id: user._id.toString(),
          displayName: user.name || 'Пользователь',
          photoURL: user.image || ''
        };
      })
    );
    
    // Создаем новый чат
    const chat = new ChatModel({
      participants: participantIds,
      messages: [],
      lastMessage: null
    });
    
    await chat.save();
    
    // Преобразуем документ в формат для клиента
    return {
      id: chat._id.toString(),
      participants: participants,
      lastMessage: null,
      createdAt: chat.createdAt.toISOString(),
      updatedAt: chat.updatedAt.toISOString()
    };
  } catch (error) {
    console.error('Ошибка при создании чата:', error);
    throw error;
  }
};

// Получение всех чатов пользователя
export const getUserChats = async (userId: string): Promise<Chat[]> => {
  try {
    await connectToDatabase();
    
    // Находим все чаты, в которых участвует пользователь
    const chats = await ChatModel.find({
      participants: userId
    }).sort({ updatedAt: -1 });
    
    // Для каждого чата получаем информацию об участниках
    const chatsWithParticipants = await Promise.all(
      chats.map(async (chat) => {
        const participants = await Promise.all(
          chat.participants.map(async (participantId: mongoose.Types.ObjectId) => {
            const user = await UserModel.findById(participantId);
            if (!user) {
              return {
                id: participantId.toString(),
                displayName: 'Неизвестный пользователь',
                photoURL: ''
              };
            }
            return {
              id: user._id.toString(),
              displayName: user.name || 'Пользователь',
              photoURL: user.image || ''
            };
          })
        );
        
        // Преобразуем последнее сообщение
        let lastMessage = null;
        if (chat.messages && chat.messages.length > 0) {
          const lastMsg = chat.messages[chat.messages.length - 1];
          const sender = await UserModel.findById(lastMsg.senderId);
          
          lastMessage = {
            senderId: lastMsg.senderId.toString(),
            text: lastMsg.text,
            createdAt: lastMsg.createdAt.toISOString(),
            read: lastMsg.read
          };
        }
        
        // Возвращаем чат в формате для клиента
        return {
          id: chat._id.toString(),
          participants,
          lastMessage,
          createdAt: chat.createdAt.toISOString(),
          updatedAt: chat.updatedAt.toISOString()
        };
      })
    );
    
    return chatsWithParticipants;
  } catch (error) {
    console.error('Ошибка при получении чатов пользователя:', error);
    throw error;
  }
};

// Получение сообщений чата
export const getChatMessages = async (chatId: string): Promise<Message[]> => {
  try {
    await connectToDatabase();
    
    // Находим чат по ID
    const chat = await ChatModel.findById(chatId);
    if (!chat) {
      throw new Error('Чат не найден');
    }
    
    // Получаем информацию о отправителях сообщений
    const messages = await Promise.all(
      chat.messages.map(async (msg: any) => {
        const sender = await UserModel.findById(msg.senderId);
        return {
          id: msg._id.toString(),
          chatId: chatId,
          senderId: msg.senderId.toString(),
          senderName: sender ? (sender.name || 'Пользователь') : 'Неизвестный пользователь',
          senderPhoto: sender ? (sender.image || '') : '',
          text: msg.text,
          createdAt: msg.createdAt.toISOString(),
          read: msg.read
        };
      })
    );
    
    return messages;
  } catch (error) {
    console.error('Ошибка при получении сообщений чата:', error);
    throw error;
  }
};

// Отправка нового сообщения
export const sendMessage = async (
  chatId: string,
  senderId: string,
  text: string
): Promise<Message> => {
  try {
    await connectToDatabase();
    
    // Находим чат по ID
    const chat = await ChatModel.findById(chatId);
    if (!chat) {
      throw new Error('Чат не найден');
    }
    
    // Проверяем, что отправитель является участником чата
    if (!chat.participants.includes(new mongoose.Types.ObjectId(senderId))) {
      throw new Error('Пользователь не является участником этого чата');
    }
    
    // Создаем новое сообщение
    const newMessage = {
      senderId: new mongoose.Types.ObjectId(senderId),
      text,
      createdAt: new Date(),
      read: false
    };
    
    // Добавляем сообщение в чат
    chat.messages.push(newMessage);
    
    // Обновляем последнее сообщение
    chat.lastMessage = newMessage;
    
    // Сохраняем изменения
    await chat.save();
    
    // Получаем информацию об отправителе
    const sender = await UserModel.findById(senderId);
    
    // Возвращаем сообщение в формате для клиента
    return {
      id: chat.messages[chat.messages.length - 1]._id.toString(),
      chatId,
      senderId,
      senderName: sender ? (sender.name || 'Пользователь') : 'Неизвестный пользователь',
      senderPhoto: sender ? (sender.image || '') : '',
      text,
      createdAt: newMessage.createdAt.toISOString(),
      read: false
    };
  } catch (error) {
    console.error('Ошибка при отправке сообщения:', error);
    throw error;
  }
};

// Пометка сообщений как прочитанные
export const markMessagesAsRead = async (
  chatId: string,
  userId: string
): Promise<boolean> => {
  try {
    await connectToDatabase();
    
    // Находим чат по ID
    const chat = await ChatModel.findById(chatId);
    if (!chat) {
      throw new Error('Чат не найден');
    }
    
    // Проверяем, что пользователь является участником чата
    if (!chat.participants.some((p: mongoose.Types.ObjectId) => p.toString() === userId)) {
      throw new Error('Пользователь не является участником этого чата');
    }
    
    // Отмечаем непрочитанные сообщения как прочитанные
    let updated = false;
    
    chat.messages.forEach((msg: any) => {
      if (msg.senderId.toString() !== userId && !msg.read) {
        msg.read = true;
        updated = true;
      }
    });
    
    // Если последнее сообщение от другого пользователя, отмечаем его как прочитанное
    if (chat.lastMessage && 
        chat.lastMessage.senderId.toString() !== userId && 
        !chat.lastMessage.read) {
      chat.lastMessage.read = true;
      updated = true;
    }
    
    // Сохраняем изменения, если были обновления
    if (updated) {
      await chat.save();
    }
    
    return updated;
  } catch (error) {
    console.error('Ошибка при отметке сообщений как прочитанных:', error);
    throw error;
  }
}; 