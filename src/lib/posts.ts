import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit,
  Timestamp,
  where,
  doc,
  getDoc,
  updateDoc,
  increment,
  deleteDoc
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from './firebase';

// Типы для постов
export type MediaItem = {
  type: 'image' | 'video';
  url: string;
};

export type Post = {
  id: string;
  authorId: string;
  content: string;
  media?: MediaItem[];
  likes: number;
  comments: number;
  createdAt: string;
  author?: {
    id: string;
    name: string;
    avatar: string;
  };
};

// Создать новый пост
export const createPost = async (
  userId: string, 
  content: string, 
  mediaFiles: File[]
): Promise<string> => {
  try {
    // Загрузка медиафайлов, если они есть
    const mediaItems: MediaItem[] = [];
    
    if (mediaFiles.length > 0) {
      for (const file of mediaFiles) {
        const fileType = file.type.startsWith('image/') ? 'image' : 'video';
        const storageRef = ref(storage, `posts/${userId}/${Date.now()}_${file.name}`);
        
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        
        mediaItems.push({
          type: fileType,
          url: downloadURL
        });
      }
    }
    
    // Создание документа поста
    const postData = {
      authorId: userId,
      content,
      media: mediaItems,
      likes: 0,
      comments: 0,
      createdAt: Timestamp.now()
    };
    
    const docRef = await addDoc(collection(db, 'posts'), postData);
    
    // Обновление счетчика постов пользователя
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      posts: increment(1)
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

// Получить посты для ленты новостей
export const getFeedPosts = async (limitCount = 20): Promise<Post[]> => {
  try {
    const postsQuery = query(
      collection(db, 'posts'), 
      orderBy('createdAt', 'desc'), 
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(postsQuery);
    const posts: Post[] = [];
    
    for (const docSnapshot of querySnapshot.docs) {
      const postData = docSnapshot.data();
      const authorDoc = await getDoc(doc(db, 'users', postData.authorId));
      const authorData = authorDoc.data();
      
      posts.push({
        id: docSnapshot.id,
        authorId: postData.authorId,
        content: postData.content,
        media: postData.media || [],
        likes: postData.likes,
        comments: postData.comments,
        createdAt: postData.createdAt.toDate().toISOString(),
        author: {
          id: authorData?.uid,
          name: authorData?.displayName,
          avatar: authorData?.photoURL
        }
      });
    }
    
    return posts;
  } catch (error) {
    console.error('Error getting feed posts:', error);
    throw error;
  }
};

// Получить посты конкретного пользователя
export const getUserPosts = async (userId: string): Promise<Post[]> => {
  try {
    const postsQuery = query(
      collection(db, 'posts'),
      where('authorId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(postsQuery);
    const userDoc = await getDoc(doc(db, 'users', userId));
    const userData = userDoc.data();
    
    const posts: Post[] = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        authorId: userId,
        content: data.content,
        media: data.media || [],
        likes: data.likes,
        comments: data.comments,
        createdAt: data.createdAt.toDate().toISOString(),
        author: {
          id: userData?.uid,
          name: userData?.displayName,
          avatar: userData?.photoURL
        }
      };
    });
    
    return posts;
  } catch (error) {
    console.error('Error getting user posts:', error);
    throw error;
  }
};

// Лайкнуть пост
export const likePost = async (postId: string) => {
  try {
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      likes: increment(1)
    });
  } catch (error) {
    console.error('Error liking post:', error);
    throw error;
  }
};

// Убрать лайк с поста
export const unlikePost = async (postId: string) => {
  try {
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      likes: increment(-1)
    });
  } catch (error) {
    console.error('Error unliking post:', error);
    throw error;
  }
};

// Удалить пост
export const deletePost = async (postId: string, userId: string) => {
  try {
    // Проверяем, принадлежит ли пост пользователю
    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postRef);
    
    if (!postDoc.exists()) {
      throw new Error('Post not found');
    }
    
    const postData = postDoc.data();
    if (postData.authorId !== userId) {
      throw new Error('Not authorized to delete this post');
    }
    
    // Удаляем пост
    await deleteDoc(postRef);
    
    // Обновляем счетчик постов пользователя
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      posts: increment(-1)
    });
    
    return true;
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
}; 