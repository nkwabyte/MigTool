# Next.js Migration - Quick Start Guide

## ✅ Migration Complete!

Your MiGTool application has been successfully converted from Vite to Next.js 15.

## 📁 New Project Structure

```
MiGTool/
├── app/                    # Next.js App Router directory
│   ├── layout.tsx         # Root layout with theme provider
│   ├── page.tsx           # Home page (/)
│   └── globals.css        # Global styles
├── src/                   # Source code
│   ├── App.tsx            # Main application component
│   ├── components/        # React components
│   │   ├── ui/           # UI component library
│   │   ├── modules/      # Feature modules
│   │   └── figma/        # Figma components
│   ├── assets/           # Static assets
│   ├── guidelines/       # Documentation
│   └── index.css         # Old CSS (kept for reference)
├── public/               # Static files
├── next.config.js        # Next.js configuration
├── tsconfig.json         # TypeScript configuration
├── tailwind.config.ts    # Tailwind CSS configuration
├── postcss.config.js     # PostCSS configuration
└── package.json          # Dependencies and scripts

```

## 🚀 Getting Started

### Install Dependencies
```bash
npm install
```

### Start Development Server
```bash
npm run dev
```
Visit `http://localhost:3000` in your browser.

### Build for Production
```bash
npm run build
npm start
```

## 🔄 Key Changes from Vite

| Feature | Vite | Next.js |
|---------|------|---------|
| Entry Point | `src/main.tsx` | `app/layout.tsx` + `app/page.tsx` |
| Config File | `vite.config.ts` | `next.config.js` |
| CSS | `src/index.css` | `app/globals.css` |
| Dev Server | `npm run dev` | `npm run dev` |
| Build | `npm run build` | `npm run build` |

## ✨ Features Enabled

- ✅ Server-Side Rendering (SSR)
- ✅ Static Site Generation (SSG)
- ✅ Built-in CSS/Sass support
- ✅ Image optimization
- ✅ Font optimization
- ✅ API routes ready (`app/api/`)
- ✅ TypeScript support
- ✅ Tailwind CSS with dark mode
- ✅ Theme support via `next-themes`

## 📝 Important Notes

1. **Client Components**: Components that use hooks like `useState` must have `'use client'` at the top
2. **Imports**: Use the `@/` alias for imports from the root (configured in `tsconfig.json`)
3. **API Routes**: Create API endpoints in `app/api/route.ts`
4. **Environment Variables**: Client variables must start with `NEXT_PUBLIC_`

## 📚 Documentation

For more details, see:
- [MIGRATION.md](./MIGRATION.md) - Complete migration guide
- [Next.js Docs](https://nextjs.org/docs) - Official documentation
- [Tailwind CSS with Next.js](https://tailwindcss.com/docs/guides/nextjs)

## 🎯 Next Steps

1. Run `npm install` to install dependencies
2. Run `npm run dev` to start development
3. Review the component structure in `src/components/`
4. Check [MIGRATION.md](./MIGRATION.md) for detailed changes
5. Deploy to [Vercel](https://vercel.com) for free Next.js hosting

## ❓ Troubleshooting

**Q: Build fails with import errors**
A: Ensure the `@/` path alias in `tsconfig.json` matches your directory structure.

**Q: Styles not loading**
A: Verify `app/globals.css` is imported in `app/layout.tsx`.

**Q: Hot reload not working**
A: Restart the development server with `npm run dev`.

---

Happy coding! 🚀
