import Image from 'next/image';
import { FaHeart, FaComment, FaShare } from 'react-icons/fa';
import { useState, useEffect } from 'react';

type MediaItem = {
  type: 'image' | 'video';
  url: string;
};

type PostProps = {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  content: string;
  media?: MediaItem[];
  likes: number;
  comments: number;
  createdAt: string;
  isLiked?: boolean;
  onLike?: (isLiked: boolean) => void;
};

export default function Post({ 
  author, 
  content, 
  media, 
  likes, 
  comments, 
  createdAt, 
  isLiked = false,
  onLike 
}: PostProps) {
  const [liked, setLiked] = useState(isLiked);
  const [likeCount, setLikeCount] = useState(likes);
  
  // Обновляем состояние, если props изменились
  useEffect(() => {
    setLiked(isLiked);
    setLikeCount(likes);
  }, [isLiked, likes]);

  const handleLike = () => {
    const newLikedState = !liked;
    setLiked(newLikedState);
    
    if (onLike) {
      onLike(liked); // Передаем текущее состояние лайка, до изменения
    } else {
      // Если функция не передана, обновляем локальное состояние
      setLikeCount(prevCount => newLikedState ? prevCount + 1 : prevCount - 1);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      {/* Шапка поста с информацией об авторе */}
      <div className="flex items-center mb-3">
        <div className="relative w-10 h-10 rounded-full overflow-hidden mr-3">
          <Image 
            src={author.avatar} 
            alt={author.name} 
            fill 
            className="object-cover"
          />
        </div>
        <div>
          <h3 className="font-semibold">{author.name}</h3>
          <p className="text-gray-500 text-xs">{new Date(createdAt).toLocaleString('ru')}</p>
        </div>
      </div>
      
      {/* Контент поста */}
      <div className="mb-3">
        <p className="mb-2 whitespace-pre-line">{content}</p>
        
        {/* Медиа контент */}
        {media && media.length > 0 && (
          <div className={`grid gap-2 ${media.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {media.map((item, index) => (
              <div key={index} className="relative aspect-video rounded-lg overflow-hidden">
                {item.type === 'image' ? (
                  <Image 
                    src={item.url} 
                    alt={`Media ${index}`} 
                    fill 
                    className="object-cover"
                  />
                ) : (
                  <video 
                    src={item.url} 
                    className="w-full h-full" 
                    controls 
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Действия поста */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <button 
          className={`flex items-center ${liked ? 'text-red-500' : 'text-gray-500'} hover:text-red-500`}
          onClick={handleLike}
        >
          <FaHeart className="mr-1" /> 
          <span>{likeCount}</span>
        </button>
        
        <button className="flex items-center text-gray-500 hover:text-blue-500">
          <FaComment className="mr-1" /> 
          <span>{comments}</span>
        </button>
        
        <button className="flex items-center text-gray-500 hover:text-green-500">
          <FaShare className="mr-1" /> 
          <span>Поделиться</span>
        </button>
      </div>
    </div>
  );
} 