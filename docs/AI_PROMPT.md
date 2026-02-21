# AI Assistant Prompt Template for TClass Project

## 🤖 Quick Context for AI

This is a **School Management System** with:
- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Laravel 10 + MySQL
- **Authentication**: Cookie-based with Sanctum

---

## 📋 Project Context (Copy this when starting new AI session)

```
I'm working on the TClass School Management System. Here's the project context:

FRONTEND (Next.js):
- Location: C:\Projects\Tclass-website (or your path)
- Framework: Next.js 15 with App Router
- Styling: Tailwind CSS 4, shadcn/ui components
- Auth: Cookie-based (tclass_token, tclass_role)
- API Base: http://127.0.0.1:8000/api

BACKEND (Laravel):
- Location: C:\Projects\Tclass-website-backend (or your path)  
- Framework: Laravel 10
- Database: MySQL (tclass_db)
- Auth: Laravel Sanctum
- API Endpoint: http://127.0.0.1:8000

ROUTES:
- Landing: /
- Login: /login
- Student: /student/*
- Faculty: /faculty/*
- Admin: /admin/*
- Programs: /programs
- Vocational: /vocational

USER ROLES:
- student, faculty, admin

IMPORTANT FILES:
- lib/auth.ts - Auth utilities
- lib/api-client.ts - API fetch wrapper
- components/ui/* - shadcn/ui components
- app/globals.css - Global styles & dark mode

ENV FILES:
- Frontend: .env.local (NEXT_PUBLIC_API_BASE_URL)
- Backend: .env (DB, MAIL, CORS config)

ALWAYS CHECK:
1. Dark mode support (dark: classes)
2. Mobile responsiveness
3. Use existing shadcn/ui components
4. Follow existing code patterns
```

---

## 🎯 Common Tasks for AI

### 1. Add New Page/Route

```
Create a new page at /admin/reports with:
- Full dark mode support
- Mobile responsive
- Use existing Card, Button, Table components
- Follow admin page layout pattern
```

### 2. Fix UI Issue

```
Fix the login page input fields:
- Ensure proper dark mode styling
- Check contrast ratios
- Match existing input component styles
- Test on mobile view
```

### 3. Add API Integration

```
Add a new API endpoint integration:
- Endpoint: GET /api/student/grades
- Add to lib/api-client.ts
- Create TypeScript types
- Handle loading and error states
- Add toast notifications
```

### 4. Create Component

```
Create a reusable StatsCard component:
- Props: title, value, icon, trend
- Use Card from shadcn/ui
- Support dark mode
- Add hover animation
- Mobile responsive
```

### 5. Fix Dark Mode

```
Fix dark mode on [component/page]:
- Add dark: variants for all colors
- Check bg, text, border colors
- Verify in both light and dark modes
```

---

## 🧠 AI Guidelines

### DO:
- ✅ Use existing shadcn/ui components
- ✅ Follow TypeScript strict mode
- ✅ Add dark mode classes (`dark:bg-slate-950 dark:text-white`)
- ✅ Use Tailwind CSS for styling
- ✅ Import from `@/components/ui/*`
- ✅ Use Lucide icons
- ✅ Follow existing code patterns
- ✅ Add responsive classes (`sm:`, `md:`, `lg:`)
- ✅ Use `cn()` utility for class merging
- ✅ Add proper TypeScript types

### DON'T:
- ❌ Install new UI libraries without asking
- ❌ Use inline styles (use Tailwind)
- ❌ Skip dark mode support
- ❌ Hardcode colors (use CSS variables)
- ❌ Break existing component patterns
- ❌ Forget mobile responsiveness
- ❌ Use `any` type

---

## 🔧 Common Code Patterns

### Button with Icon
```tsx
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

<Button className="gap-2">
  Submit
  <ArrowRight className="h-4 w-4" />
</Button>
```

### Card Layout
```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
</Card>
```

### Dark Mode Classes
```tsx
<div className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
  Content
</div>
```

### API Call Pattern
```tsx
import { apiFetch } from "@/lib/api-client";
import toast from "react-hot-toast";

const fetchData = async () => {
  try {
    const response = await apiFetch("/endpoint");
    const data = await response.json();
    return data;
  } catch (error) {
    toast.error("Failed to fetch data");
  }
};
```

### Form Input
```tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input 
    id="email" 
    type="email"
    className="dark:bg-slate-800 dark:border-slate-700"
  />
</div>
```

---

## 📂 File Structure Reference

```
app/
├── (faculty-admin)/          # Shared layout
│   ├── admin/                # Admin portal
│   ├── faculty/              # Faculty portal
│   └── layout.tsx
├── admission/
├── login/
├── programs/
├── vocational/
├── globals.css               # Tailwind + dark mode
├── layout.tsx
└── page.tsx                  # Landing

components/
├── ui/                       # shadcn/ui
│   ├── avatar-actions-menu.tsx
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── dropdown-menu.tsx
│   ├── input.tsx
│   ├── label.tsx
│   ├── logout-modal.tsx
│   ├── select.tsx
│   ├── table.tsx
│   ├── tabs.tsx
│   └── theme-icon-button.tsx
├── student/
└── ...

lib/
├── api-client.ts             # API wrapper
├── auth.ts                   # Auth utilities
├── contact-submit.ts
└── utils.ts                  # cn() helper

public/
├── tclass-logo.jpg
├── tclass.jpg
└── ...
```

---

## 🎨 Color Scheme

### Light Mode
- Background: `bg-white`
- Cards: `bg-white` / `bg-slate-50`
- Text: `text-slate-900`
- Primary: `bg-blue-600 text-white`
- Border: `border-slate-200`

### Dark Mode
- Background: `dark:bg-slate-950`
- Cards: `dark:bg-slate-900`
- Text: `dark:text-slate-100`
- Primary: `dark:bg-blue-600 dark:text-white`
- Border: `dark:border-slate-800`

---

## 🔐 Auth Context

```typescript
// Cookies used:
- tclass_token: JWT token
- tclass_role: 'student' | 'faculty' | 'admin'

// Check role:
import { getRoleHome } from "@/lib/auth";
const homeRoute = getRoleHome(role); // returns /student, /faculty, /admin
```

---

## 📞 Support Resources

If stuck, check:
1. `LOCAL_SETUP.md` - Full setup guide
2. `README.md` - Project overview
3. `docs/frontend-setup.md` - Frontend details
4. Backend repo docs for API issues

---

## ⚡ Quick Commands for AI

```bash
# Check if dev server is running
curl http://localhost:3000

# Check backend API
curl http://127.0.0.1:8000/api

# Type check
npx tsc --noEmit

# Lint
npm run lint
```
