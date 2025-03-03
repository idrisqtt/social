import { 
  doc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  increment 
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from './firebase';

// Тип данных пользователя
export type User = {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  createdAt: string;
  bio: string;
  followers: number;
  following: number;
  posts: number;
};

// Получить данные пользователя
export const getUserData = async (userId: string): Promise<User | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return null;
    }
    
    const userData = userDoc.data() as User;
    return userData;
  } catch (error) {
    console.error('Error getting user data:', error);
    throw error;
  }
};

// Обновить профиль пользователя
export const updateUserProfile = async (
  userId: string, 
  data: { 
    displayName?: string;
    bio?: string;
  }
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, data);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Обновить аватар пользователя
export const updateUserAvatar = async (userId: string, avatarFile: File): Promise<string> => {
  try {
    const storageRef = ref(storage, `avatars/${userId}`);
    await uploadBytes(storageRef, avatarFile);
    const downloadURL = await getDownloadURL(storageRef);
    
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      photoURL: downloadURL
    });
    
    return downloadURL;
  } catch (error) {
    console.error('Error updating user avatar:', error);
    throw error;
  }
};

// Подписаться на пользователя
export const followUser = async (currentUserId: string, targetUserId: string): Promise<void> => {
  try {
    // Обновляем счетчик отслеживаемых текущего пользователя
    const currentUserRef = doc(db, 'users', currentUserId);
    await updateDoc(currentUserRef, {
      following: increment(1)
    });
    
    // Обновляем счетчик подписчиков целевого пользователя
    const targetUserRef = doc(db, 'users', targetUserId);
    await updateDoc(targetUserRef, {
      followers: increment(1)
    });
    
    // Создаем запись о подписке в отдельной коллекции
    const followRef = collection(db, 'follows');
    await updateDoc(doc(followRef), {
      followerId: currentUserId,
      followingId: targetUserId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error following user:', error);
    throw error;
  }
};

// Отписаться от пользователя
export const unfollowUser = async (currentUserId: string, targetUserId: string): Promise<void> => {
  try {
    // Обновляем счетчик отслеживаемых текущего пользователя
    const currentUserRef = doc(db, 'users', currentUserId);
    await updateDoc(currentUserRef, {
      following: increment(-1)
    });
    
    // Обновляем счетчик подписчиков целевого пользователя
    const targetUserRef = doc(db, 'users', targetUserId);
    await updateDoc(targetUserRef, {
      followers: increment(-1)
    });
    
    // Удаляем запись о подписке
    const followsQuery = query(
      collection(db, 'follows'),
      where('followerId', '==', currentUserId),
      where('followingId', '==', targetUserId)
    );
    
    const querySnapshot = await getDocs(followsQuery);
    querySnapshot.forEach(async (document) => {
      await updateDoc(doc(db, 'follows', document.id), {});
    });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    throw error;
  }
};

// Проверить, подписан ли пользователь на другого пользователя
export const isFollowing = async (followerId: string, followingId: string): Promise<boolean> => {
  try {
    const followsQuery = query(
      collection(db, 'follows'),
      where('followerId', '==', followerId),
      where('followingId', '==', followingId)
    );
    
    const querySnapshot = await getDocs(followsQuery);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking follow status:', error);
    throw error;
  }
};

// Поиск пользователей
export const searchUsers = async (searchTerm: string): Promise<User[]> => {
  try {
    // В реальном приложении здесь должна быть более сложная логика поиска
    // Например, использование Algolia или другого сервиса полнотекстового поиска
    const usersQuery = query(
      collection(db, 'users'),
      where('displayName', '>=', searchTerm),
      where('displayName', '<=', searchTerm + '\uf8ff')
    );
    
    const querySnapshot = await getDocs(usersQuery);
    const users: User[] = [];
    
    querySnapshot.forEach(doc => {
      users.push(doc.data() as User);
    });
    
    return users;
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
}; 