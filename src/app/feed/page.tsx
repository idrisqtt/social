'use client';

import Post from '@/components/Post';
import { useEffect, useState } from 'react';
import { getFeedPosts, Post as PostType, likePost, unlikePost } from '@/lib/posts';
import { useAuth } from '@/lib/AuthContext';
import toast from 'react-hot-toast';

export default function FeedPage() {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  // Создаем объект для хранения состояния лайков постов
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  
  // Загружаем посты для ленты
  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        const fetchedPosts = await getFeedPosts();
        setPosts(fetchedPosts);
      } catch (error) {
        console.error('Error loading posts:', error);
        toast.error('Ошибка при загрузке публикаций');
      } finally {
        setLoading(false);
      }
    };
    
    loadPosts();
  }, []);
  
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
  
  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Лента новостей</h1>
      
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div>
          {posts.map(post => (
            <Post 
              key={post.id} 
              {...post} 
              onLike={(isLiked) => handleLike(post.id, isLiked)}
              isLiked={likedPosts[post.id] || false}
            />
          ))}
          
          {posts.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              В вашей ленте пока нет постов. Подпишитесь на других пользователей, чтобы видеть их обновления.
            </div>
          )}
        </div>
      )}
    </div>
  );
} 