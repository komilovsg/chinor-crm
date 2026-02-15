# CHINOR CRM — Frontend

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.6-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/shadcn%2Fui-Radix-000000?style=flat-square" alt="shadcn/ui" />
</p>

<div align="center">

**Современный SPA для управления ресторанной CRM: гости, бронирования, рассылки и настройки.**

Единая точка входа для администраторов и хостес — дашборд с метриками, бронирования, база гостей с сегментами, рассылки по аудитории и гибкие настройки. Адаптивный интерфейс, светлая и тёмная тема, работа без бэкенда на моках.

</div>

---

## Идея

Фронтенд **CHINOR CRM System** даёт команде ресторана один интерфейс: посмотреть метрики, принять или переназначить бронь, найти гостя, отправить рассылку по сегменту (VIP, Постоянные, Новички, Все) и настроить пороги сегментов, тему и уведомления. Всё с учётом ролей (admin / hostess), с защищёнными маршрутами по JWT и с возможностью разрабатывать и тестировать интерфейс без запущенного бэкенда — за счёт моков.

---

## Возможности

| Раздел | Описание |
|--------|----------|
| **Дашборд** | Карточки метрик (брони, гости, no-show), блоки «Динамика» и «Сегменты гостей» |
| **Бронирования** | Таблица с поиском и фильтром по дате, создание брони (гость или новый), смена статуса |
| **Гости** | Статистика по сегментам (Всего, VIP, Постоянные, Новички), таблица, экспорт в CSV |
| **Рассылки** | Выбор аудитории, текст с переменными `{name}`, `{last_visit}`, загрузка изображения, история рассылок |
| **Настройки** | Тема (день / ночь / как в системе), уведомления, авто-бэкап, пороги сегментов, webhook-интеграции |
| **Пользователи** | Управление пользователями (admin) |

Дополнительно: сайдбар с сворачиванием, мобильное меню (Sheet), скелетоны загрузки, единый API-слой с поддержкой моков и реального бэкенда, перехват 401 и редирект на логин.

---

## Стек

- **React 18** + **TypeScript**
- **Vite** — сборка и dev-сервер
- **React Router v6** — маршрутизация и защищённые роуты
- **Tailwind CSS** — стили, тёмная/светлая тема (CSS-переменные)
- **shadcn/ui** (Radix UI) — кнопки, карточки, формы, таблицы, диалоги, Sheet, Select, Switch
- **Lucide React** — иконки
- **Axios** — HTTP-клиент, JWT в заголовках
- **Recharts** — графики на дашборде

---

## Дерево проекта

```
frontend/
├── public/                    # Статика
├── src/
│   ├── main.tsx               # Точка входа, провайдеры
│   ├── App.tsx                # Router, ThemeProvider
│   ├── routes.tsx             # Маршруты и ProtectedRoute
│   ├── api/
│   │   ├── client.ts          # Axios, baseURL, 401 → /login
│   │   ├── auth.ts            # Логин
│   │   ├── dashboard.ts       # Статистика, сегменты, динамика
│   │   ├── bookings.ts        # Бронирования
│   │   ├── guests.ts          # Гости, экспорт CSV
│   │   ├── broadcasts.ts      # Рассылки, загрузка изображения
│   │   ├── settings.ts       # Настройки
│   │   ├── users.ts           # Пользователи
│   │   └── mocks.ts           # Моки для разработки без бэка
│   ├── components/
│   │   ├── ui/                # shadcn: Button, Card, Input, Table, Dialog, Sheet, Select, Switch…
│   │   ├── layout/            # AppSidebar, AppHeader, MainLayout, MobileSheet
│   │   ├── pickers/           # DatePicker, TimePicker (десктоп + мобильный Sheet)
│   │   ├── skeletons/         # Скелетоны страниц
│   │   └── icons/             # Логотип CHINOR
│   ├── contexts/              # ThemeContext (день/ночь/система)
│   ├── hooks/                 # useAuth, useIsMobile
│   ├── pages/                 # Login, Dashboard, Bookings, Guests, Broadcasts, Settings, Users
│   ├── types/                 # Типы для API (User, Guest, Booking, Settings…)
│   ├── lib/                   # utils (cn и др.)
│   └── index.css              # Глобальные стили и темы
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
