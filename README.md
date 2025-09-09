# Library Rental Backend

Minimal REST API (Express 5 + Mongoose) for managing library books, users, loans і бронювання.

## Основні можливості
- Аутентифікація (JWT): реєстрація / вхід
- Книги: CRUD, ліміти на доступність, депозит, орендна ціна
- Позики: видача, продовження, повернення, штрафи за прострочку
- Бронювання: створення черги якщо книги нема, перегляд власних, відміна
- Знижки (категорії) + розрахунок загальної вартості та штрафів
- Перевірка даних через Zod, уніфікований error handler
- Swagger документація: /api/docs

## Швидкий старт
Створіть `.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/library
JWT_SECRET=change_me
LOG_LEVEL=info
MAX_ACTIVE_LOANS=5
MAX_RENEWS=2
```
Встановлення та запуск (dev):
```
npm install
npm run dev
```
Продакшн:
```
npm install --production
npm start
```

## API Документація
Swagger UI: http://localhost:5000/api/docs
Health check: GET /api/health (відповідь: { "status": "ok" })

## Структура каталогу
```
src/
	app.js         Express застосунок
	server.js      Точка входу
	models/        Mongoose моделі
	controllers/   Логіка HTTP
	services/      Бізнес логіка
	routes/        Маршрути
	middleware/    Auth, валідація, помилки
	utils/         Допоміжні функції (pricing, logger, errors)
	docs/          OpenAPI (swagger)
```

## Відмінності від початкової версії
- Видалено: debug маршрути, upload сервіс, email нотифікації, cron планувальник
- Спрощено pricing (мінімальні функції)
- Скорочено коментарі та підказки, уніфіковано стиль

## Тести
Наразі відсутні (можна додати jest + інтеграційні тести для критичних сценаріїв: issue → return → renew).

## Ліцензія
ISC
