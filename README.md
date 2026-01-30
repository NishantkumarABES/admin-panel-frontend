# Clinic Topics Admin Panel

A comprehensive admin panel for managing clinic topics, built with React, TypeScript, and Vite. This application provides administrators with powerful tools to manage doctors, patients, products, orders, events, topics, advertisements, and more.

## 🚀 Features

### Core Modules

- **📊 Dashboard** - Analytics and insights with interactive charts
  - Top selling products visualization
  - Revenue analytics
  - Order status analytics
  
- **👨‍⚕️ Doctors Management** - Complete CRUD operations for doctor profiles
  - Doctor registration and profile management
  - Specialization tracking
  - Availability management

- **👥 Patients Management** - Patient records and information
  - Patient registration
  - Medical history tracking
  - Appointment management

- **🛍️ Products Management** - E-commerce product catalog
  - Product creation and editing
  - Inventory management
  - Category management
  - Coupon management

- **📦 Orders Management** - Order processing and tracking
  - Order status tracking
  - Order details with tax and discount calculations
  - Payment management

- **📚 Topics Management** - Medical topics and content
  - Rich text editor (TipTap) for content creation
  - Topic categorization
  - Publishing workflow

- **📅 Events Management** - Event scheduling and management
  - Event creation and editing
  - Event calendar
  - Participant tracking

- **📢 Advertisements** - Advertisement campaign management
  - Ad creation and scheduling
  - Campaign tracking
  - Performance analytics

- **🔬 IDI (Infectious Disease Intelligence)** - Specialized disease tracking
  - Disease information management
  - Outbreak tracking
  - Data analytics

- **💡 Advisory** - Medical advisory content management
  - Advisory creation and publishing
  - Content categorization
  - Expert recommendations

- **⚙️ Settings** - System configuration
  - Application settings
  - User preferences
  - System parameters

- **👤 Profile** - User profile management
  - Admin profile editing
  - Password management
  - Preferences

- **🔔 Notifications** - Real-time notification system
  - Push notifications
  - Notification history
  - Alert management

## 🛠️ Tech Stack

### Frontend Framework
- **React 19.2.0** - UI library
- **TypeScript 5.9.3** - Type safety
- **Vite 7.2.4** - Build tool and dev server

### Styling
- **Tailwind CSS 4.1.18** - Utility-first CSS framework
- **Lucide React 0.562.0** - Icon library

### Routing & State
- **React Router DOM 7.11.0** - Client-side routing

### Rich Text Editor
- **TipTap 3.14.0** - WYSIWYG editor
  - Link extension
  - Text align extension
  - Underline extension
  - Starter kit

### Data Visualization
- **Recharts 3.6.0** - Chart library for analytics

### HTTP Client
- **Axios 1.13.2** - API communication with interceptors

### UI Components
- **React Hot Toast 2.6.0** - Toast notifications
- **React Phone Number Input 3.4.14** - Phone number formatting

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

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
