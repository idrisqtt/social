'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CreatePostForm from '@/components/CreatePostForm';
import { useAuth } from '@/lib/AuthContext';
import { createPost } from '@/lib/posts';
import toast from 'react-hot-toast';

export default function CreatePostPage() {
  const { user, userData } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleCreatePost = async (content: string, files: File[]) => {
    if (!user) {
      toast.error('Необходимо войти в систему для создания публикации');
      router.push('/auth/signin');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await createPost(user.uid, content, files);
      toast.success('Публикация успешно создана!');
      router.push('/feed');
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Ошибка при создании публикации. Пожалуйста, попробуйте еще раз.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Редирект на страницу входа, если пользователь не авторизован
  if (!user && typeof window !== 'undefined') {
    router.push('/auth/signin');
    return null;
  }
  
  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Создать публикацию</h1>
      
      <CreatePostForm onSubmit={handleCreatePost} isSubmitting={isSubmitting} />
      
      <div className="mt-4 text-gray-500 text-sm">
        <h2 className="font-semibold mb-2">Советы по созданию интересных публикаций:</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Используйте качественные фото и видео</li>
          <li>Делитесь интересными историями и впечатлениями</li>
          <li>Задавайте вопросы, вовлекая аудиторию в диалог</li>
          <li>Будьте вежливы и уважайте других пользователей</li>
        </ul>
      </div>
    </div>
  );
} 