/** @type {import('next').NextConfig} */
const nextConfig = {
  // Явно указываем переменные окружения
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
  },
  
  // Указываем bcrypt как серверный пакет
  serverExternalPackages: ['bcrypt'],
  
  // Отключаем React StrictMode, чтобы избежать проблем с гидратацией
  reactStrictMode: false,
  
  // Полная настройка Webpack
  webpack: (config, { isServer }) => {
    // Настраиваем фоллбэки для всех проблемных модулей
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      path: false,
      child_process: false,
      os: false,
      crypto: false,
      stream: false,
      http: false,
      https: false,
      zlib: false,
      assert: false,
      url: false,
      util: false
    };
    
    // Игнорируем проблемные файлы и модули
    config.module.rules.push({
      test: /\.html$/i,
      use: 'ignore-loader'
    });
    
    // Добавляем aliases для проблемных модулей
    // Это заменит их импорты пустыми модулями
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'mock-aws-s3': false,
        'nock': false,
        'aws-sdk': false,
        '@mapbox/node-pre-gyp': false
      };
    }
    
    return config;
  }
};

module.exports = nextConfig; 