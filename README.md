# Bonhoeffer Machines CRM Frontend

A modern, responsive web application built with Next.js and React for the Bonhoeffer Machines CRM system. Features a **dark theme-only interface** designed for optimal user experience and reduced eye strain.

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- npm, yarn, pnpm, or bun package manager
- Backend API running on http://localhost:8000

### Installation

1. **Install dependencies:**
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

2. **Configure environment variables:**
```bash
# Create .env.local file
NEXT_PUBLIC_API_URL=http://localhost:8000
```

3. **Start the development server:**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

4. **Open your browser:**
Navigate to [http://localhost:3001](http://localhost:3001) to see the application.

## 🎨 Design System

### Dark Theme Only
This application exclusively uses a dark theme designed to:
- Reduce eye strain during extended usage
- Provide better focus for data-intensive operations
- Create a professional, modern appearance
- Optimize for various lighting conditions

### Color Palette
- **Primary Background**: `bg-gray-900` (#111827)
- **Secondary Background**: `bg-gray-800` (#1F2937)
- **Card Background**: `bg-gray-800` (#1F2937)
- **Text Primary**: `text-white` (#FFFFFF)
- **Text Secondary**: `text-gray-300` (#D1D5DB)
- **Accent Blue**: `text-blue-400` (#60A5FA)
- **Success Green**: `text-green-400` (#34D399)
- **Warning Yellow**: `text-yellow-400` (#FBBF24)
- **Danger Red**: `text-red-400` (#F87171)

## 📱 Features & Pages

### Authentication
- **Login Page** (`/login`): Secure JWT-based authentication
- **Protected Routes**: Automatic redirect for unauthenticated users
- **Role-based Access**: Different interfaces based on user roles

### Dashboard (`/dashboard`)
- Overview statistics and KPIs
- Recent activity feed
- Quick action buttons
- Role-specific widgets

### Lead Management (`/leads`)
- Lead creation and editing
- Status tracking through sales pipeline
- Search and filtering capabilities
- Bulk operations support

### Assignment Management (`/assignments`)
- Lead-to-salesperson assignment interface
- Progress tracking and status updates
- Assignment history and notes
- Performance metrics

### Reports & Analytics (`/reports`)
- Comprehensive business intelligence
- Lead conversion analytics
- Salesperson performance reports
- Geographic distribution analysis
- PDF export functionality

### Salesperson Interface (`/salesperson`)
- Personal assignment dashboard
- Lead details and contact information
- Status update capabilities
- Location check-in/check-out

### Team Management (`/salespersons`)
- View all sales team members
- Location tracking and status
- Performance overview
- Contact information

### Interactive Map (`/map`)
- Real-time salesperson locations
- Lead geographic distribution
- Proximity-based insights
- Interactive location pins

### HR Onboarding (`/hr/onboarding`)
- New user registration workflow
- Role assignment interface
- Employee management tools
- Approval processes

### Admin Panel (`/admin/users`)
- User management and role assignment
- System configuration
- Access control administration
- Audit logs and monitoring

## 🏗️ Technical Architecture

### Framework & Libraries
- **Next.js 15.3.3**: React framework with App Router
- **React 19**: Latest React with concurrent features
- **Tailwind CSS**: Utility-first CSS framework
- **Heroicons**: High-quality SVG icons
- **Lucide React**: Additional icon library
- **Leaflet**: Interactive map functionality
- **jsPDF**: PDF generation and export
- **Axios**: HTTP client for API communication
- **js-cookie**: Client-side cookie management

### State Management
- **React Context API**: Global state management
- **AuthContext**: User authentication state
- **ThemeContext**: Fixed dark theme configuration
- **Local Component State**: Component-specific state

### API Integration
- **RESTful API**: Communication with FastAPI backend
- **JWT Authentication**: Token-based security
- **Axios Interceptors**: Request/response handling
- **Error Handling**: Centralized error management

## 📁 Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── globals.css        # Global styles and dark theme
│   ├── layout.js          # Root layout component
│   ├── page.js            # Home/landing page
│   ├── login/             # Authentication page
│   ├── dashboard/         # Main dashboard
│   ├── leads/             # Lead management
│   ├── assignments/       # Assignment interface
│   ├── reports/           # Analytics and reports
│   ├── salesperson/       # Salesperson dashboard
│   ├── salespersons/      # Team overview
│   ├── map/               # Interactive map
│   ├── hr/                # HR workflows
│   └── admin/             # Admin panel
├── components/            # Reusable React components
│   ├── Navbar.js         # Navigation header
│   ├── ProtectedRoute.js # Route protection
│   ├── LoadingSpinner.js # Loading indicator
│   └── Toast.js          # Notification system
├── contexts/             # React context providers
│   ├── AuthContext.js   # Authentication state
│   └── ThemeContext.js  # Dark theme config
├── lib/                 # Utility functions
│   └── api.js          # API client configuration
├── public/             # Static assets
└── package.json        # Dependencies and scripts
```

## 🔧 Configuration

### Environment Variables
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000  # Backend API URL
```

### Tailwind Configuration
Custom dark theme configuration in `tailwind.config.js`:
- Extended color palette
- Custom component classes
- Responsive breakpoints
- Animation utilities

### Next.js Configuration
- App Router configuration
- Turbo mode enabled for faster development
- API route handling
- Image optimization

## 🎯 Component Architecture

### Reusable Components

#### Navbar.js
- Fixed dark theme navigation
- Role-based menu items
- User profile dropdown
- Logout functionality

#### ProtectedRoute.js
- Authentication verification
- Role-based access control
- Automatic redirects
- Loading states

#### LoadingSpinner.js
- Consistent loading indicator
- Dark theme styling
- Flexible sizing options

#### Toast.js
- Notification system
- Success/error messages
- Auto-dismiss functionality
- Dark theme design

### Context Providers

#### AuthContext.js
- User authentication state
- Login/logout functions
- Token management
- User profile data

#### ThemeContext.js
- Fixed dark theme provider
- Consistent theme values
- No toggle functionality (dark only)

## 🚦 Routing & Navigation

### Public Routes
- `/login` - Authentication page

### Protected Routes
All other routes require authentication:
- `/dashboard` - Main dashboard
- `/leads` - Lead management
- `/assignments` - Assignment interface
- `/reports` - Analytics and reports
- `/salesperson` - Salesperson dashboard
- `/salespersons` - Team overview
- `/map` - Interactive map
- `/hr/onboarding` - HR workflows
- `/admin/users` - Admin panel

### Role-based Access
Different user roles see different navigation items and have access to different features:

- **Admin**: Full access to all pages
- **Executive**: Dashboard, reports, and overview pages
- **CRM**: Lead and assignment management
- **HR**: User management and onboarding
- **Salesperson**: Personal dashboard and assignments

## 🎨 Styling Guidelines

### CSS Classes
All components use consistent dark theme classes:
```css
/* Background Colors */
.bg-gray-900    /* Primary background */
.bg-gray-800    /* Secondary background */
.bg-gray-700    /* Elevated surfaces */

/* Text Colors */
.text-white     /* Primary text */
.text-gray-300  /* Secondary text */
.text-gray-400  /* Muted text */

/* Interactive Elements */
.bg-blue-600    /* Primary buttons */
.bg-green-600   /* Success actions */
.bg-red-600     /* Danger actions */
.bg-yellow-600  /* Warning actions */
```

### Component Patterns
- Consistent padding and margins
- Rounded corners (`rounded-lg`)
- Shadow effects for depth
- Hover states for interactivity
- Focus states for accessibility

## 📊 Data Flow

### API Communication
1. **Authentication**: Login → JWT token → Stored in cookies
2. **Data Fetching**: Components → API client → Backend → Response
3. **State Updates**: API response → Context → Component re-render
4. **Error Handling**: API errors → Toast notifications → User feedback

### State Management
- Global auth state in AuthContext
- Page-level state in components
- Form state with controlled inputs
- Loading states for async operations

## 🧪 Development

### Development Scripts
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint
```

### Code Quality
- ESLint configuration for code quality
- Prettier for code formatting
- TypeScript support (JSDoc comments)
- Component prop validation

### Development Tools
- Hot reload for rapid development
- Turbo mode for faster builds
- Browser dev tools integration
- React Developer Tools compatibility

## 📱 Responsive Design

### Breakpoints
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

### Mobile-First Approach
- Base styles for mobile devices
- Progressive enhancement for larger screens
- Touch-friendly interface elements
- Optimized navigation for mobile

## 🔒 Security Features

### Client-Side Security
- JWT token storage in secure cookies
- Automatic token expiration handling
- Protected route components
- Input validation and sanitization

### Authentication Flow
1. User submits credentials
2. Backend validates and returns JWT
3. Token stored in secure cookie
4. Token included in API requests
5. Automatic logout on token expiry

## 📈 Performance Optimization

### Next.js Features
- Automatic code splitting
- Image optimization
- Static generation where possible
- Client-side routing

### Loading Strategies
- Lazy loading for heavy components
- Skeleton screens during data fetching
- Progressive loading for large datasets
- Optimistic UI updates

## 🚀 Deployment

### Build Process
```bash
# Create production build
npm run build

# Start production server
npm run start
```

### Environment Setup
- Configure production API URL
- Set up environment variables
- Configure domain and SSL
- Set up monitoring and analytics

### Hosting Options
- Vercel (recommended for Next.js)
- Netlify
- AWS Amplify
- Traditional hosting with Node.js

## 🆘 Troubleshooting

### Common Issues

#### Authentication Problems
- Check API URL configuration
- Verify backend is running
- Clear browser cookies/localStorage
- Check network connectivity

#### Styling Issues
- Verify Tailwind CSS compilation
- Check for conflicting CSS classes
- Refresh browser cache
- Validate component structure

#### API Connection
- Confirm backend server is running on port 8000
- Check CORS configuration
- Verify API endpoint URLs
- Review network tab in browser dev tools

### Development Tips
- Use React Developer Tools for debugging
- Monitor network requests in browser
- Check console for JavaScript errors
- Verify component prop types

## 📞 Support

For frontend-specific issues:
1. Check browser console for errors
2. Verify API connectivity with backend
3. Review component documentation
4. Test with different browsers

---

**Note**: This application is designed exclusively with a dark theme to provide the best user experience for extended CRM usage.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
