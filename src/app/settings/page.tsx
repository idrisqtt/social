'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { updateUserProfile, updateUserAvatar } from '@/lib/users';
import { getAuth, updateEmail as firebaseUpdateEmail, updatePassword as firebaseUpdatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { FaUser, FaLock, FaBell, FaShieldAlt, FaSignOutAlt } from 'react-icons/fa';

// Функции для обновления email и пароля
const updateEmail = async (user: any, newEmail: string, password: string) => {
  try {
    const auth = getAuth();
    const credential = EmailAuthProvider.credential(
      user.email,
      password
    );
    
    await reauthenticateWithCredential(user, credential);
    await firebaseUpdateEmail(user, newEmail);
    return true;
  } catch (error) {
    console.error('Error updating email:', error);
    throw error;
  }
};

const updatePassword = async (user: any, currentPassword: string, newPassword: string) => {
  try {
    const auth = getAuth();
    const credential = EmailAuthProvider.credential(
      user.email,
      currentPassword
    );
    
    await reauthenticateWithCredential(user, credential);
    await firebaseUpdatePassword(user, newPassword);
    return true;
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  }
};

export default function SettingsPage() {
  const { user, userData, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'privacy'>('profile');
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Редирект, если пользователь не авторизован
  useEffect(() => {
    if (!user && typeof window !== 'undefined') {
      router.push('/auth/signin');
    }
  }, [user, router]);

  // Форма данных профиля
  const [profileForm, setProfileForm] = useState({
    displayName: '',
    bio: '',
  });

  // Форма безопасности
  const [securityForm, setSecurityForm] = useState({
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Загружаем данные пользователя при монтировании компонента
  useEffect(() => {
    if (userData) {
      setProfileForm({
        displayName: userData.displayName || '',
        bio: userData.bio || '',
      });
      
      if (user) {
        setSecurityForm(prev => ({
          ...prev,
          email: user.email || '',
        }));
      }
    }
  }, [userData, user]);

  // Обработчик изменения аватара
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      
      // Создаем превью
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Обработчик открытия диалога выбора файла
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  // Обработчик отправки формы профиля
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Обновляем профиль
      await updateUserProfile(user.uid, {
        displayName: profileForm.displayName,
        bio: profileForm.bio,
      });
      
      // Обновляем аватар, если он был изменен
      if (avatarFile) {
        await updateUserAvatar(user.uid, avatarFile);
      }
      
      toast.success('Профиль успешно обновлен');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Ошибка при обновлении профиля');
    } finally {
      setLoading(false);
    }
  };

  // Обработчик обновления email
  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    try {
      setLoading(true);
      
      if (securityForm.currentPassword) {
        await updateEmail(user, securityForm.email, securityForm.currentPassword);
        toast.success('Email успешно обновлен');
        
        // Очищаем форму
        setSecurityForm(prev => ({
          ...prev,
          currentPassword: '',
        }));
      } else {
        toast.error('Введите текущий пароль для обновления email');
      }
    } catch (error) {
      console.error('Error updating email:', error);
      toast.error('Ошибка при обновлении email');
    } finally {
      setLoading(false);
    }
  };

  // Обработчик обновления пароля
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      toast.error('Пароли не совпадают');
      return;
    }
    
    try {
      setLoading(true);
      
      await updatePassword(user, securityForm.currentPassword, securityForm.newPassword);
      toast.success('Пароль успешно обновлен');
      
      // Очищаем форму
      setSecurityForm(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Ошибка при обновлении пароля');
    } finally {
      setLoading(false);
    }
  };

  // Обработчик выхода из аккаунта
  const handleLogout = async () => {
    try {
      await logout();
      router.push('/auth/signin');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Ошибка при выходе из аккаунта');
    }
  };

  if (!user || !userData) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-5rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-6">Настройки</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Сайдбар с табами */}
        <div className="bg-white rounded-lg shadow p-4">
          <button 
            className={`flex items-center w-full p-3 mb-2 rounded-lg ${activeTab === 'profile' ? 'bg-blue-50 text-blue-500' : 'hover:bg-gray-100'}`}
            onClick={() => setActiveTab('profile')}
          >
            <FaUser className="mr-3" /> 
            <span>Профиль</span>
          </button>
          
          <button 
            className={`flex items-center w-full p-3 mb-2 rounded-lg ${activeTab === 'security' ? 'bg-blue-50 text-blue-500' : 'hover:bg-gray-100'}`}
            onClick={() => setActiveTab('security')}
          >
            <FaLock className="mr-3" /> 
            <span>Безопасность</span>
          </button>
          
          <button 
            className={`flex items-center w-full p-3 mb-2 rounded-lg ${activeTab === 'notifications' ? 'bg-blue-50 text-blue-500' : 'hover:bg-gray-100'}`}
            onClick={() => setActiveTab('notifications')}
          >
            <FaBell className="mr-3" /> 
            <span>Уведомления</span>
          </button>
          
          <button 
            className={`flex items-center w-full p-3 mb-2 rounded-lg ${activeTab === 'privacy' ? 'bg-blue-50 text-blue-500' : 'hover:bg-gray-100'}`}
            onClick={() => setActiveTab('privacy')}
          >
            <FaShieldAlt className="mr-3" /> 
            <span>Приватность</span>
          </button>
          
          <hr className="my-4" />
          
          <button 
            className="flex items-center w-full p-3 text-red-500 hover:bg-red-50 rounded-lg"
            onClick={handleLogout}
          >
            <FaSignOutAlt className="mr-3" /> 
            <span>Выйти</span>
          </button>
        </div>
        
        {/* Основной контент */}
        <div className="md:col-span-3 bg-white rounded-lg shadow p-6">
          {/* Профиль */}
          {activeTab === 'profile' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Настройки профиля</h2>
              
              <form onSubmit={handleProfileSubmit}>
                {/* Аватар */}
                <div className="mb-6 flex flex-col items-center">
                  <div 
                    className="relative w-32 h-32 rounded-full overflow-hidden cursor-pointer border-4 border-gray-200 hover:border-blue-500 transition-colors"
                    onClick={handleAvatarClick}
                  >
                    <Image 
                      src={avatarPreview || userData.photoURL} 
                      alt={userData.displayName} 
                      fill 
                      className="object-cover"
                    />
                    
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <span className="text-white text-sm font-medium">Изменить</span>
                    </div>
                  </div>
                  
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                  
                  <p className="text-sm text-gray-500 mt-2">Нажмите на изображение, чтобы изменить аватар</p>
                </div>
                
                {/* Имя пользователя */}
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">
                    Имя пользователя
                  </label>
                  <input 
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={profileForm.displayName}
                    onChange={(e) => setProfileForm({...profileForm, displayName: e.target.value})}
                    required
                  />
                </div>
                
                {/* Биография */}
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">
                    О себе
                  </label>
                  <textarea 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
                    placeholder="Расскажите о себе..."
                  />
                </div>
                
                {/* Кнопка сохранения */}
                <button 
                  type="submit"
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Сохранение...' : 'Сохранить изменения'}
                </button>
              </form>
            </div>
          )}
          
          {/* Безопасность */}
          {activeTab === 'security' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Настройки безопасности</h2>
              
              {/* Изменение email */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Изменение email</h3>
                <form onSubmit={handleEmailUpdate}>
                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">
                      Новый email
                    </label>
                    <input 
                      type="email"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={securityForm.email}
                      onChange={(e) => setSecurityForm({...securityForm, email: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">
                      Текущий пароль
                    </label>
                    <input 
                      type="password"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={securityForm.currentPassword}
                      onChange={(e) => setSecurityForm({...securityForm, currentPassword: e.target.value})}
                      required
                    />
                  </div>
                  
                  <button 
                    type="submit"
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading ? 'Обновление...' : 'Обновить email'}
                  </button>
                </form>
              </div>
              
              <hr className="my-6" />
              
              {/* Изменение пароля */}
              <div>
                <h3 className="text-lg font-medium mb-3">Изменение пароля</h3>
                <form onSubmit={handlePasswordUpdate}>
                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">
                      Текущий пароль
                    </label>
                    <input 
                      type="password"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={securityForm.currentPassword}
                      onChange={(e) => setSecurityForm({...securityForm, currentPassword: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">
                      Новый пароль
                    </label>
                    <input 
                      type="password"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={securityForm.newPassword}
                      onChange={(e) => setSecurityForm({...securityForm, newPassword: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">
                      Подтвердите новый пароль
                    </label>
                    <input 
                      type="password"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={securityForm.confirmPassword}
                      onChange={(e) => setSecurityForm({...securityForm, confirmPassword: e.target.value})}
                      required
                    />
                  </div>
                  
                  <button 
                    type="submit"
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading ? 'Обновление...' : 'Обновить пароль'}
                  </button>
                </form>
              </div>
            </div>
          )}
          
          {/* Уведомления */}
          {activeTab === 'notifications' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Настройки уведомлений</h2>
              <p className="text-gray-500 mb-6">Выберите, о каких событиях вы хотите получать уведомления</p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium">Новые подписчики</h3>
                    <p className="text-gray-500 text-sm">Уведомления о новых подписчиках</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium">Комментарии</h3>
                    <p className="text-gray-500 text-sm">Уведомления о новых комментариях к вашим публикациям</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium">Лайки</h3>
                    <p className="text-gray-500 text-sm">Уведомления о лайках ваших публикаций</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium">Сообщения</h3>
                    <p className="text-gray-500 text-sm">Уведомления о новых личных сообщениях</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                  </label>
                </div>
              </div>
              
              <div className="mt-6">
                <button 
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Сохранить настройки
                </button>
              </div>
            </div>
          )}
          
          {/* Приватность */}
          {activeTab === 'privacy' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Настройки приватности</h2>
              <p className="text-gray-500 mb-6">Управляйте тем, кто может видеть ваш профиль и контент</p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium">Приватный аккаунт</h3>
                    <p className="text-gray-500 text-sm">Только ваши подписчики могут видеть ваши публикации</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium">Скрыть активность</h3>
                    <p className="text-gray-500 text-sm">Скрыть вашу активность от других пользователей</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium">Видимость в поиске</h3>
                    <p className="text-gray-500 text-sm">Разрешить другим пользователям находить вас по имени или email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                  </label>
                </div>
              </div>
              
              <div className="mt-6">
                <button 
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Сохранить настройки
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 