'use client';

import { useState, useEffect } from 'react';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';

// Моковые данные для демонстрации
const MOCK_CHATS = [
  {
    id: 'chat1',
    user: {
      id: 'user1',
      name: 'Анна Смирнова',
      avatar: 'https://randomuser.me/api/portraits/women/12.jpg',
    },
    lastMessage: {
      content: 'Привет! Как дела?',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
  },
  {
    id: 'chat2',
    user: {
      id: 'user2',
      name: 'Иван Петров',
      avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
    },
    lastMessage: {
      content: 'Увидел твой новый пост, очень интересно!',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
    },
  },
];

const MOCK_MESSAGES = [
  {
    id: 'msg1',
    content: 'Привет! Как дела?',
    sender: {
      id: 'user1',
      name: 'Анна Смирнова',
      avatar: 'https://randomuser.me/api/portraits/women/12.jpg',
    },
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    isOwn: false,
  },
  {
    id: 'msg2',
    content: 'Привет! У меня все хорошо, спасибо! А у тебя?',
    sender: {
      id: 'currentUser',
      name: 'Вы',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    },
    timestamp: new Date(Date.now() - 3500000).toISOString(),
    isOwn: true,
  },
  {
    id: 'msg3',
    content: 'Тоже неплохо! Хотела спросить, не хочешь ли ты пойти на выставку в следующие выходные?',
    sender: {
      id: 'user1',
      name: 'Анна Смирнова',
      avatar: 'https://randomuser.me/api/portraits/women/12.jpg',
    },
    timestamp: new Date(Date.now() - 3400000).toISOString(),
    isOwn: false,
  },
];

export default function ChatPage() {
  const [chats, setChats] = useState(MOCK_CHATS);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  
  const handleSendMessage = (content: string, file?: File) => {
    if (content.trim() === '' && !file) return;
    
    const newMessage = {
      id: `msg${messages.length + 1}`,
      content,
      sender: {
        id: 'currentUser',
        name: 'Вы',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      },
      timestamp: new Date().toISOString(),
      isOwn: true,
    };
    
    setMessages([...messages, newMessage]);
    
    // Здесь должна быть логика отправки сообщения на сервер
  };
  
  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col md:flex-row">
      {/* Список чатов */}
      <div className="w-full md:w-1/3 border-r border-gray-200 bg-white overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold">Сообщения</h1>
        </div>
        
        <div>
          {chats.map(chat => (
            <div 
              key={chat.id}
              className={`flex items-center p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${selectedChat === chat.id ? 'bg-blue-50' : ''}`}
              onClick={() => setSelectedChat(chat.id)}
            >
              <div className="relative w-12 h-12 rounded-full overflow-hidden mr-3">
                <img 
                  src={chat.user.avatar} 
                  alt={chat.user.name} 
                  className="object-cover w-full h-full"
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold">{chat.user.name}</h3>
                <p className="text-gray-500 text-sm truncate">{chat.lastMessage.content}</p>
              </div>
              
              <div className="text-xs text-gray-400">
                {new Date(chat.lastMessage.timestamp).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
          
          {chats.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              У вас пока нет сообщений
            </div>
          )}
        </div>
      </div>
      
      {/* Область сообщений */}
      <div className="flex-1 flex flex-col h-full">
        <div className="p-4 border-b border-gray-200 bg-white">
          <h2 className="font-semibold">
            {selectedChat 
              ? chats.find(chat => chat.id === selectedChat)?.user.name 
              : 'Выберите чат'}
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {selectedChat ? (
            messages.map(message => (
              <ChatMessage key={message.id} {...message} />
            ))
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              Выберите чат из списка слева, чтобы начать общение
            </div>
          )}
        </div>
        
        {selectedChat && (
          <ChatInput onSendMessage={handleSendMessage} />
        )}
      </div>
    </div>
  );
} 