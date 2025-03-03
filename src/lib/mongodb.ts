import mongoose from 'mongoose';

// Проверяем, находимся ли мы в браузере
const isBrowser = typeof window !== 'undefined';

// Типы для глобальной переменной
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Объявление глобальной переменной только на сервере
declare global {
  var mongoose: MongooseCache;
}

// Инициализация глобальной переменной только на сервере
if (!isBrowser && !global.mongoose) {
  global.mongoose = {
    conn: null,
    promise: null,
  };
}

// Получение строки подключения к MongoDB
function getConnectionString(): string {
  // Проверяем наличие в process.env
  const envConnectionString = process.env.MONGODB_URI;
  
  if (!envConnectionString) {
    // Если нет в process.env, используем жесткое значение (только для разработки!)
    console.warn('ВНИМАНИЕ: MONGODB_URI не найден в переменных окружения! Используем резервную строку подключения.');
    return "mongodb+srv://Idris:76VcGRqWRx1Vii9L@cluster0.jpn4w.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
  }
  
  return envConnectionString;
}

// Функция подключения к MongoDB - работает только на сервере
export async function connectToDatabase(): Promise<typeof mongoose> {
  // Если мы в браузере, возвращаем ошибку или пустое значение
  if (isBrowser) {
    console.error('Попытка подключения к MongoDB из браузера');
    throw new Error('MongoDB не может быть использован в браузере. Используйте этот метод только в серверных компонентах или API маршрутах.');
  }

  // Если соединение уже установлено, возвращаем его
  if (global.mongoose.conn) {
    console.log('Используем существующее соединение с MongoDB');
    return global.mongoose.conn;
  }

  // Получаем строку подключения
  const connectionString = getConnectionString();
  console.log('Строка подключения получена, пробуем подключиться...');

  // Если промис подключения еще не создан, создаем его
  if (!global.mongoose.promise) {
    const opts = {
      bufferCommands: false,
    };

    global.mongoose.promise = mongoose
      .connect(connectionString, opts)
      .then((mongoose) => {
        console.log('Подключено к MongoDB!');
        return mongoose;
      });
  }

  try {
    // Ожидаем завершения подключения
    global.mongoose.conn = await global.mongoose.promise;
  } catch (error) {
    // В случае ошибки сбрасываем промис и пробрасываем ошибку
    global.mongoose.promise = null;
    console.error('Ошибка подключения к MongoDB:', error);
    throw error;
  }
  
  return global.mongoose.conn;
}

export default connectToDatabase; 