import mongoose, { Document, Schema } from 'mongoose';

// Интерфейс для поста
export interface IPost extends Document {
  userId: string;
  text: string;
  imageUrl?: string;
  likes: string[]; // Массив userId пользователей, лайкнувших пост
  comments: {
    userId: string;
    text: string;
    createdAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

// Схема поста
const PostSchema = new Schema<IPost>({
  userId: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String
  },
  likes: [{
    type: String,
    default: []
  }],
  comments: [{
    userId: {
      type: String,
      required: true
    },
    text: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Создание модели поста
const PostModel = mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);

export default PostModel; 