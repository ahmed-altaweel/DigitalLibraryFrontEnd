# Scholarly Digital Library Platform — Frontend

A high-performance, accessible, and bilingual (Arabic RTL + English LTR) scholarly reading room web application built for academic research, digital archives, and manuscript discovery. Powered by React 18, Vite, TanStack Query, and native CSS Modules with design tokens.

---

## 📚 Philosophy & Visual Identity

The interface is inspired by historical library reading rooms, quiet study halls, and fine typography:
- **Primary Color (Deep Ink Blue / كحلي المخطوطات)**: `#1A2F4C`
- **Secondary / Accent (Antique Brass / نحاس معتق)**: `#946E00`
- **Canvas / Surface (Warm Paper Parchment / ورق دافئ)**: `#FBF9F5` / `#FFFFFF`
- **Text & Ink (Dark Charcoal / مداد داكن)**: `#14171A`
- **Alternative Theme (Sepia / ورق البردي)**: `#F4ECD8` (reduced eye fatigue for prolonged reading sessions)

All colors meet **WCAG 2.2 AA** minimum contrast ratios (\(\ge 4.5:1\) for normal text, \(\ge 3:1\) for large text and UI components).

---

## 🏗️ Architecture & Technology Stack

- **Framework**: React 18 + Vite
- **Routing**: React Router 6 (nested layouts, role-guarded routes, returnUrl handling)
- **Data Fetching & Cache**: TanStack Query (React Query) v5
- **Styling**: Pure CSS Modules + Custom Design Tokens (Zero Tailwind or external heavy UI frameworks)
- **RTL & Internationalization**: Custom lightweight reactive i18n hook (`useTranslation`), syncs `document.documentElement` (`dir="rtl"`, `lang="ar"`), persistent in `localStorage`.
- **Icons**: Lucide React with CSS `.rtl-flip` for bidirectional mirroring
- **Document Reader**: Custom PDF.js reader with canvas streaming, page jumping, zoom controls, themes, and reading progress auto-save.
- **Testing**: Vitest + React Testing Library + jsdom

---

## 📁 Directory Structure

```
frontend/
├── nginx.conf                 # Production Nginx reverse proxy & SPA fallback configuration
├── Dockerfile                 # Multi-stage Dockerfile (dev + prod nginx stages)
├── index.html                 # App shell with preloaded scholarly Google fonts
├── package.json               # Dependencies and npm scripts
├── vite.config.js             # Vite build & Vitest runner configuration
└── src/
    ├── main.jsx               # App entrypoint wrapped in QueryClient, I18n, Theme, Auth, Toast providers
    ├── App.jsx                # Complete route hierarchy (public, member, admin)
    ├── styles/
    │   ├── tokens.css         # CSS Variables (colors, typography, spacing, shadows, radius)
    │   ├── reset.css          # Modern CSS reset
    │   └── global.css         # Global defaults, scrollbars, focus rings, RTL rules
    ├── i18n/
    │   ├── index.jsx          # Reactive i18n context & useTranslation hook
    │   └── locales/
    │       ├── ar.json        # Comprehensive Arabic translation dictionary
    │       └── en.json        # Comprehensive English translation dictionary
    ├── context/
    │   ├── AuthContext.jsx    # Session hydration (/auth/me), login, logout, roles (admin, editor, member)
    │   ├── ThemeContext.jsx   # light, dark, and sepia themes
    │   └── ToastContext.jsx   # Accessible toast notification manager (aria-live="polite")
    ├── services/
    │   └── api.js             # Unified HTTP client, single-flight refresh mutex, CSRF, normalized ApiError
    ├── components/
    │   ├── common/            # Accessible primitives (Button, Input, Select, Modal, ConfirmDialog, Table, Pagination, Badge, EmptyState, CoverPlaceholder, Avatar, Spinner, Skeleton)
    │   ├── layout/            # Layout shells: Header, Footer, Sidebar, AdminLayout, ProtectedRoute
    │   └── catalog/           # MaterialCard, FilterChips
    ├── features/
    │   ├── reader/            # AddBookmarkModal, reader controls
    │   └── suggestions/       # SuggestCorrectionModal
    ├── pages/
    │   ├── public/            # HomePage, CatalogPage, SearchResultsPage, CategoryPage, AuthorPage, MaterialDetailPage, ReaderPage, NotFoundPage
    │   ├── auth/              # LoginPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage
    │   ├── member/            # DashboardPage, LibraryPage, ReadingListsPage, ReadingListDetailPage, ReadingProgressPage, BookmarksPage, UserNotesPage, UserTagsPage, ContributionsPage, SettingsPage
    │   └── admin/             # AdminDashboardPage, AdminMaterialsPage, AdminMaterialCreatePage, AdminMaterialEditPage, AdminCategoriesPage, AdminAuthorsPage, AdminTagsPage, AdminSuggestionsPage, AdminUsersPage, AdminAuditLogsPage
    └── test/                  # Unit and integration test suites
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js \(\ge 20.0\)
- npm \(\ge 10.0\)

### 1. Installation
```bash
cd frontend
npm install
```

### 2. Environment Configuration
Create a `.env` file in the `frontend/` directory (see `.env.example`):
```env
VITE_API_URL=/api/v1
```

### 3. Running Development Server
```bash
npm run dev
```
The application will be accessible at `http://localhost:5173`. Requests to `/api` are automatically proxied to `http://localhost:8000` via Vite's proxy configuration in `vite.config.js`.

### 4. Running Tests
```bash
npm test
```

### 5. Building for Production
```bash
npm run build
```
Build artifacts are placed in `frontend/dist/`.

---

## 🔒 Authentication & API Client Details

- **Cookie Credentials**: All HTTP requests send `credentials: 'include'` to pass HTTP-only `access_token` and `refresh_token` cookies.
- **Silent Token Refresh Mutex**: If a request receives a `401 Unauthorized`, an in-flight lock initiates a refresh request to `/auth/refresh`. Queued concurrent requests subscribe to the lock and retry seamlessly once refreshed. If refresh fails, the session is cleared and the user is redirected to `/login?returnUrl=...`.
- **CSRF Protection**: If a `csrf_token` cookie is present, it is automatically extracted and passed in the `X-CSRF-Token` request header.
- **Error Normalization**: FastAPI `422` validation arrays and detail strings are mapped into a standardized `ApiError` class with a `fieldErrors` dictionary for direct input field binding.

---

## 🌐 Internationalization & RTL Best Practices

1. **Logical CSS Properties**:
   Always use CSS logical properties instead of physical left/right:
   ```css
   /* Use this: */
   margin-inline-start: var(--space-4);
   padding-inline: var(--space-6);
   inset-inline-end: 0;
   text-align: start;

   /* Avoid this: */
   margin-left: 16px;
   padding-left: 24px;
   right: 0;
   text-align: left;
   ```

2. **Directional Icon Mirroring**:
   Icons indicating forward/backward navigation (e.g. `ArrowLeft`, `ChevronRight`) should include the `.rtl-flip` utility class, which flips them horizontally when `dir="rtl"`:
   ```jsx
   <ArrowLeft size={16} className="rtl-flip" />
   ```

3. **Number Formatting**:
   Numbers and counters should use `Intl.NumberFormat` with the active language locale (`ar-EG` or `en-US`):
   ```jsx
   new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US').format(count);
   ```

---

## 🐳 Docker Deployment

### Multi-Stage Production Build
To build and run the production image using Nginx:
```bash
# Build the production target
docker build --target prod -t library-frontend:latest ./frontend

# Run container
docker run -p 80:80 library-frontend:latest
```

### Docker Compose
Run all services (Database, FastAPI Backend, and Frontend) with:
```bash
docker compose up -d
```
