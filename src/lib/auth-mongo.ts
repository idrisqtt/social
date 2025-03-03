import jwt from 'jsonwebtoken';
import { connectToDatabase } from './mongodb';
import UserModel, { IUser } from '../models/User';

// Тип данных для пользователя
export type User = {
  id: string;
  email: string;
  displayName: string;
  photoURL: string;
  createdAt: string;
  bio: string;
  followers: number;
  following: number;
  posts: number;
};

// Интерфейс для токена JWT
interface JwtPayload {
  id: string;
  email: string;
}

// JWT секретный ключ (должен быть в переменных окружения)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const TOKEN_EXPIRY = '7d'; // Срок действия токена

// Создание JWT токена
export const createToken = (user: IUser): string => {
  return jwt.sign(
    { id: user._id, email: user.email },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
};

// Проверка JWT токена
export const verifyToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
};

// Регистрация пользователя
export const registerUser = async (email: string, password: string, displayName: string): Promise<{ user: User; token: string }> => {
  try {
    await connectToDatabase();
    
    // Проверка, существует ли уже пользователь с таким email
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      throw new Error('Пользователь с таким email уже существует');
    }
    
    // Создаем аватар по умолчанию из имени пользователя
    const photoURL = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}`;
    
    // Создание нового пользователя
    const newUser = new UserModel({
      email,
      password,
      displayName,
      photoURL,
      createdAt: new Date(),
      bio: '',
      followers: 0,
      following: 0,
      posts: 0
    });
    
    // Сохранение пользователя (пароль будет хеширован в pre-save хуке)
    await newUser.save();
    
    // Создаем JWT токен
    const token = createToken(newUser);
    
    // Форматируем ответ пользователя
    const userResponse: User = {
      id: newUser._id.toString(),
      email: newUser.email,
      displayName: newUser.displayName,
      photoURL: newUser.photoURL,
      createdAt: newUser.createdAt.toISOString(),
      bio: newUser.bio,
      followers: newUser.followers,
      following: newUser.following,
      posts: newUser.posts
    };
    
    return { user: userResponse, token };
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

// Вход пользователя
export const signIn = async (email: string, password: string): Promise<{ user: User; token: string }> => {
  try {
    await connectToDatabase();
    
    // Поиск пользователя по email
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new Error('Пользователь не найден');
    }
    
    // Проверка пароля
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error('Неверный пароль');
    }
    
    // Создаем JWT токен
    const token = createToken(user);
    
    // Форматируем ответ пользователя
    const userResponse: User = {
      id: user._id.toString(),
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      createdAt: user.createdAt.toISOString(),
      bio: user.bio,
      followers: user.followers,
      following: user.following,
      posts: user.posts
    };
    
    return { user: userResponse, token };
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

// Получение данных пользователя по ID
export const getUserData = async (userId: string): Promise<User | null> => {
  try {
    await connectToDatabase();
    
    const user = await UserModel.findById(userId);
    if (!user) {
      return null;
    }
    
    return {
      id: user._id.toString(),
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      createdAt: user.createdAt.toISOString(),
      bio: user.bio,
      followers: user.followers,
      following: user.following,
      posts: user.posts
    };
  } catch (error) {
    console.error('Error getting user data:', error);
    throw error;
  }
};

// Поиск пользователя по токену
export const getUserByToken = async (token: string): Promise<User | null> => {
  try {
    const payload = verifyToken(token);
    if (!payload) return null;
    
    return await getUserData(payload.id);
  } catch (error) {
    console.error('Error getting user by token:', error);
    return null;
  }
}; 