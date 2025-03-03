import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  User,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from './firebase';
import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

// Регистрация пользователя
export const registerUser = async (email: string, password: string, displayName: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Обновить профиль пользователя с отображаемым именем
    await updateProfile(user, {
      displayName
    });
    
    // Создать запись пользователя в базе данных
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      displayName,
      photoURL: user.photoURL || `https://ui-avatars.com/api/?name=${displayName}`,
      createdAt: new Date().toISOString(),
      bio: '',
      followers: 0,
      following: 0,
      posts: 0
    });
    
    return user;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

// Вход пользователя
export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

// Вход через Google
export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    // Проверяем, существует ли пользователь в базе данных
    const userDoc = doc(db, 'users', user.uid);
    
    // Создаем запись, если пользователь новый
    await setDoc(userDoc, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`,
      createdAt: new Date().toISOString(),
      bio: '',
      followers: 0,
      following: 0,
      posts: 0
    }, { merge: true });
    
    return user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

// Выход из системы
export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Прослушивание изменений статуса аутентификации
export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
}; 