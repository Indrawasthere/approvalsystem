# ProveIT - Multi-Layer Approval System

[![Next.js](https://img.shields.io/badge/Next.js-15.5.6-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.17.1-green)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-cyan)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)](https://www.postgresql.org/)

A modern, comprehensive approval workflow management system built with Next.js, designed to streamline document approval processes with multi-layer review capabilities, real-time notifications, and advanced analytics.

## ✨ Features

### 🔐 Authentication & Authorization
- **NextAuth Integration**: Secure authentication with multiple providers
- **Role-Based Access Control**: Admin, Requester, and multi-level Approvers
- **Session Management**: Protected routes and user sessions

### 📋 Multi-Layer Approval Workflow
- **Flexible Approval Layers**: Up to 3-tier approval process
- **Document Types**: Support for ICC, Quotations, and Proposals
- **Status Tracking**: Real-time status updates (Draft, Pending, Approved, Rejected, Completed)
- **Revision Management**: Track document revisions and feedback

### 📁 Document Management
- **Google Drive Integration**: Secure file storage and management
- **File Upload**: Support for PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (Max 10MB)
- **Document Versioning**: Maintain revision history
- **File Metadata**: Track file size, MIME type, and upload timestamps

### 👥 User Management
- **Admin Dashboard**: Complete user management system
- **Department Organization**: Group users by departments
- **User Roles**: Granular permission system
- **Profile Management**: User avatars and contact information

### 📊 Analytics & Reporting
- **Dashboard Analytics**: Comprehensive approval metrics
- **Monthly Trends**: Visual representation of approval activities
- **Department Statistics**: Performance insights by department
- **Approval Time Tracking**: Average processing times

### 🔔 Notifications
- **Real-time Notifications**: Instant updates on approval status
- **Email Integration**: Automated email notifications
- **Notification Center**: In-app notification management
- **Mark as Read**: Bulk notification management

### 🎨 Modern UI/UX
- **Dark Theme**: Sleek dark interface with gradient accents
- **Responsive Design**: Mobile-first approach
- **Radix UI Components**: Accessible and customizable components
- **Tailwind CSS**: Utility-first styling
- **Lucide Icons**: Consistent iconography

## 🏗️ Project Structure

```
proveit/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── seed.ts               # Database seeding
│   └── migrations/           # Database migrations
├── src/
│   ├── app/
│   │   ├── api/              # API routes
│   │   │   ├── approvals/    # Approval CRUD operations
│   │   │   ├── auth/         # Authentication endpoints
│   │   │   ├── notifications/# Notification management
│   │   │   └── upload/       # File upload handling
│   │   ├── dashboard/        # Dashboard pages
│   │   │   ├── admin/        # Admin-only pages
│   │   │   ├── analytics/    # Analytics dashboard
│   │   │   └── approvals/    # Approval management
│   │   └── (auth)/           # Authentication pages
│   ├── components/
│   │   ├── ui/               # Reusable UI components
│   │   ├── dashboard/        # Dashboard-specific components
│   │   ├── forms/            # Form components
│   │   └── approvals/        # Approval workflow components
│   ├── lib/
│   │   ├── auth.ts           # Authentication configuration
│   │   ├── db.ts             # Database connection
│   │   ├── utils.ts          # Utility functions
│   │   └── validators.ts     # Input validation
│   └── services/             # External service integrations
│       ├── email.ts          # Email service
│       ├── google-drive.ts   # Google Drive integration
│       └── notifications.ts  # Notification service
├── public/                   # Static assets
└── package.json              # Dependencies and scripts
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** 15+
- **Google Cloud Platform** account (for Drive integration)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/proveit.git
   cd proveit
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```

   Configure your environment variables:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/proveit"

   # NextAuth
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"

   # Google Drive API
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   GOOGLE_REFRESH_TOKEN="your-refresh-token"

   # Email (optional)
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT="587"
   SMTP_USER="your-email@gmail.com"
   SMTP_PASS="your-app-password"
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npx prisma generate

   # Run migrations
   npx prisma migrate dev

   # Seed the database
   npx prisma db seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth handlers

### Approval Endpoints
- `GET /api/approvals` - List approvals (filtered by user role)
- `POST /api/approvals` - Create new approval
- `GET /api/approvals/[id]` - Get approval details
- `PUT /api/approvals/[id]/decide` - Approve/reject approval
- `PUT /api/approvals/[id]/resubmit` - Resubmit for revision

### Notification Endpoints
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications/mark-all-read` - Mark all notifications as read

### File Upload
- `POST /api/upload` - Upload files to Google Drive

## 🎯 User Roles & Permissions

| Role | Permissions |
|------|-------------|
| **Admin** | Full system access, user management, analytics |
| **Requester** | Create approvals, view own approvals, receive notifications |
| **First Approver** | Review first-layer approvals, provide feedback |
| **Second Approver** | Review second-layer approvals, provide feedback |
| **Third Approver** | Final approval layer, provide feedback |

## 📊 Database Schema

### Core Models
- **User**: Authentication and profile data
- **Approval**: Main approval requests with multi-layer workflow
- **Notification**: In-app and email notifications
- **AuditLog**: System activity tracking

### Key Relationships
- Users can be Requesters or Approvers at different layers
- Approvals track status across multiple review layers
- Notifications link to specific approvals and users

## 🔧 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS 4** - Utility-first CSS framework
- **Radix UI** - Accessible component library
- **Lucide React** - Icon library

### Backend
- **Next.js API Routes** - Server-side API endpoints
- **Prisma ORM** - Database toolkit
- **PostgreSQL** - Primary database
- **NextAuth.js** - Authentication library

### External Services
- **Google Drive API** - File storage and management
- **Nodemailer** - Email notifications
- **Sonner** - Toast notifications

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Type checking

## 🎬 Demo

### Screenshots
<!-- Add your screenshots here -->
![Dashboard Screenshot](https://via.placeholder.com/800x400/1a1a1a/ffffff?text=Dashboard+Screenshot)
![Approval Form](https://via.placeholder.com/800x400/1a1a1a/ffffff?text=Approval+Form)
![Analytics Dashboard](https://via.placeholder.com/800x400/1a1a1a/ffffff?text=Analytics+Dashboard)

### Demo Video
<!-- Add your demo video here -->
[![ProveIT Demo](https://via.placeholder.com/800x400/1a1a1a/ffffff?text=Demo+Video)](https://www.youtube.com/watch?v=demo-video-id)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Prisma](https://www.prisma.io/) - Database toolkit
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Radix UI](https://www.radix-ui.com/) - Component library
- [Google Drive API](https://developers.google.com/drive/api) - File storage

## 📞 Support

For support, email support@proveit.com or join our Discord community.

---

**Made by thousand tears, by Indrawasthere**
