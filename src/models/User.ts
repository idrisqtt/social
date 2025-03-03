'use server';

import { Document, Schema, model, models } from 'mongoose';
import { hashPassword, comparePasswords } from '../lib/server-auth';

export interface IUser extends Document {
  email: string;
  password: string;
  displayName: string;
  photoURL: string;
  createdAt: Date;
  bio: string;
  followers: number;
  following: number;
  posts: number;
  comparePassword: (candidatePassword: string) => Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  displayName: {
    type: String,
    required: true,
    trim: true
  },
  photoURL: {
    type: String,
    default: 'https://via.placeholder.com/150'
  },
  bio: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  followers: {
    type: Number,
    default: 0
  },
  following: {
    type: Number,
    default: 0
  },
  posts: {
    type: Number,
    default: 0
  }
});

// Метод для сравнения пароля (использует server-auth.ts вместо прямого bcrypt)
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return comparePasswords(candidatePassword, this.password);
};

// Хук перед сохранением для хеширования пароля
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  try {
    // Используем функцию из server-auth.ts вместо прямого bcrypt
    this.password = await hashPassword(this.password);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Экспортируем модель, создавая её только если она не существует
const User = models.User || model<IUser>('User', UserSchema);
export default User; 