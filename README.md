# Социальная сеть на Next.js

Полнофункциональное приложение социальной сети, построенное с использованием Next.js, MongoDB и TailwindCSS.

## Функциональные возможности

- Аутентификация (регистрация, вход, вход через Google)
- Профили пользователей
- Публикация постов с поддержкой изображений и видео
- Лента новостей
- Лайки и комментарии
- Система подписок на пользователей
- Чат в реальном времени
- Настройки пользователя и безопасности

## Технологии

- [Next.js 15](https://nextjs.org/) - React-фреймворк для разработки веб-приложений
- [MongoDB](https://www.mongodb.com/) - NoSQL база данных
- [Mongoose](https://mongoosejs.com/) - ODM для работы с MongoDB
- [TailwindCSS](https://tailwindcss.com/) - CSS-фреймворк для быстрой стилизации
- [TypeScript](https://www.typescriptlang.org/) - типизированный JavaScript
- [React Hot Toast](https://react-hot-toast.com/) - библиотека для уведомлений
- [React Icons](https://react-icons.github.io/react-icons/) - коллекция иконок для React

## Как настроить проект

### 1. Клонирование репозитория

```bash
git clone <url-репозитория>
cd social
```

### 2. Установка зависимостей

```bash
npm install
```

### 3. Настройка MongoDB Atlas

1. Создайте аккаунт на [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Создайте новый кластер (бесплатный M0 подойдет для начала)
3. Настройте доступ:
   - Создайте пользователя БД с паролем
   - Добавьте ваш IP в список разрешенных или разрешите доступ с любого IP (0.0.0.0/0) для разработки
4. Получите строку подключения (Connection String)
5. Заполните файл `.env.local` своими данными:

```bash
MONGODB_URI=mongodb+srv://Idris:76VcGRqWRx1Vii9L@cluster0.jpn4w.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

### 4. Запуск проекта

```bash
npm run dev
```

Приложение будет доступно по адресу: [http://localhost:3000](http://localhost:3000)

## Структура проекта

```
src/
├── app/                    # Страницы приложения Next.js
│   ├── api/                # API маршруты
│   ├── auth/               # Страницы аутентификации
│   ├── create/             # Страница создания поста
│   ├── feed/               # Лента новостей
│   ├── messages/           # Чат
│   ├── profile/            # Профиль пользователя
│   └── settings/           # Настройки пользователя
├── components/             # Общие компоненты
│   ├── CreatePostForm.tsx  # Форма создания поста
│   ├── Navigation.tsx      # Навигационная панель
│   └── Post.tsx            # Компонент поста
├── lib/                    # Бизнес-логика и сервисы
│   ├── AuthContext.tsx     # Контекст аутентификации
│   ├── mongodb.ts          # Подключение к MongoDB
│   ├── posts-mongo.ts      # Функции для работы с постами
│   └── users-mongo.ts      # Функции для работы с пользователями
└── models/                 # Mongoose модели
    ├── User.ts             # Модель пользователя
    ├── Post.ts             # Модель поста
    ├── Chat.ts             # Модель чата
    └── Message.ts          # Модель сообщения
```

## Дополнительные библиотеки

Для работы с MongoDB установлены следующие пакеты:
- `mongoose` - ODM для MongoDB
- `mongodb` - нативный драйвер MongoDB
- `bcrypt` - для хеширования паролей
- `jsonwebtoken` - для работы с JWT токенами

## Лицензия

MIT
