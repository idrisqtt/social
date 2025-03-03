'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Post from '@/components/Post';
import { FaEdit, FaCog, FaUsers } from 'react-icons/fa';
import { useAuth } from '@/lib/AuthContext';
import { getUserPosts, Post as PostType, likePost, unlikePost } from '@/lib/posts';
import { updateUserProfile, updateUserAvatar } from '@/lib/users';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'posts' | 'saved'>('posts');
  const { user, userData } = useAuth();
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  // Создаем объект для хранения состояния лайков постов
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});

  // Загружаем посты пользователя
  useEffect(() => {
    const loadUserPosts = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const fetchedPosts = await getUserPosts(user.uid);
        setPosts(fetchedPosts);
      } catch (error) {
        console.error('Error loading user posts:', error);
        toast.error('Ошибка при загрузке публикаций');
      } finally {
        setLoading(false);
      }
    };
    
    loadUserPosts();
  }, [user]);
  
  // Редирект, если пользователь не авторизован
  useEffect(() => {
    if (!user && typeof window !== 'undefined') {
      router.push('/auth/signin');
    }
  }, [user, router]);
  
  // Обработчик лайка поста
  const handleLike = async (postId: string, isLiked: boolean) => {
    if (!user) {
      toast.error('Необходимо войти в систему, чтобы оценивать публикации');
      return;
    }
    
    try {
      if (isLiked) {
        await unlikePost(postId);
      } else {
        await likePost(postId);
      }
      
      // Обновляем локальное состояние
      setLikedPosts(prev => ({
        ...prev,
        [postId]: !isLiked
      }));
      
      // Обновляем счетчик лайков в списке постов
      setPosts(prev => 
        prev.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              likes: isLiked ? post.likes - 1 : post.likes + 1
            };
          }
          return post;
        })
      );
    } catch (error) {
      console.error('Error liking/unliking post:', error);
      toast.error('Ошибка при оценке публикации');
    }
  };
  
  // Обработчик редактирования профиля
  const handleEditProfile = () => {
    // Здесь будет открытие модального окна для редактирования профиля
    // Или переход на страницу редактирования профиля
    toast.success('Функция редактирования профиля будет добавлена в следующем обновлении');
  };
  
  if (!user || !userData) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-5rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Профиль пользователя */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col items-center md:flex-row md:items-start">
          <div className="relative w-32 h-32 rounded-full overflow-hidden mb-4 md:mb-0 md:mr-6">
            <Image 
              src={userData.photoURL} 
              alt={userData.displayName} 
              fill 
              className="object-cover"
            />
          </div>
          
          <div className="text-center md:text-left md:flex-1">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <h1 className="text-2xl font-bold mb-2 md:mb-0">{userData.displayName}</h1>
              
              <div className="flex flex-wrap justify-center md:justify-end gap-2">
                <button 
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center"
                  onClick={handleEditProfile}
                >
                  <FaEdit className="mr-1" /> Редактировать профиль
                </button>
                <button className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                  <FaCog />
                </button>
              </div>
            </div>
            
            <div className="flex justify-center md:justify-start space-x-8 mb-4">
              <div className="text-center">
                <div className="font-bold">{userData.posts}</div>
                <div className="text-gray-500 text-sm">Публикаций</div>
              </div>
              <div className="text-center">
                <div className="font-bold">{userData.followers}</div>
                <div className="text-gray-500 text-sm">Подписчиков</div>
              </div>
              <div className="text-center">
                <div className="font-bold">{userData.following}</div>
                <div className="text-gray-500 text-sm">Подписок</div>
              </div>
            </div>
            
            <p className="text-gray-700">{userData.bio || 'Биография не указана'}</p>
          </div>
        </div>
      </div>
      
      {/* Табы */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex">
          <button 
            className={`py-3 px-6 ${activeTab === 'posts' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
            onClick={() => setActiveTab('posts')}
          >
            Публикации
          </button>
          <button 
            className={`py-3 px-6 ${activeTab === 'saved' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
            onClick={() => setActiveTab('saved')}
          >
            Сохраненные
          </button>
        </div>
      </div>
      
      {/* Контент */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div>
          {activeTab === 'posts' ? (
            posts.length > 0 ? (
              posts.map(post => {
                // Убедимся, что author всегда определен
                const postWithAuthor = {
                  ...post,
                  author: post.author || {
                    id: userData.uid || 'unknown',
                    name: userData.displayName,
                    avatar: userData.photoURL
                  }
                };
                
                return (
                  <Post 
                    key={post.id} 
                    {...postWithAuthor} 
                    onLike={(isLiked) => handleLike(post.id, isLiked)}
                    isLiked={likedPosts[post.id] || false}
                  />
                );
              })
            ) : (
              <div className="text-center py-10 text-gray-500">
                У вас пока нет публикаций
              </div>
            )
          ) : (
            <div className="text-center py-10 text-gray-500">
              У вас пока нет сохраненных публикаций
            </div>
          )}
        </div>
      )}
    </div>
  );
} 