import mongoose, { Document, Schema } from 'mongoose';

// Интерфейс сообщения
export interface IMessage {
  senderId: string;
  text: string;
  createdAt: Date;
  read: boolean;
}

// Интерфейс для чата
export interface IChat extends Document {
  participants: string[]; // Массив userId участников
  messages: IMessage[];
  lastMessage?: {
    senderId: string;
    text: string;
    createdAt: Date;
    read: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Схема сообщения
const MessageSchema = new Schema<IMessage>({
  senderId: {
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
  },
  read: {
    type: Boolean,
    default: false
  }
});

// Схема чата
const ChatSchema = new Schema<IChat>({
  participants: [{
    type: String,
    required: true
  }],
  messages: [MessageSchema],
  lastMessage: {
    senderId: {
      type: String
    },
    text: {
      type: String
    },
    createdAt: {
      type: Date
    },
    read: {
      type: Boolean,
      default: false
    }
  },
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

// Создание модели чата
const ChatModel = mongoose.models.Chat || mongoose.model<IChat>('Chat', ChatSchema);

export default ChatModel; 