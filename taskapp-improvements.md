# TaskApp Engineering Improvements

## Overview
This document lists improvements needed for the TaskApp from an engineering perspective. The app is a basic task management application with user authentication, task CRUD operations, and email verification, but lacks several critical features for production use.

---

## 1. Authentication & Session Management

### Current State
- User login/register with localStorage storage of user ID
- No JWT tokens implemented
- Session management relies solely on localStorage

### Improvements Needed
- **Implement JWT-based authentication** with access and refresh tokens
- **Add token expiration and refresh mechanism**
- **Add "remember me" functionality**
- **Implement proper session invalidation on logout**
- **Add authentication middleware** for protected routes
- **Store user context in Redux/Context API** instead of localStorage

### Current Code Issues
```javascript
// Frontend - Login stores user in localStorage
localStorage.setItem('userId', JSON.stringify(data.user));
// No token management, no session expiry
```

---

## 2. API Design & RESTful Conventions

### Current State
- Mixed HTTP methods (`POST /tasks/fetch` to get tasks, `PUT` for create)
- No pagination or filtering
- Basic CRUD only

### Improvements Needed
- **Use proper REST endpoints**: `GET /tasks`, `POST /tasks`, `PUT /tasks/:id`, `DELETE /tasks/:id`
- **Replace `POST /tasks/fetch` with `GET /tasks`**
- **Add query parameters** for pagination (`?page=1&limit=10`), sorting, and filtering
- **Implement task search** by title/description
- **Add task filtering** by status (completed/pending), priority, due date

### Current Code Issues
```javascript
// Backend - Uses POST for fetching tasks
router.post("/fetch", async (req, res) => { ... });
// Uses PUT for creating tasks  
router.post("/", async (req, res) => { ... });
```

---

## 3. Security Enhancements

### Current State
- Argon2 password hashing (good!)
- Helmet middleware for security headers
- CORS configured but with hardcoded origins
- No rate limiting
- No CSRF protection

### Improvements Needed
- **Add rate limiting** to prevent brute force attacks
- **Implement CSRF protection** for state-changing operations
- **Sanitize all user inputs** properly
- **Add Content Security Policy** headers
- **Hide error details** from clients (show generic messages only)
- **Add input validation** using schemas (Joi/Zod)
- **Implement proper CORS** with environment-based origins

### Current Code Issues
```javascript
// Backend - CORS with hardcoded origins
app.use(cors({
    origin: ['https://taskapp-khaki.vercel.app', allowedOrigin]
}));
```

---

## 4. Database & Data Modeling

### Current State
- Basic Task schema: title, description, completed, userId
- User schema with name, email, password, tasks array, isVerified
- No due dates, priorities, or categories

### Improvements Needed
- **Add `createdAt` and `updatedAt` timestamps** to Task model
- **Add due dates** to tasks
- **Add priority levels** (low, medium, high, urgent)
- **Add task categories/labels** (work, personal, urgent, etc.)
- **Add task status** beyond just completed/pending
- **Add user metadata**: lastLogin, online status
- **Add indexes** for frequently queried fields

### Current Code Issues
```javascript
// Task model - Missing timestamps and metadata
const TaskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    completed: { type: Boolean, default: false },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});
```

---

## 5. Email Verification System

### Current State
- OTP generation and verification implemented
- Email sending via nodemailer with SMTP config
- Resend verification endpoint exists

### Improvements Needed
- **Add email verification status check** in frontend
- **Add "Send verification email" button** for unverified users
- **Implement email change flow** with re-verification
- **Add email validation** on registration
- **Add verification expiry handling** with auto-expire
- **Add preview mode** for development without SMTP

### Current Code Issues
```javascript
// Frontend - No verification status check
useEffect(() => {
    if(localStorage.getItem('userId')) {
        // No check for isVerified status
    }
});
```

---

## 6. Frontend Enhancements

### Current State
- React app with basic pages (Login, Register, Home)
- Task form and list components
- Uses localStorage for auth state
- window.location.reload() everywhere

### Improvements Needed
- **Replace window.location.reload()** with state management
- **Add proper routing protection** with 404 fallback
- **Add responsive design** for mobile devices
- **Add dark mode support**
- **Implement form validation** with error messages
- **Add loading states** for individual tasks
- **Add error boundaries** for graceful error handling
- **Use TypeScript** instead of JavaScript
- **Add unit tests** for components

### Current Code Issues
```javascript
// Frontend - Reloads page after every operation
window.location.reload(); // Used in 5+ places
// No state management, causes full page refresh
```

---

## 7. Task Features

### Current State
- Basic CRUD operations
- Toggle complete/incomplete
- Edit title and description
- Delete tasks

### Improvements Needed
- **Add due dates** with overdue indication
- **Add task priority** levels
- **Add task categories/tags**
- **Add search/filter** functionality
- **Add bulk operations** (select multiple tasks)
- **Add subtasks** within tasks
- **Add task comments/activity log**
- **Add drag-and-drop** reordering

### Current Code Issues
```javascript
// TaskItem - Only tracks completed status
const [editMode, setEditMode] = useState(false);
// No due date, priority, or category fields
```

---

## 8. User Experience

### Current State
- Simple toast notifications
- Basic button interactions
- Simple form layouts

### Improvements Needed
- **Add global error handling** interceptor
- **Implement skeleton loaders** instead of "Loading..." text
- **Add empty states** with helpful messages
- **Add confirmation dialogs** for destructive actions
- **Add undo/redo** for task operations
- **Add tooltips** and micro-interactions
- **Add print-friendly** task views
- **Add keyboard shortcuts** power user features

### Current Code Issues
```javascript
// Frontend - Basic toast notifications
toast.error(`Error: ${error.message}`);
// No skeleton loaders, just text "Loading tasks..."
```

---

## 9. Testing & Quality Assurance

### Current State
- No visible test files
- Manual testing only

### Improvements Needed
- **Add unit tests** for backend controllers and routes
- **Add integration tests** for API endpoints
- **Add frontend component tests** with React Testing Library
- **Add E2E tests** with Cypress or Playwright
- **Set up CI/CD pipeline** with test runs
- **Add code coverage reports**
- **Implement linting** and format checking
- **Add TypeScript type checking**

### Current Code Issues
```javascript
// No test scripts configured beyond basic react-scripts test
// No test infrastructure for custom backend logic
```

---

## 10. Deployment & DevOps

### Current State
- Frontend on Vercel (implied)
- Backend likely on any Node.js hosting
- Environment variables in .env

### Improvements Needed
- **Add Docker configuration** for both frontend and backend
- **Set up CI/CD pipeline** (GitHub Actions, GitLab CI)
- **Add health check endpoint** for backend
- **Configure domain** with SSL/TLS
- **Add monitoring** and error tracking (Sentry, etc.)
- **Set up log aggregation**
- **Add environment validation** at startup
- **Configure backup** strategy for MongoDB

### Current Code Issues
```javascript
// Backend - No health check endpoint
app.get('/', (req, res) => {
    res.send('Welcome to Task Management App');
});
// No /health endpoint for deployment monitoring
```

---

## 11. Code Organization & Maintainability

### Current State
- Flat file structure
- Mixed concerns
- Hardcoded URLs

### Improvements Needed
- **Reorganize folder structure** by feature/domain
- **Extract API constants** to separate config file
- **Add proper error classes** for consistent error handling
- **Implement middleware** for common patterns
- **Add configuration environment** separation (dev/prod)
- **Add documentation** for API endpoints
- **Extract utils** to separate modules
- **Add index files** for cleaner imports

### Current Code Issues
```javascript
// Frontend - Hardcoded API host
export const host = 'https://taskapp-backend.vercel.app';
// Different URLs for local dev vs production
```

---

## 12. Accessibility (a11y)

### Current State
- Basic HTML structure
- Some color contrast in CSS

### Improvements Needed
- **Add proper ARIA labels** for form inputs
- **Ensure keyboard navigation** works fully
- **Add focus styles** for interactive elements
- **Ensure screen reader compatibility**
- **Meet WCAG 2.1 AA** contrast ratios
- **Add skip links** for navigation
- **Test with** axe or similar tools

### Current Code Issues
```html
<!-- No ARIA labels on form inputs -->
<input type="text" placeholder="Title" .../>
// No visible focus indicators in some states
```

---

## Summary

The TaskApp has a solid foundation with basic authentication, task management, and email verification. However, for production use, the following priorities are recommended:

### High Priority
1. Implement proper JWT authentication with refresh tokens
2. Fix API design to follow RESTful conventions
3. Add rate limiting and security headers
4. Improve frontend state management (remove window.location.reload())

### Medium Priority
5. Add due dates, priorities, and categories to tasks
6. Complete email verification flow in frontend
7. Add proper error handling and loading states
8. Implement responsive design and accessibility

### Low Priority
9. Add advanced features (subtasks, comments, drag-and-drop)
10. Implement testing suite and CI/CD
11. Add dark mode and additional UX improvements
12. Full DevOps pipeline and monitoring

---
*Generated from engineering code review of the TaskApp repository*

---

## 2025-10-27 — Task 4: Database & Data Modeling

- Branch: `feature/db-data-modeling`
- Goal: Add timestamps, due dates, priorities, categories, status fields, user metadata, and indexes.
- Changes made:
  - Updated `backend/models/Task.js`: replaced `completed` with `status` enum; added `priority`, `dueDate`, `tags`; added `{ timestamps: true }`; added compound indexes on `userId/status/dueDate` and `tags`.
  - Updated `backend/models/User.js`: added `updatedAt`, `lastLogin`, `onlineStatus`; added indexes on `email` and `isVerified`.
- Status: Complete — model updates committed.
