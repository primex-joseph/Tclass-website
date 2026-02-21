# TClass Documentation

Welcome to the TClass School Management System documentation.

## 📚 Documentation Files

| File | Description |
|------|-------------|
| [LOCAL_SETUP.md](../LOCAL_SETUP.md) | Complete setup guide for new devices (Frontend + Backend) |
| [frontend-setup.md](./frontend-setup.md) | Detailed frontend-specific setup |
| [AI_PROMPT.md](./AI_PROMPT.md) | AI assistant context and guidelines |

## 🚀 Quick Links

### Setup Guides
- **[LOCAL_SETUP.md](../LOCAL_SETUP.md)** - Start here for new device setup
- **[AI_PROMPT.md](./AI_PROMPT.md)** - Use this when working with AI assistants

### Project Resources
- **Frontend Repo**: `https://github.com/primex-joseph/Tclass-website.git`
- **Backend Repo**: `https://github.com/primex-joseph/Tclass-website-backend.git`

## 🏗 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    TClass System                        │
├─────────────────────────┬───────────────────────────────┤
│       Frontend          │           Backend             │
│  (Next.js + React)      │      (Laravel + MySQL)        │
├─────────────────────────┼───────────────────────────────┤
│  • Landing Page         │  • REST API                   │
│  • Student Portal       │  • Authentication (Sanctum)   │
│  • Faculty Portal       │  • Database                   │
│  • Admin Portal         │  • Email Service              │
│  • Enrollment Forms     │  • File Storage               │
└─────────────────────────┴───────────────────────────────┘
           │                           │
           └──────────┬────────────────┘
                      │
              Port 3000 │ Port 8000
                 │           │
              http://localhost:3000
              http://127.0.0.1:8000
```

## 📋 Prerequisites Summary

| Component | Requirement |
|-----------|-------------|
| Node.js | 18+ LTS |
| npm | 9+ |
| PHP | 8.1+ |
| Composer | Latest |
| MySQL | 5.7+ or MariaDB 10.3+ |
| Git | Latest |

## 🌐 Development URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://127.0.0.1:8000 |
| phpMyAdmin | http://localhost/phpmyadmin |

## 🎯 Feature Checklist

- [x] Multi-role authentication (Student, Faculty, Admin)
- [x] Dark/Light mode toggle
- [x] Responsive mobile design
- [x] Contact form with email
- [x] Vocational enrollment
- [x] Admission applications
- [x] User management
- [x] Dashboard analytics
- [x] Real-time notifications

## 🆘 Getting Help

1. Check [LOCAL_SETUP.md](../LOCAL_SETUP.md) for setup issues
2. Check [AI_PROMPT.md](./AI_PROMPT.md) for development patterns
3. Review backend logs: `storage/logs/laravel.log`
4. Check browser console for frontend errors

## 📝 Contributing

See main [README.md](../README.md) for contribution guidelines.

---

**Last Updated**: February 2026  
**Maintainers**: TClass Development Team
