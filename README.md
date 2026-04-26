# Campus Jobs

Учебный проект сервиса для поиска временной работы и стажировок в университете.

## Структура

```text
project_urfu_dolg/
  client/   # React + Vite
  server/   # Node.js + Express
```

## Быстрый старт

### 1) Установить зависимости

```bash
npm install
npm install --prefix client
npm install --prefix server
```

### 2) Настроить переменные сервера

Скопировать `server/.env.example` в `server/.env` и при необходимости поправить значения.

### 3) Запуск в dev-режиме

Из корня проекта:

```bash
npm run dev
```

Будут запущены:
- client: `http://localhost:5173`
- server: `http://localhost:4000`

Проверка API:
- `GET http://localhost:4000/api/health`
