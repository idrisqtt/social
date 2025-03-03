import mongoose from 'mongoose';
import { connectToDatabase } from './mongodb';
import PostModel from '@/models/Post';
import UserModel from '@/models/User';
import { User } from './auth-mongo';

// Тип данных для поста
export type Post = {
  id: string;
  userId: string;
  userName: string;
  userImage: string;
  text: string;
  imageUrl?: string;
  likes: string[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
  liked?: boolean;
};

// Тип данных для комментария
export type Comment = {
  id: string;
  userId: string;
  userName: string;
  userImage: string;
  text: string;
  createdAt: string;
};

// Создание нового поста
export const createPost = async (
  userId: string,
  text: string,
  imageUrl?: string
): Promise<Post> => {
  try {
    await connectToDatabase();
    
    // Находим автора поста
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error('Пользователь не найден');
    }
    
    // Создаем новый пост
    const post = new PostModel({
      userId: new mongoose.Types.ObjectId(userId),
      text,
      imageUrl,
      likes: [],
      comments: []
    });
    
    // Сохраняем пост
    await post.save();
    
    // Возвращаем созданный пост
    return {
      id: post._id.toString(),
      userId,
      userName: user.name || 'Пользователь',
      userImage: user.image || '',
      text,
      imageUrl,
      likes: [],
      comments: [],
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString()
    };
  } catch (error) {
    console.error('Ошибка при создании поста:', error);
    throw error;
  }
};

// Получение всех постов
export const getAllPosts = async (currentUserId?: string): Promise<Post[]> => {
  try {
    await connectToDatabase();
    
    // Получаем все посты, отсортированные по дате создания (сначала новые)
    const posts = await PostModel.find().sort({ createdAt: -1 });
    
    // Преобразуем посты в формат для клиента
    const formattedPosts = await Promise.all(
      posts.map(async (post) => {
        // Получаем автора поста
        const user = await UserModel.findById(post.userId);
        
        // Форматируем комментарии
        const comments = await Promise.all(
          post.comments.map(async (comment: any) => {
            const commentUser = await UserModel.findById(comment.userId);
            return {
              id: comment._id.toString(),
              userId: comment.userId.toString(),
              userName: commentUser ? (commentUser.name || 'Пользователь') : 'Неизвестный пользователь',
              userImage: commentUser ? (commentUser.image || '') : '',
              text: comment.text,
              createdAt: comment.createdAt.toISOString()
            };
          })
        );
        
        return {
          id: post._id.toString(),
          userId: post.userId.toString(),
          userName: user ? (user.name || 'Пользователь') : 'Неизвестный пользователь',
          userImage: user ? (user.image || '') : '',
          text: post.text,
          imageUrl: post.imageUrl,
          likes: post.likes.map((id: mongoose.Types.ObjectId) => id.toString()),
          comments,
          createdAt: post.createdAt.toISOString(),
          updatedAt: post.updatedAt.toISOString(),
          liked: currentUserId 
            ? post.likes.some((id: mongoose.Types.ObjectId) => id.toString() === currentUserId)
            : false
        };
      })
    );
    
    return formattedPosts;
  } catch (error) {
    console.error('Ошибка при получении постов:', error);
    throw error;
  }
};

// Получение постов конкретного пользователя
export const getUserPosts = async (
  userId: string,
  currentUserId?: string
): Promise<Post[]> => {
  try {
    await connectToDatabase();
    
    // Получаем посты пользователя
    const posts = await PostModel.find({ 
      userId: new mongoose.Types.ObjectId(userId) 
    }).sort({ createdAt: -1 });
    
    // Получаем информацию о пользователе
    const user = await UserModel.findById(userId);
    
    // Преобразуем посты в формат для клиента
    const formattedPosts = await Promise.all(
      posts.map(async (post) => {
        // Форматируем комментарии
        const comments = await Promise.all(
          post.comments.map(async (comment: any) => {
            const commentUser = await UserModel.findById(comment.userId);
            return {
              id: comment._id.toString(),
              userId: comment.userId.toString(),
              userName: commentUser ? (commentUser.name || 'Пользователь') : 'Неизвестный пользователь',
              userImage: commentUser ? (commentUser.image || '') : '',
              text: comment.text,
              createdAt: comment.createdAt.toISOString()
            };
          })
        );
        
        return {
          id: post._id.toString(),
          userId,
          userName: user ? (user.name || 'Пользователь') : 'Неизвестный пользователь',
          userImage: user ? (user.image || '') : '',
          text: post.text,
          imageUrl: post.imageUrl,
          likes: post.likes.map((id: mongoose.Types.ObjectId) => id.toString()),
          comments,
          createdAt: post.createdAt.toISOString(),
          updatedAt: post.updatedAt.toISOString(),
          liked: currentUserId 
            ? post.likes.some((id: mongoose.Types.ObjectId) => id.toString() === currentUserId)
            : false
        };
      })
    );
    
    return formattedPosts;
  } catch (error) {
    console.error('Ошибка при получении постов пользователя:', error);
    throw error;
  }
};

// Лайк поста
export const likePost = async (
  postId: string,
  userId: string
): Promise<Post> => {
  try {
    await connectToDatabase();
    
    // Находим пост
    const post = await PostModel.findById(postId);
    if (!post) {
      throw new Error('Пост не найден');
    }
    
    // ID пользователя в формате ObjectId
    const userObjectId = new mongoose.Types.ObjectId(userId);
    
    // Проверяем, есть ли уже лайк от этого пользователя
    const likeIndex = post.likes.findIndex(
      (id: mongoose.Types.ObjectId) => id.toString() === userId
    );
    
    // Если есть - удаляем, если нет - добавляем
    if (likeIndex !== -1) {
      post.likes.splice(likeIndex, 1);
    } else {
      post.likes.push(userObjectId);
    }
    
    // Сохраняем изменения
    await post.save();
    
    // Получаем автора поста
    const user = await UserModel.findById(post.userId);
    
    // Форматируем комментарии
    const comments = await Promise.all(
      post.comments.map(async (comment: any) => {
        const commentUser = await UserModel.findById(comment.userId);
        return {
          id: comment._id.toString(),
          userId: comment.userId.toString(),
          userName: commentUser ? (commentUser.name || 'Пользователь') : 'Неизвестный пользователь',
          userImage: commentUser ? (commentUser.image || '') : '',
          text: comment.text,
          createdAt: comment.createdAt.toISOString()
        };
      })
    );
    
    // Возвращаем обновленный пост
    return {
      id: post._id.toString(),
      userId: post.userId.toString(),
      userName: user ? (user.name || 'Пользователь') : 'Неизвестный пользователь',
      userImage: user ? (user.image || '') : '',
      text: post.text,
      imageUrl: post.imageUrl,
      likes: post.likes.map((id: mongoose.Types.ObjectId) => id.toString()),
      comments,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      liked: post.likes.some((id: mongoose.Types.ObjectId) => id.toString() === userId)
    };
  } catch (error) {
    console.error('Ошибка при лайке поста:', error);
    throw error;
  }
};

// Добавление комментария
export const addComment = async (
  postId: string,
  userId: string,
  text: string
): Promise<Post> => {
  try {
    await connectToDatabase();
    
    // Находим пост
    const post = await PostModel.findById(postId);
    if (!post) {
      throw new Error('Пост не найден');
    }
    
    // Находим пользователя, оставляющего комментарий
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error('Пользователь не найден');
    }
    
    // Создаем новый комментарий
    const newComment = {
      userId: new mongoose.Types.ObjectId(userId),
      text,
      createdAt: new Date()
    };
    
    // Добавляем комментарий к посту
    post.comments.push(newComment);
    
    // Сохраняем изменения
    await post.save();
    
    // Получаем автора поста
    const postAuthor = await UserModel.findById(post.userId);
    
    // Форматируем комментарии
    const comments = await Promise.all(
      post.comments.map(async (comment: any) => {
        const commentUser = await UserModel.findById(comment.userId);
        return {
          id: comment._id.toString(),
          userId: comment.userId.toString(),
          userName: commentUser ? (commentUser.name || 'Пользователь') : 'Неизвестный пользователь',
          userImage: commentUser ? (commentUser.image || '') : '',
          text: comment.text,
          createdAt: comment.createdAt.toISOString()
        };
      })
    );
    
    // Возвращаем обновленный пост
    return {
      id: post._id.toString(),
      userId: post.userId.toString(),
      userName: postAuthor ? (postAuthor.name || 'Пользователь') : 'Неизвестный пользователь',
      userImage: postAuthor ? (postAuthor.image || '') : '',
      text: post.text,
      imageUrl: post.imageUrl,
      likes: post.likes.map((id: mongoose.Types.ObjectId) => id.toString()),
      comments,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      liked: post.likes.some((id: mongoose.Types.ObjectId) => id.toString() === userId)
    };
  } catch (error) {
    console.error('Ошибка при добавлении комментария:', error);
    throw error;
  }
}; 