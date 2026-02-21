# Frontend Setup Guide (Next.js)

Complete guide for setting up the TClass frontend on a new device.

## 📋 Prerequisites

Before starting, ensure you have:

| Software | Version | Verify Command |
|----------|---------|----------------|
| Node.js | 18+ | `node --version` |
| npm | 9+ | `npm --version` |
| Git | Latest | `git --version` |

**Download Node.js**: [nodejs.org](https://nodejs.org) (LTS recommended)

## 🚀 Quick Setup

### 1. Navigate to Project

```powershell
cd C:\Projects\Tclass-website
```

Or your custom project location.

### 2. Install Dependencies

```powershell
npm install
```

This installs all packages from `package.json`:
- Next.js 15
- React 19
- TypeScript 5
- Tailwind CSS 4
- shadcn/ui components
- Lucide icons
- And more...

**Installation time**: 2-5 minutes depending on connection

### 3. Configure Environment

Create `.env.local`:

```powershell
# Windows
copy .env.example .env.local

# Mac/Linux
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api
```

> **Note**: Ensure this matches your backend Laravel server URL

### 4. Start Development Server

```powershell
npm run dev
```

Server starts at: `http://localhost:3000`

You should see:
```
▲ Next.js 15.x
- Local:        http://localhost:3000
- Network:      http://10.x.x.x:3000
```

## 📁 Project Structure

```
Tclass-website/
├── app/                    # Next.js App Router
│   ├── (faculty-admin)/    # Group routes
│   │   ├── admin/          # Admin portal
│   │   ├── faculty/        # Faculty portal
│   │   └── layout.tsx      # Shared layout
│   ├── admission/          # Admission form
│   ├── login/              # Login page
│   ├── programs/           # Programs listing
│   ├── vocational/         # Vocational form
│   ├── globals.css         # Tailwind + globals
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Landing page
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── student/            # Student components
│   └── ...
├── lib/                    # Utilities
│   ├── api-client.ts       # API fetch wrapper
│   ├── auth.ts             # Auth helpers
│   └── utils.ts            # cn() merge
├── public/                 # Static assets
└── docs/                   # Documentation
```

## 🌐 Available Routes

| Route | Description | Access |
|-------|-------------|--------|
| `/` | Landing page | Public |
| `/login` | Authentication | Public |
| `/programs` | Programs list | Public |
| `/vocational` | Vocational form | Public |
| `/admission` | Admission form | Public |
| `/student` | Student dashboard | Student |
| `/student/enrollment` | Enrollment | Student |
| `/faculty` | Faculty dashboard | Faculty |
| `/admin` | Admin dashboard | Admin |

## 📝 Available Scripts

```bash
# Development
npm run dev              # Start dev server

# Production
npm run build            # Build for production
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint
npx tsc --noEmit         # Type check
```

## 🔧 Development Workflow

### Typical Daily Flow

1. **Start Backend First** (in separate terminal):
   ```powershell
   cd C:\Projects\Tclass-website-backend
   php artisan serve --host=127.0.0.1 --port=8000
   ```

2. **Start Frontend**:
   ```powershell
   cd C:\Projects\Tclass-website
   npm run dev
   ```

3. **Open Browser**:
   - Frontend: http://localhost:3000
   - Backend: http://127.0.0.1:8000

### File Watching

Next.js automatically watches for changes:
- Save file → Hot reload
- No manual refresh needed
- Preserves component state when possible

## 🐛 Troubleshooting

### Port 3000 Already in Use

```powershell
# Find and kill process
npx kill-port 3000

# Or use different port
npm run dev -- --port 3001
```

### Module Not Found Errors

```powershell
# Clear node_modules and reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### Build Cache Issues

```powershell
# Clear Next.js cache
Remove-Item -Recurse -Force .next
npm run dev
```

### Environment Variables Not Loading

1. Verify `.env.local` exists in project root
2. Restart dev server after changes
3. Variables must start with `NEXT_PUBLIC_` to be client-side accessible

### TypeScript Errors

```powershell
# Check for type errors
npx tsc --noEmit
```

## 🎨 Tech Stack Details

### Core
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5
- **Runtime**: Node.js 18+

### Styling
- **CSS Framework**: Tailwind CSS 4
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Animations**: CSS transitions + Framer Motion (where needed)

### State Management
- **Local State**: React hooks (useState, useEffect)
- **Global State**: React Context (minimal)
- **Server State**: Native fetch with custom wrapper

### Development Tools
- **Linting**: ESLint
- **Type Checking**: TypeScript
- **Formatting**: (optional) Prettier

## 📱 Mobile Development

The frontend is mobile-first responsive:

- Test at `http://localhost:3000` on mobile device
- Or use Chrome DevTools device emulator
- Key breakpoints: `sm:640px`, `md:768px`, `lg:1024px`, `xl:1280px`

## 🔐 Authentication Flow

```
1. User visits /login
2. Selects role (Student/Faculty/Admin)
3. Enters credentials
4. API call to /auth/login
5. On success: Sets cookies (tclass_token, tclass_role)
6. Redirects to role-specific dashboard
7. Protected routes check cookies
```

## 🧪 Testing Checklist

After setup, verify:

- [ ] Landing page loads correctly
- [ ] Dark mode toggle works
- [ ] Mobile menu functions
- [ ] Login page accessible
- [ ] Can authenticate with test credentials
- [ ] Backend API responds
- [ ] Contact form submits
- [ ] Navigation between pages works

## 📝 Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | Yes | Backend API URL |

## 🤖 Working with AI

See [AI_PROMPT.md](./AI_PROMPT.md) for:
- Project context for AI assistants
- Common code patterns
- Component guidelines
- File structure reference

## 📚 Additional Resources

- [LOCAL_SETUP.md](../LOCAL_SETUP.md) - Full stack setup
- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui Docs](https://ui.shadcn.com)

## 🆘 Support

For issues:
1. Check this guide
2. Review [LOCAL_SETUP.md](../LOCAL_SETUP.md)
3. Check backend is running
4. Verify `.env.local` configuration
