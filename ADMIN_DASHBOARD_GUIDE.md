# Admin Dashboard - Complete Implementation Guide

## Overview
A comprehensive admin dashboard has been created for the Medaghar website with advanced features including traffic analytics, database management, user management, admin user management, and email management capabilities.

## 🔐 Authentication & Security

### Admin Login
- **URL**: `/admin/login`
- **Primary Admin Credentials**:
  - Email: `info@medaghar.com`
  - Password: `(see ADMIN_SEED_PASSWORD in your .env — never commit this)`

### Security Features Implemented
✅ Email domain validation (@medaghar.com only)
✅ Role-Based Access Control (RBAC)
✅ Rate limiting on login attempts (5 attempts per 15 minutes)
✅ Session timeout (8 hours for admin sessions)
✅ CSRF protection
✅ XSS prevention
✅ Content Security Policy (CSP) headers
✅ SEO blocking (noindex, nofollow meta tags)
✅ Robots.txt blocking for admin routes
✅ Audit logging for all admin actions
✅ Secure password hashing with bcrypt

## 📊 Dashboard Features

### 1. Traffic Analytics Tab
**Features**:
- Real-time page view tracking
- Unique visitor counting
- Page-by-page traffic breakdown
- Time-based filters (24h, 7d, 30d, custom range)
- Average session duration metrics
- Geographic traffic distribution (country, city, region)
- Device, browser, and OS analytics
- Interactive charts and visualizations

**API Endpoint**: `/api/admin/analytics`

### 2. Database Management Tab
**Features**:
- View all database tables
- Paginated record viewing (50 records per page)
- Search and filter capabilities
- Edit existing records
- Delete records with confirmation
- Add new records
- Export data to CSV
- Real-time table statistics

**API Endpoints**:
- `/api/admin/database/tables` - List all tables
- `/api/admin/database/data` - CRUD operations

**Supported Tables**:
- User, Property, Agent, Review, Message
- TourRequest, SavedProperty, ViewHistory
- PriceHistory, Lease, RentPayment
- MaintenanceRequest, AdminUser, AdminRole
- AuditLog, PageView, LoginHistory

### 3. User Management Tab
**Features**:
- View all registered users
- Search users by email, name
- View user details (role, phone, join date)
- Login history tracking (IP, device, location, status)
- Suspend/activate user accounts
- Edit user information
- Pagination support

**API Endpoints**:
- `/api/admin/users` - List users
- `/api/admin/users/[userId]/login-history` - View login history

### 4. Admin User Management Tab
**Features**:
- Create new admin users
- Email validation (@medaghar.com domain)
- Password strength requirements (min 8 characters)
- Role assignment (Admin, Admin Assistant, Editor)
- Granular permission management
- Activate/deactivate admin accounts
- Delete admin users
- View last login information

**API Endpoints**:
- `/api/admin/admin-users` - CRUD operations
- `/api/admin/roles` - List available roles

**Available Roles**:
1. **Admin** - Full system access
   - Permissions: traffic_analytics, database_management, user_management, admin_user_management, email_management
   - Actions: read, write, delete, export, import

2. **Admin Assistant** - Limited access
   - Permissions: traffic_analytics (read), user_management (read, write), email_management (read, write)

3. **Editor** - Content management
   - Permissions: database_management (read, write), user_management (read)

### 5. Email Management Tab
**Status**: UI implemented, Hostinger integration pending
**Planned Features**:
- Full inbox view
- Compose and send emails
- HTML email support
- Email attachments
- Folder organization (Inbox, Sent, Drafts, Trash)
- Search and filter emails
- Background email syncing
- Per-admin email access

## 🗄️ Database Schema

### New Models Added

#### AdminUser
- id, email, password, firstName, lastName
- roleId (foreign key to AdminRole)
- isActive, lastLoginAt, lastLoginIp, lastLoginDevice
- createdAt, updatedAt, createdBy

#### AdminRole
- id, name, description
- permissions (relation to AdminPermission)
- users (relation to AdminUser)

#### AdminPermission
- id, roleId, resource, actions (JSON array)
- Unique constraint on (roleId, resource)

#### AuditLog
- id, adminUserId, action, resource, resourceId
- details (JSON), ipAddress, userAgent, status
- createdAt

#### PageView
- id, page, userId, sessionId
- ipAddress, country, city, region, latitude, longitude
- userAgent, device, browser, os, referrer, duration
- createdAt

#### LoginHistory
- id, userId, email, ipAddress
- device, browser, os, location
- status, failureReason, createdAt

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
npm install @tanstack/react-table @tanstack/react-query react-hot-toast next-themes clsx tailwind-merge ua-parser-js bcrypt rate-limiter-flexible
npm install --save-dev @types/ua-parser-js
```

### 2. Run Database Migration
```bash
npx prisma migrate dev --name add_admin_system
npx prisma generate
```

### 3. Seed Admin Data
```bash
npx tsx prisma/seed-admin.ts
```

This will create:
- Admin roles (Admin, Admin Assistant, Editor)
- Permissions for each role
- Primary admin user (info@medaghar.com)

### 4. Environment Variables
Ensure `.env` file contains:
```
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

### 5. Start Development Server
```bash
npm run dev
```

### 6. Access Admin Dashboard
Navigate to: `http://localhost:3000/admin/login`

## 📁 File Structure

```
app/
├── admin/
│   ├── login/
│   │   ├── page.tsx (Login page)
│   │   └── layout.tsx (SEO blocking)
│   └── dashboard/
│       ├── page.tsx (Main dashboard)
│       └── layout.tsx (SEO blocking)
├── api/
│   └── admin/
│       ├── auth/[...nextauth]/route.ts
│       ├── analytics/route.ts
│       ├── database/
│       │   ├── tables/route.ts
│       │   └── data/route.ts
│       ├── users/
│       │   ├── route.ts
│       │   └── [userId]/login-history/route.ts
│       ├── admin-users/route.ts
│       └── roles/route.ts

components/
└── admin/
    ├── TrafficAnalyticsTab.tsx
    ├── DatabaseManagementTab.tsx
    ├── UserManagementTab.tsx
    ├── AdminUserManagementTab.tsx
    └── EmailManagementTab.tsx

lib/
├── admin-auth.ts (Admin authentication)
├── analytics.ts (Analytics tracking)
├── audit-log.ts (Audit logging)
└── rate-limiter.ts (Rate limiting)

prisma/
├── schema.prisma (Updated with admin models)
└── seed-admin.ts (Admin data seeding)

middleware.ts (Route protection)
public/robots.txt (SEO blocking)
```

## 🔒 Security Best Practices

1. **Always use HTTPS in production**
2. **Regularly rotate admin passwords**
3. **Review audit logs frequently**
4. **Limit admin user creation to super admins**
5. **Monitor failed login attempts**
6. **Keep dependencies updated**
7. **Use strong passwords (min 12 characters recommended)**
8. **Enable 2FA (future enhancement)**

## 📝 Audit Logging

All admin actions are logged including:
- Login/logout attempts
- User management actions
- Database modifications
- Admin user changes
- Email sending

View logs in the AuditLog table via Database Management tab.

## 🎯 Next Steps

1. **Implement Hostinger Email Integration**
   - Set up IMAP/SMTP connection
   - Implement email fetching and sending
   - Add attachment support

2. **Add Export/Import Functionality**
   - CSV export for all tables
   - CSV import with validation
   - Bulk operations

3. **Enhanced Analytics**
   - Real-time dashboard updates
   - Custom report generation
   - Email analytics reports

4. **Two-Factor Authentication**
   - TOTP-based 2FA
   - Backup codes
   - SMS verification (optional)

5. **Advanced Permissions**
   - Field-level permissions
   - Time-based access
   - IP whitelisting

## 🐛 Troubleshooting

### Issue: Cannot login to admin dashboard
- Verify email ends with @medaghar.com
- Check if admin user exists in database
- Review rate limiting (wait 15 minutes if locked out)

### Issue: Database migration fails
- Delete `prisma/dev.db` and run `npx prisma migrate reset --force`
- Run seed script again

### Issue: Analytics not showing data
- Ensure PageView tracking is implemented on frontend
- Check if analytics API is accessible
- Verify date filters are correct

## 📞 Support

For issues or questions, contact the development team or review the audit logs for detailed error information.

