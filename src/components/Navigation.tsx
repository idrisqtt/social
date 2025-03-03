'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaHome, FaUser, FaComment, FaSignInAlt, FaPlusSquare, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function Navigation() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();
  
  const isActive = (path: string) => {
    return pathname === path ? 'text-blue-500' : 'text-gray-500 hover:text-blue-400';
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Вы успешно вышли из системы');
      router.push('/auth/signin');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Ошибка при выходе из системы');
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 md:left-0 md:top-0 md:w-20 md:h-full md:border-r md:border-t-0">
      <div className="flex justify-around md:flex-col md:justify-start md:pt-10 md:h-full">
        <Link href="/feed" className={`p-3 flex flex-col items-center ${isActive('/feed')}`}>
          <FaHome className="text-xl mb-1" />
          <span className="text-xs md:text-sm">Лента</span>
        </Link>
        
        {user && (
          <Link href="/create" className={`p-3 flex flex-col items-center ${isActive('/create')}`}>
            <FaPlusSquare className="text-xl mb-1" />
            <span className="text-xs md:text-sm">Создать</span>
          </Link>
        )}
        
        {user ? (
          <>
            <Link href="/profile" className={`p-3 flex flex-col items-center ${isActive('/profile')}`}>
              <FaUser className="text-xl mb-1" />
              <span className="text-xs md:text-sm">Профиль</span>
            </Link>
            
            <Link href="/chat" className={`p-3 flex flex-col items-center ${isActive('/chat')}`}>
              <FaComment className="text-xl mb-1" />
              <span className="text-xs md:text-sm">Чаты</span>
            </Link>
            
            <button 
              onClick={handleLogout}
              className="p-3 flex flex-col items-center text-gray-500 hover:text-red-500"
            >
              <FaSignOutAlt className="text-xl mb-1" />
              <span className="text-xs md:text-sm">Выйти</span>
            </button>
          </>
        ) : (
          <Link href="/auth/signin" className={`p-3 flex flex-col items-center ${isActive('/auth/signin')}`}>
            <FaSignInAlt className="text-xl mb-1" />
            <span className="text-xs md:text-sm">Войти</span>
          </Link>
        )}
      </div>
    </nav>
  );
} 