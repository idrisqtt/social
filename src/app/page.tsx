'use client';

import Link from 'next/link';
import { FaArrowRight, FaUserFriends, FaComments, FaNewspaper } from 'react-icons/fa';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  
  // Редирект на ленту, если пользователь уже авторизован
  // В реальном приложении здесь должна быть проверка авторизации
  useEffect(() => {
    // Если пользователь авторизован, перенаправляем на ленту
    // if (isAuthenticated()) {
    //   router.push('/feed');
    // }
  }, [router]);
  
  return (
    <div className="min-h-[calc(100vh-5rem)] flex flex-col justify-center">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-4">
            Добро пожаловать в <span className="text-blue-600">Social</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-3xl mx-auto">
            Современная социальная сеть для общения, обмена фотографиями, видео и многого другого
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-500 mb-4">
              <FaUserFriends className="text-2xl" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Общение с друзьями</h2>
            <p className="text-gray-500">
              Подключайтесь к друзьям, родственникам и знакомым по всему миру.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-500 mb-4">
              <FaNewspaper className="text-2xl" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Публикация контента</h2>
            <p className="text-gray-500">
              Делитесь своими моментами с помощью постов, фотографий и видео.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-500 mb-4">
              <FaComments className="text-2xl" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Мгновенные сообщения</h2>
            <p className="text-gray-500">
              Общайтесь с друзьями в режиме реального времени через чат.
            </p>
          </div>
        </div>
        
        <div className="text-center">
          <Link 
            href="/feed" 
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Начать сейчас
            <FaArrowRight className="ml-2" />
          </Link>
          <p className="mt-3 text-sm text-gray-500">
            Уже есть аккаунт?{' '}
            <Link href="/auth/signin" className="text-blue-600 hover:text-blue-500">
              Войти
            </Link>
          </p>
        </div>
      </div>
      
      <footer className="bg-white py-6 border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© 2023 Social Network. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
}
