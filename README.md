# TClass Frontend (Next.js)

Frontend for the TClass School Management System - a modern training center portal with public landing pages and authenticated routes for students, faculty, and administrators.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📋 Requirements

- **Node.js**: 18+ (LTS recommended)
- **npm**: 9+ or **pnpm**: 8+
- **Backend API**: Laravel backend running on `http://127.0.0.1:8000`

See [LOCAL_SETUP.md](./LOCAL_SETUP.md) for full installation guide.

## 🌐 Available Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page (public) |
| `/login` | Authentication portal |
| `/student` | Student dashboard |
| `/student/enrollment` | Enrollment management |
| `/faculty` | Faculty dashboard |
| `/admin` | Admin dashboard |
| `/programs` | Training programs listing |
| `/vocational` | Vocational enrollment form |
| `/admission` | Admission application form |

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **State**: React hooks
- **HTTP**: Native fetch with custom apiFetch wrapper

## 📁 Project Structure

```
app/
├── (faculty-admin)/      # Shared layout for faculty & admin
│   ├── admin/            # Admin portal pages
│   ├── faculty/          # Faculty portal pages
│   └── layout.tsx        # Shared portal layout
├── admission/            # Admission form page
├── login/                # Login page
├── programs/             # Programs listing page
├── vocational/           # Vocational enrollment form
├── globals.css           # Global styles + Tailwind
├── layout.tsx            # Root layout
└── page.tsx              # Landing page

components/
├── ui/                   # shadcn/ui components
│   ├── avatar-actions-menu.tsx
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── dropdown-menu.tsx
│   ├── input.tsx
│   ├── logout-modal.tsx
│   ├── theme-icon-button.tsx
│   └── ...
├── student/              # Student-specific components
└── ...

lib/
├── api-client.ts         # API fetch wrapper
├── auth.ts               # Auth utilities
├── contact-submit.ts     # Contact form handler
└── utils.ts              # Utility functions

public/                   # Static assets
├── tclass-logo.jpg
├── tclass.jpg
└── ...
```

## ⚙️ Environment Variables

Create `.env.local` in project root:

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api
```

## 📝 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## 🎨 Features

### UI/UX
- ✅ Light/Dark mode with persistence
- ✅ Responsive design (mobile-first)
- ✅ Smooth scroll animations
- ✅ Loading states & transitions
- ✅ Toast notifications (react-hot-toast)

### Authentication
- ✅ Role-based access (Student, Faculty, Admin)
- ✅ Cookie-based token storage
- ✅ Protected routes
- ✅ Logout with confirmation modal

### Portals
- **Student**: Dashboard, enrollment, courses, assignments, grades, calendar
- **Faculty**: Class management, student tracking, reports
- **Admin**: User management, admissions, departments, analytics

## 🔗 Backend Integration

This frontend requires the TClass Laravel backend:

```bash
git clone https://github.com/primex-joseph/Tclass-website-backend.git
```

See backend docs for setup instructions.

## 🐛 Troubleshooting

### Port already in use
```bash
# Find and kill process on port 3000
npx kill-port 3000
```

### CORS issues
Ensure backend `.env` has:
```env
FRONTEND_URL=http://localhost:3000
SANCTUM_STATEFUL_DOMAINS=localhost:3000,127.0.0.1:3000
```

### Build errors
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

## 📚 Documentation

- [LOCAL_SETUP.md](./LOCAL_SETUP.md) - Complete local setup guide
- [docs/frontend-setup.md](./docs/frontend-setup.md) - Frontend-specific setup
- [docs/AI_PROMPT.md](./docs/AI_PROMPT.md) - AI assistant prompt template

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

© 2026 Provincial Government of Tarlac. All rights reserved.
