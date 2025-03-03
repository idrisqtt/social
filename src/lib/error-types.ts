/**
 * Интерфейс для обработки ошибок в API-маршрутах
 */
export interface ApiError extends Error {
  message: string;
  code?: string | number;
  status?: number;
} 