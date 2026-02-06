# CHINOR CRM — Frontend

<div align="center">

**Современный SPA для управления ресторанной CRM: гости, бронирования, рассылки и настройки.**

[React](https://react.dev/) · [TypeScript](https://www.typescriptlang.org/) · [Vite](https://vitejs.dev/) · [Tailwind CSS](https://tailwindcss.com/) · [shadcn/ui](https://ui.shadcn.com/)

</div>

---

## О проекте

Фронтенд-приложение **CHINOR CRM System** — единая точка входа для администраторов и хостес: дашборд с метриками, управление бронированиями, база гостей с сегментами, рассылки по аудитории и настройки (тема, уведомления, бэкап). Интерфейс адаптирован под мобильные устройства и поддерживает светлую и тёмную тему.

---

## Возможности

| Раздел | Описание |
|--------|----------|
| **Дашборд** | Карточки метрик (брони, гости, no-show), блоки «Динамика» и «Сегменты» |
| **Бронирования** | Таблица с поиском и фильтром по дате, создание брони, смена статуса |
| **Гости** | Статистика по сегментам (Всего, VIP, Постоянные, Новички), таблица, экспорт в CSV |
| **Рассылки** | Выбор аудитории, текст с переменными `{name}`, `{last_visit}`, история рассылок |
| **Настройки** | Тема (день / ночь / как в системе), тостер-уведомления, авто-бэкап |

Дополнительно: защищённые маршруты (JWT), сайдбар с сворачиванием, мобильное меню (Sheet), скелетоны загрузки, единый API-слой с поддержкой моков и реального бэкенда.

---

## Стек

- **React 18** + **TypeScript**
- **Vite** — сборка и dev-сервер
- **React Router v6** — маршрутизация и защищённые роуты
- **Tailwind CSS** — стили, тёмная/светлая тема (CSS-переменные)
- **shadcn/ui** (Radix UI) — кнопки, карточки, формы, таблицы, диалоги, Sheet, Select, Switch
- **Lucide React** — иконки
- **Axios** — HTTP-клиент, перехват 401 и JWT в заголовках

---

## Структура проекта

```
frontend/
├── public/                 # Статика
├── src/
│   ├── main.tsx            # Точка входа, ThemeProvider
│   ├── App.tsx              # Router + ThemeProvider
│   ├── routes.tsx           # Маршруты и ProtectedRoute
│   ├── api/                 # Слой API
│   │   ├── client.ts        # Axios, baseURL, 401 → /login
│   │   ├── auth.ts          # Логин
│   │   ├── dashboard.ts     # Статистика
│   │   ├── bookings.ts      # Бронирования
│   │   ├── guests.ts        # Гости и экспорт CSV
│   │   ├── broadcasts.ts    # Рассылки
│   │   ├── settings.ts      # Настройки
│   │   └── mocks.ts         # Моки для разработки без бэка
│   ├── components/
│   │   ├── ui/              # shadcn: Button, Card, Input, Table, Dialog, Sheet, Select, Switch…
│   │   ├── layout/          # AppSidebar, AppHeader, MainLayout, MobileSheet
│   │   ├── pickers/         # DatePicker, TimePicker (десктоп + мобильный Sheet)
│   │   ├── skeletons/       # Скелетоны страниц
│   │   └── icons/           # Логотип CHINOR
│   ├── contexts/            # ThemeContext (день/ночь/система)
│   ├── hooks/               # useAuth, useIsMobile
│   ├── pages/               # Login, Dashboard, Bookings, Guests, Broadcasts, Settings
│   ├── types/               # Типы для API (User, Guest, Booking, Settings…)
│   ├── lib/                 # utils (cn и др.)
│   └── index.css            # Глобальные стили и темы
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## Быстрый старт

### Требования

- **Node.js** 18+
- **npm** или **pnpm**

### Установка

```bash
cd frontend
npm install
```

### Переменные окружения

Скопируйте пример и при необходимости отредактируйте:

```bash
cp .env.example .env
```

| Переменная | Описание |
|------------|----------|
| `VITE_API_URL` | URL бэкенда (без слэша в конце). Если не задан — используются моки. |
| `VITE_USE_MOCKS` | `true` — принудительно использовать моки даже при заданном `VITE_API_URL`. |

Пример для работы с реальным API:

```env
VITE_API_URL=http://localhost:8000
```

### Запуск

```bash
# Режим разработки (моки по умолчанию, если VITE_API_URL не задан)
npm run dev

# Сборка для продакшена
npm run build

# Превью собранного приложения
npm run preview

# Линтинг
npm run lint
```

После `npm run dev` приложение доступно по адресу **http://localhost:5173**.

---

## Скрипты

| Команда | Действие |
|---------|----------|
| `npm run dev` | Запуск Vite dev-сервера |
| `npm run build` | Проверка типов (tsc) и сборка (vite build) |
| `npm run preview` | Локальный просмотр собранного билда |
| `npm run lint` | Запуск ESLint |

---

## Адаптивность и темы

- **Мобильная адаптация:** сайдбар скрыт на экранах &lt; 768px, навигация в выезжающем Sheet; кнопки и поля с минимальной высотой 44px; таблицы с горизонтальным скроллом.
- **Темы:** в настройках доступны «День», «Ночь» и «Как в системе»; выбор сохраняется в `localStorage` и применяется без перезагрузки.

---

## API и моки

- Запросы к бэкенду идут на `VITE_API_URL/api` (например `http://localhost:8000/api`).
- При ответе **401** токен сбрасывается и выполняется редирект на `/login`.
- Без заданного `VITE_API_URL` или с `VITE_USE_MOCKS=true` все вызовы обслуживаются моками из `src/api/mocks.ts` — фронт можно разрабатывать и тестировать без запущенного бэкенда.

---

## Лицензия

Приватный проект CHINOR CRM System.
