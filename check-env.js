// Загружаем переменные окружения из .env и .env.local
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

console.log('Проверка переменных окружения:');
console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('Все переменные окружения:', Object.keys(process.env)); 