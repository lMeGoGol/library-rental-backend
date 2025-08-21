Backend API для бібліотеки на Node.js + Express + MongoDB

Інструкція:

1. Встановлення залежностей
npm install

2. Налаштування змінних середовища
*Створити файл .env в корені проєкту і додати туди:
PORT=5000
MONGO_URI=mongodb://localhost:27017/library
JWT_SECRET=supersecret123

3. Запуск сервера
-Режим розробки (з автоматичним перезапуском):
npm run dev

-Звичайний запуск:
npm start

Після запуску API буде доступне на:
http://localhost:5000/api

Основні ендпоінти:

Auth
-POST /api/auth/register — реєстрація
-POST /api/auth/login — логін

Books
-GET /api/books — список книг
-POST /api/books — створити книгу (admin, librarian)
-PUT /api/books/:id — оновити книгу (admin, librarian)
-DELETE /api/books/:id — видалити книгу (admin)

Users
-GET /api/users — список користувачів (admin, librarian)
-GET /api/users/:id — переглянути користувача (self, librarian, admin)
-PUT /api/users/:id — оновити користувача (self, librarian, admin)
-DELETE /api/users/:id — видалити користувача (admin)
-POST /api/users/:id/role — змінити роль (admin)

Loans
-POST /api/loans/issue — видати книгу (admin, librarian)
-POST /api/loans/return/:id — повернути книгу (admin, librarian)
-GET /api/loans — список усіх прокатів (admin, librarian)
-GET /api/loans/my — мої прокати (reader)

Використані технології:
-Node.js
-Express
-MongoDB + Mongoose
-JSON Web Tokens (JWT)
-dotenv, cors
