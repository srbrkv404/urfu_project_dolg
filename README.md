# Campus Jobs

Учебный проект сервиса для поиска временной работы и стажировок в университете.

## Что реализовано

- Backend: Node.js + Express + Prisma + PostgreSQL
- Frontend: React + Vite + Bootstrap
- Авторизация: JWT + роли `student` / `employer` (RBAC)
- Ключевой сценарий работодателя:
  - вход
  - создание вакансии
  - просмотр откликов
  - смена статуса отклика
- Единый формат ошибок API
- Swagger документация

## Структура

```text
project_urfu_dolg/
  client/                  # frontend (React)
  server/                  # backend (Express)
    prisma/schema.prisma   # схема БД
    docs/openapi.yaml      # Swagger спецификация
    docs/er-diagram.md     # ER-диаграмма БД
```

## Требования

- Node.js 20+
- npm 10+
- PostgreSQL 14+

## Установка и запуск

### 1) Установить зависимости (один раз)

```bash
npm install
npm install --prefix client
npm install --prefix server
```

### 2) Создать базу данных PostgreSQL

Создайте БД с именем `campus_jobs` любым удобным способом (pgAdmin/psql/GUI).

Пример через `psql`:

```sql
CREATE DATABASE campus_jobs;
```

### 3) Настроить переменные окружения сервера

Создайте файл `server/.env` (можно скопировать из `server/.env.example`):

```env
PORT=4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/campus_jobs
JWT_SECRET=change_me
JWT_EXPIRES_IN=7d
```

### 4) Применить Prisma-схему к БД

Из папки `server`:

```bash
npx prisma migrate dev --name init
npm run prisma:generate
```

### 5) Запустить проект

Из корня проекта:

```bash
npm run dev
```

После запуска:
- client: `http://localhost:5173`
- server: `http://localhost:4000`
- Swagger UI: `http://localhost:4000/api/docs`

## Быстрая проверка работоспособности

### Проверка backend

Открыть в браузере:
- `http://localhost:4000/api/health`  
Ожидается JSON с `success: true`.

### Проверка frontend

Открыть:
- `http://localhost:5173`

Должна отобразиться страница входа/регистрации.

## Проверка ключевого сценария (рекомендуется для защиты)

### Шаг 1. Зарегистрировать работодателя и войти (UI)

1. Открыть `http://localhost:5173`
2. Нажать «У меня нет аккаунта»
3. Заполнить поля работодателя
4. Войти в систему

Ожидается переход на страницу «Мои вакансии».

### Шаг 2. Создать вакансию (UI)

1. Нажать «Создать вакансию»
2. Заполнить форму
3. Нажать «Сохранить»

Ожидается новая вакансия в списке.

### Шаг 3. Создать студента и отклик (API)

UI студента в этом проекте не реализован, поэтому отклик создается через API (Postman/Insomnia/Swagger).

#### 3.1 Регистрация студента

`POST http://localhost:4000/api/auth/register`

```json
{
  "email": "student1@test.com",
  "password": "123456",
  "fullName": "Student One",
  "role": "student",
  "studyProgram": "CS",
  "courseYear": 3
}
```

#### 3.2 Логин студента

`POST http://localhost:4000/api/auth/login`

```json
{
  "email": "student1@test.com",
  "password": "123456"
}
```

Скопируйте `token` из ответа.

#### 3.3 Отправка отклика

`POST http://localhost:4000/api/applications`

Headers:
- `Authorization: Bearer <student_token>`

Body:

```json
{
  "jobPostId": 1,
  "coverLetter": "Хочу пройти стажировку"
}
```

### Шаг 4. Проверить отклик и сменить статус (UI работодателя)

1. Вернуться в UI работодателя
2. Открыть «Отклики» по нужной вакансии
3. Изменить статус отклика (`REVIEWING`, `ACCEPTED`, `REJECTED`)

Ожидается обновление статуса в таблице/карточке.

## Как проверять API

### Вариант 1: Swagger

- Открыть `http://localhost:4000/api/docs`
- Выбрать endpoint
- Нажать `Try it out`
- Для защищенных endpoint нажать `Authorize` и вставить:
  - `Bearer <token>`

### Вариант 2: Postman/Insomnia

Использовать те же URL и JSON-примеры из раздела выше.

## Формат ошибок API

Все ошибки возвращаются в едином формате:

```json
{
  "error": {
    "type": "validation_error",
    "code": "BAD_REQUEST",
    "userMessage": "Некорректные данные вакансии.",
    "developerMessage": "Некорректные данные вакансии.",
    "details": [
      {
        "field": "title",
        "issue": "String must contain at least 3 character(s)",
        "expected": "too_small"
      }
    ],
    "traceId": "trace-1710000000000"
  }
}
```

## Что показать на защите

1. Запуск проекта (`npm run dev`)
2. Рабочие страницы:
   - вход/регистрация
   - список вакансий работодателя
   - создание вакансии
   - отклики и смена статуса
3. Вкладка Network в браузере:
   - `POST /api/jobs`
   - `GET /api/jobs/:id/applications`
   - `PATCH /api/applications/:id/status`
4. Swagger (`/api/docs`)
5. ER-диаграмма (`server/docs/er-diagram.md`) и Prisma-схема (`server/prisma/schema.prisma`)

## Полезные команды

Из корня:

```bash
npm run dev
```

Из `server`:

```bash
npm run dev
npm run prisma:generate
npx prisma migrate dev
```

Из `client`:

```bash
npm run dev
npm run build
```

## Остановка проекта

В терминале с запущенным `npm run dev` нажать:
- `Ctrl + C`
