# Clinic Topics Admin Panel

A full-featured administrative dashboard for the Clinic Topics platform. The frontend is a single-page React application built with TypeScript and Vite, providing a modular interface for managing users, content, commerce and system configuration. The panel is intended for internal staff such as super‑admins, support admins, and finance admins; doctors also receive a special “My Reposit” section when they log in.

---

## 📌 Project Overview

The Admin Panel is the back‑office interface used to:

- Maintain doctors and patients user accounts.
- Manage product catalogs, orders and coupons.
- Curate educational content (topics, events, IDI, advisory, advertisements).
- View analytics and system health on a dashboard.
- Configure application settings and review notifications.

It sits on top of a RESTful API (Django/DRF assumed) and communicates via JWT tokens. The client handles routing, authentication, form workflows, and basic offline fallbacks with mock data when the API is unavailable.

### 🎯 Purpose of the Admin Panel

The panel consolidates administrative and operational tasks into a single web app. It empowers staff to keep the clinic platform’s data accurate, respond to user inquiries, manage commerce transactions, and publish educational content without touching the backend code.

### 👥 Target Users

- **Super Admin** – full access to every module and settings.
- **Support Admin** – handles user management, content moderation, and support tickets.
- **Finance Admin** – views orders, products, coupons, and financial analytics.
- **Doctor** – standard admin privileges plus a private “My Reposit” area for managing personal resources.

### ⚙️ Core Responsibilities

- CRUD operations across all primary entities (doctors, patients, products, topics, etc.)
- Role‑based navigation and feature gating.
- Token‑based authentication with automatic refresh.
- Unified API service layer with error handling and retry logic.
- Responsive layout for desktop and mobile staff use.

---

## 🛠️ Tech Stack

| Category            | Technology                               |
|---------------------|------------------------------------------|
| Frontend            | React 19.2, TypeScript 5.9, Vite 7.2     |
| Styling             | Tailwind CSS 4.1, custom clay‑style cards |
| Routing             | React Router DOM 7.11                    |
| State Management    | React Context (Auth) + local component state |
| HTTP/AJAX           | Axios with interceptors + dynamic imports |
| Authentication      | JWT (access + refresh) in localStorage   |
| Rich text           | TipTap (extensions for links, underline) |
| Charts              | Recharts (bar, line, pie charts)        |
| Icons               | Lucide‑React                             |
| Notifications       | react‑hot‑toast                          |
| Phone inputs        | react‑phone-number-input & react‑international-phone |
| Linting & Formatting| ESLint, Prettier via ESLint rules        |

---

## 📁 Project Structure

The codebase follows a **feature‑based, modular architecture**: each major area of functionality lives in its own directory under `src/features`. Shared UI elements and utilities are stored separately so they can be reused across modules.

```
src/
  app/                # Core application (router, entrypoint)
  assets/             # Static images, icons, fonts
  components/         # Shared UI components
    charts/           # Recharts wrappers
    common/           # Modal, ConfirmDialog, StatusBadge, etc.
    layout/           # AdminLayout, Sidebar, Topbar
  context/            # React context providers (AuthContext)
  features/           # Feature modules (see below)
  services/           # API wrappers for each feature
  utils/              # Helper functions (calculateAge, stripHtml, etc.)
  index.css           # global styles (Tailwind imported)
  main.tsx            # React entrypoint
```

Each `features/<module>` directory contains:

- `*.types.ts` for TypeScript interfaces and enums.
- A top‑level `*View.tsx` component for the page.
- A `components/` subfolder with small, module‑specific pieces (tables, modals).
- Local mock data for offline development.

This pattern simplifies onboarding: to add a new domain, drop a folder under `features` and register its route in `app/routes.tsx`.

---

## 📦 Features & Modules

Below is an overview of every major feature shipped with the panel.

### Dashboard
- **Purpose:** provide quick metrics and charts to understand system activity.
- **Pages:** `DashboardView.tsx` (root `/`).
- **Components:** `RevenueOverTimeChart.tsx`, `OrderStatusDistributionChart.tsx`, `TopSellingProductsChart.tsx`.
- **API endpoints:** `/analytics/admin/*` (doctors, patients, orders, products).
- **Permissions:** visible to any authenticated user.
- **Business logic:** data is fetched on mount and graphs are rendered with Recharts; light caching via component state.

### Doctors
- **Purpose:** manage the pool of registered doctors.
- **Pages:** `/doctors` → `DoctorsView.tsx`.
- **Components:** `DoctorTable`, `AddEditDoctorModal`, `DoctorDetailsModal`.
- **API endpoints:** `/auth/admin/users/doctor`, `/auth/register/doctor/`, `/analytics/admin/doctors/metrics/`.
- **Permissions:** admin roles; doctor users cannot access their own management section (they use My Reposit instead).
- **Business logic:** server‑side pagination, sorting, filtering; system password generation; analytics summary card.

### Patients
- **Purpose:** maintain patient accounts and status.
- **Pages:** `/patients`.
- **Components:** `PatientTable`, `PatientDetailsModal`.
- **API endpoints:** `/auth/admin/users/patient`, `/analytics/admin/patients/metrics/`.
- **Permissions:** admin roles.
- **Business logic:** debounced search, status filters, fallback to `mockPatients` when API fails.

### Products
- **Purpose:** product catalog for e‑commerce.
- **Pages:** `/products`.
- **Components:** `ProductTable`, `AddEditProductModal`, `AddEditCouponModal`.
- **API endpoints:** `/commerce/admin/products/`, `/commerce/admin/coupons/`.
- **Permissions:** finance/admin roles.
- **Business logic:** file uploads via `FormData`, inventory thresholds, coupon code activation toggles.

### Orders
- **Purpose:** create and track customer orders.
- **Pages:** `/orders`.
- **Components:** `OrdersTable`, `AddOrderModal` (dynamic import to reduce main bundle size), `OrderDetailsModal`.
- **API endpoints:** `/commerce/admin/orders/`, `/commerce/admin/users/*/addresses/`.
- **Permissions:** finance/admin.
- **Business logic:** complex form state managing user, address, product line items; calculates totals and applies discounts.

### Topics
- **Purpose:** publish educational articles.
- **Pages:** `/topics`.
- **Components:** `TopicTable`, `TopicDetailsModal`, `AddEditTopicModal` (uses TipTap editor).
- **API endpoints:** `/content/admin/topics/` (example path).
- **Permissions:** content editors, admins.
- **Business logic:** rich‑text editing, category assignment, publish/unpublish toggles.

### Events
- **Purpose:** schedule and manage events or webinars.
- **Pages:** `/events`.
- **Components:** `EventTable`, `EventDetailsModal`, `AddEditEventModal` (uploads images using `VITE_BACKEND_BASE_URL`).
- **API endpoints:** `/content/admin/events/`.
- **Permissions:** content/admin.
- **Business logic:** date range pickers, participant links.

### Advertisements
- **Purpose:** manage ad campaigns shown on the platform.
- **Pages:** `/advertisements`.
- **Components:** `AddGeneralAdForm`, `AdvertisementTable`.
- **API endpoints:** `/content/admin/advertisements/`.
- **Permissions:** marketing/admin.

### IDI (Infectious Disease Intelligence)
- **Purpose:** maintain information about diseases for medical teams.
- **Pages:** `/IDI`.
- **Components:** `IDITable`, `IDIDetailsModal`, `AddEditIDIModal`.
- **API endpoints:** `/content/admin/idi/`.
- **Business logic:** contains utilities to transform backend field names (e.g. `core_clinical_role`).

### Advisory
- **Purpose:** publish expert medical advice.
- **Pages:** `/advisory`.
- **Components:** `AdvisoryTable`, `AddAdvisoryModal`.
- **API endpoints:** `/content/admin/advisory/`.

### Settings
- **Purpose:** application-wide configuration.
- **Pages:** `/settings`.
- **Components:** `SettingsView` with individual setting groups.
- **API endpoints:** `/admin/settings/`.

### Profile
- **Purpose:** allow the logged‑in admin to view/edit their own information.
- **Pages:** `/profile`.
- **Components:** `ProfileView` which displays user fields pulled from AuthContext.
- **API endpoints:** `/auth/me/` (not explicitly shown but assumed); updates call `/auth/update/:id/`.

### My Reposit (Doctor‑only)
- **Purpose:** personal resource library for doctors.
- **Pages:** `/my-reposit/books`, `/articles`, `/videos`, `/jobs`.
- **Components:** lists and detail modals for each resource type.
- **Permissions:** only visible when `user.role === 'doctor'` (Sidebar condition) and the server enforces endpoints accordingly.

### Notifications
- **Purpose:** display push and historic alerts.
- **Pages:** modal accessible globally (via `AllNotificationsModal`).
- **API endpoints:** `/notifications/`.

---

## 🔐 Authentication & Authorization

Authentication is handled by the **AuthContext** provider. It stores:

- `accessToken` and `refreshToken` in `localStorage`.
- Serialized `user` object with `role` and `state`.

Tokens are appended to every request by an Axios request interceptor. A response interceptor watches for `401` errors caused by expired access tokens and automatically attempts to refresh using the refresh token. During refresh, concurrent requests are queued; once a new token arrives, the queue is replayed. Failed refreshes clear storage and redirect to `/login`.

### Login Flow
1. User submits email/password on `/login`.
2. POST `/auth/login/email/` returns `{ access, refresh, user }`.
3. `AuthContext.login()` saves data and navigates to `/`.
4. Protected routes (`ProtectedRoutes` component) check `isAuthenticated` and redirect unauthenticated users to `/login`.
5. `useEffect` in `AuthProvider` populates state on app start by reading localStorage.

Role‑based UI is implemented by conditionally rendering components (sidebar groups, My Reposit section); actual authorization enforcement relies on backend ACLs.

---

## 🌐 API Integration

A centralized API service (`src/services/api.ts`) creates an Axios instance configured with:

- **Base URL** from `VITE_API_URL` (defaults to `http://localhost:8000/api/v1`).
- **Request interceptor** attaching the bearer token and setting `Content-Type` based on data type (JSON vs FormData).
- **Response interceptor** handling automatic token refresh, queueing, and redirect on failure.

Each feature module has a corresponding service file exposing typed functions (e.g. `getPatients`, `createDoctor`). These wrappers often transform DTOs and append query parameters.

### Error Handling
- Services propagate Axios errors; calling components catch and display messages using `setError` state or react‑hot‑toast.
- Some services add custom logic (e.g. `createDoctor` throws a warning error when backend returns success=false).
- Components show inline error alerts or fall back to mock data if the API call fails.

### Request/Response Normalization
- DTOs are converted to `FormData` where the backend expects multipart payloads (file uploads, images).
- Helpers such as `generateSystemPassword` provide business values before sending data.

---

## 🧠 State Management

Global state is intentionally minimal:

- **AuthContext** keeps authentication status and user info.
- All other data lives in component state (`useState`/`useReducer`) with `useEffect` for side effects.
- No third‑party state library is used; this keeps the bundle small and logic colocated with UI.

Persistent state:
- Tokens and user object persisted to `localStorage`.
- `useEffect` on app start rehydrates auth state.

Data caching:
- Most fetches are one‑off on mount or when filters change; no caching library is used.
- Some components temporarily memoize search results in local variables to avoid unnecessary requests.

---

## 📝 Forms & Validation

Forms are built using controlled components (`<input>`, `<select>`) managed by `useState`. Validation is manual:

- Fields marked `required`, `minLength`, `maxLength` HTML attributes.
- Custom checks in submit handlers (e.g. password confirmation, email format, quantity > 0).
- Errors are displayed in red alert boxes above the form.

No external form library (React Hook Form, Formik) is used, simplifying dependencies but requiring boilerplate per form.

---

## 🧩 Reusable Components

The `components/common` directory contains UI primitives used across modules:

- `Modal.tsx` – lightweight overlay wrapper.
- `ConfirmDialog.tsx` – yes/no confirmation modal.
- `HelpModal.tsx` – contextual help text popups.
- `StatusBadge.tsx` – colored label for statuses.

Layout components in `components/layout` ensure a consistent sidebar/topbar experience with collapse and mobile support.

Design patterns applied:
- **Presentational/container split** in modals and tables.
- **Render props** rarely; mostly hooks and prop drilling.
- **Dynamic imports** for rarely‑used modules (e.g. order modal) to enable code splitting.

---

## ⚙️ Environment Configuration

Create a `.env` file at the project root with at least:

```env
VITE_API_URL='http://localhost:8000/api/v1'           # base URL for API requests
VITE_BACKEND_BASE_URL='http://localhost:8000'         # used for direct links (events)
VITE_IMAGE_BASE_URL='https://res.cloudinary.com/…'    # CDN for uploaded media
```

Additional variables may be added for staging/production (e.g. analytics keys). Vite automatically exposes variables prefixed with `VITE_` to the client bundle.

---

## 🚀 Installation & Setup

### Prerequisites

- Node.js ≥18
- npm or Yarn
- Git (for cloning/releasing)

### Local Setup

```bash
git clone <repo-url>
cd admin-panel-frontend
npm install
# or yarn install
```

Configure `.env` as shown above.

### Development

```bash
npm run dev       # start Vite dev server on http://localhost:5173
npm run lint      # run ESLint
```

### Production Build

```bash
npm run build     # compiles TS and bundles static assets
npm run preview   # serve the production build locally
```

---

## 📦 Deployment

The output of `npm run build` is a static `dist/` directory suitable for any static host (Netlify, Vercel, Render, S3+CloudFront). The panel assumes the backend API URL is set via environment variable on the hosting platform.

Hosting considerations:

- Serve over HTTPS to protect tokens in transit.
- Configure CORS on the API to allow the panel’s origin.
- CDN the `dist/` folder for global performance; assets already use hashed filenames.

If deploying behind a CDN or domain, ensure the router fallback (`/*`) points to `index.html`.

---

## ⚡ Performance Optimizations

- **Lazy loading**: `AddOrderModal` is imported dynamically to avoid including its large form in the initial bundle.
- **Debounced search**: input filters delay API calls by 300 ms.
- **Tailwind JIT** reduces CSS size to only what’s used.
- **Memoization**: simple `useMemo`/`useCallback` hooks used sparingly where needed.

Further opportunities include adopting React Suspense or a dedicated data fetching library like React Query.

---

## 🔒 Security Considerations

- Tokens are stored in `localStorage` (XSS risk); the app minimises script injection by stripping HTML via `stripHtml` util and avoiding dangerouslySetInnerHTML.
- All API calls include the `Authorization` header; the backend should implement CSRF protections if cookies are used (not in this app).
- Passwords are never handled directly on the client; only validation occurs before sending to the API.
- Sensitive user info is stored briefly in memory and cleared on logout.

---

## 🚧 Future Improvements

- Migrate global state to a library (Redux Toolkit / Zustand) for complex caching.
- Add unit and integration tests (Jest, React Testing Library, Cypress).
- Expand role‑based UI and route guards dynamically based on backend permission data.
- Add internationalization support.
- Implement a service worker for offline usability of analytics dashboards.

---

## 🤝 Contributing

1. Fork the repository.
2. Create a new branch: `git checkout -b feature/foo`.
3. Commit changes with clear messages.
4. Push and open a pull request against `main`.
5. Follow linting rules and run tests before submitting.


## 📄 License

This project is proprietary and confidential. Distribution and modification are restricted.

## 👥 Support

For questions or assistance, reach out to the development team or consult internal documentation.

---

**Built with ❤️ for Clinic Topics**

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **Git** for version control

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd admin-panel-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_BACKEND_BASE_URL='http://localhost:8000'
   VITE_IMAGE_BASE_URL='https://res.cloudinary.com/dhaonimvz/image/upload'
   VITE_API_URL='http://localhost:8000/api/v1'
   ```

   For production, update these values accordingly:
   ```env
   # Production example
   VITE_API_URL='https://clinic-topics-backend.onrender.com/api/v1'
   VITE_BACKEND_BASE_URL='https://clinic-topics-backend.onrender.com'
   ```

## 🏃‍♂️ Running the Application

### Development Mode
```bash
npm run dev
```
The application will start at `http://localhost:5173`

### Build for Production
```bash
npm run build
```
This will create an optimized production build in the `dist` folder.

### Preview Production Build
```bash
npm run preview
```

### Linting
```bash
npm run lint
```

## 📁 Project Structure

```
admin-panel-frontend/
├── public/                 # Static assets
├── src/
│   ├── app/               # Application core
│   │   ├── App.tsx        # Main app component
│   │   └── routes.tsx     # Route definitions
│   ├── assets/            # Images, fonts, etc.
│   ├── components/        # Reusable components
│   │   ├── charts/        # Chart components (Recharts)
│   │   ├── common/        # Common UI components
│   │   └── layout/        # Layout components (Header, Sidebar)
│   ├── context/           # React context providers
│   ├── features/          # Feature modules
│   │   ├── Advertisements/
│   │   ├── Advisory/
│   │   ├── IDI/
│   │   ├── auth/          # Authentication
│   │   ├── dashboard/     # Dashboard analytics
│   │   ├── doctors/       # Doctor management
│   │   ├── events/        # Event management
│   │   ├── notifications/ # Notification system
│   │   ├── orders/        # Order management
│   │   ├── patients/      # Patient management
│   │   ├── products/      # Product management
│   │   ├── profile/       # User profile
│   │   ├── settings/      # Settings
│   │   └── topics/        # Topic management
│   ├── services/          # API services
│   │   ├── api.ts         # Axios instance with interceptors
│   │   ├── advertisement.service.ts
│   │   ├── advisory.service.ts
│   │   ├── coupon.service.ts
│   │   ├── dashboard.service.ts
│   │   ├── doctor.service.ts
│   │   ├── event.service.ts
│   │   ├── idi.service.ts
│   │   ├── notification.service.ts
│   │   ├── order.service.ts
│   │   ├── patient.service.ts
│   │   ├── product.service.ts
│   │   ├── settings.service.ts
│   │   └── topic.service.ts
│   ├── utils/             # Utility functions
│   ├── index.css          # Global styles
│   └── main.tsx           # Application entry point
├── .env                   # Environment variables
├── .gitignore            # Git ignore rules
├── eslint.config.js      # ESLint configuration
├── index.html            # HTML template
├── package.json          # Dependencies and scripts
├── tailwind.config.js    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
├── tsconfig.app.json     # App-specific TypeScript config
├── tsconfig.node.json    # Node-specific TypeScript config
└── vite.config.ts        # Vite configuration
```

## 🔐 Authentication

The application uses JWT (JSON Web Token) authentication with automatic token refresh:

- **Access Token** - Short-lived token for API requests
- **Refresh Token** - Long-lived token for obtaining new access tokens
- **Automatic Refresh** - Interceptors handle token expiration seamlessly
- **Secure Storage** - Tokens stored in localStorage
- **Auto Redirect** - Redirects to login on authentication failure

### Authentication Flow
1. User logs in with credentials
2. Backend returns access and refresh tokens
3. Access token included in all API requests via Authorization header
4. On token expiration (401), interceptor automatically refreshes
5. Failed refresh redirects to login page

## 🌐 API Integration

All API calls are centralized in the `services/` directory. The base API configuration includes:

- **Base URL**: Configured via `VITE_API_URL` environment variable
- **Request Interceptor**: Adds JWT token to all requests
- **Response Interceptor**: Handles token refresh and error responses
- **Content Type**: Automatic handling of JSON and FormData

### Service Architecture
Each feature module has a dedicated service file:
- `advertisement.service.ts` - Advertisement CRUD operations
- `advisory.service.ts` - Advisory content management
- `doctor.service.ts` - Doctor profile operations
- `patient.service.ts` - Patient record management
- `product.service.ts` - Product catalog operations
- `order.service.ts` - Order processing
- `topic.service.ts` - Topic content management
- `event.service.ts` - Event scheduling
- `dashboard.service.ts` - Analytics data
- And more...

## 🎨 UI Components

### Charts (Recharts)
- Line charts for revenue analytics
- Bar charts for order status
- Pie charts for product distribution

### Common Components
- Modal dialogs
- Form inputs
- Buttons
- Tables
- Cards
- Loading spinners
- Toast notifications

### Layout Components
- Header with navigation
- Sidebar menu
- Responsive layout

## 🔧 Configuration

### Vite Configuration
- React plugin enabled
- Tailwind CSS integration
- CORS enabled for development
- Custom port: 5173
- Allowed hosts for ngrok and Render deployment

### TypeScript Configuration
- Strict type checking
- Path aliases supported
- Separate configs for app and Node

### Tailwind Configuration
- Custom theme extensions
- Utility classes
- Responsive design support

## 🚢 Deployment

The application is configured to work with:
- **Local Development**: localhost:5173
- **Ngrok**: For tunneling during development
- **Render**: Production deployment platform

Update the `.env` file with appropriate URLs for your deployment environment.

## 📝 Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow React best practices
- Use functional components with hooks
- Implement proper error handling
- Keep components modular and reusable

### File Naming
- Components: PascalCase (e.g., `DoctorsView.tsx`)
- Services: camelCase with .service.ts suffix
- Utils: camelCase with .ts suffix
- Styles: kebab-case for CSS files

### State Management
- Use React hooks (useState, useEffect, useContext)
- Context API for global state
- Local state for component-specific data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary and confidential.

## 👥 Support

For support and questions, please contact the development team.

---

**Built with ❤️ for Clinic Topics**
