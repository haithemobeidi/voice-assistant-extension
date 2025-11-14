# Phase 1: Web App Foundation

## Overview
Set up the web application foundation with modern tooling, design system, and navigation structure. Create the app shell matching the mockup designs.

## Prerequisites
- [x] Node.js 18+ installed
- [x] WSL2 environment
- [x] Design mockups reviewed (mockup1.html, mockup2.html, mockup3.html)
- [x] Project folder created

## Deliverables
- [ ] Vite + TypeScript + Tailwind project initialized
- [ ] Folder structure matching best practices
- [ ] App shell with header, bottom nav, and page routing
- [ ] Design system (colors, typography, components) implemented
- [ ] Home page with quick actions layout
- [ ] Mobile-responsive layout working

## Steps

### 1. Initialize Vite Project
```bash
cd web-app
npm create vite@latest . -- --template vanilla-ts
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 2. Install Dependencies
```bash
npm install @phosphor-icons/web
npm install localforage  # For offline type chart storage
```

### 3. Configure Tailwind
- Set up tailwind.config.js with Pokémon color palette
- Add custom utility classes for design system
- Configure content paths

### 4. Create Project Structure
```
src/
├── main.ts           # Entry point
├── style.css         # Global Tailwind imports
├── router.ts         # Simple SPA routing
├── types/            # TypeScript interfaces
├── components/       # Reusable UI components
│   ├── TypePill.ts
│   ├── Card.ts
│   └── Button.ts
├── pages/            # Page components
│   ├── HomePage.ts
│   ├── CalculatorPage.ts
│   ├── TradingPage.ts
│   └── TeamBuilderPage.ts
├── data/             # Data and API
│   ├── typeChart.ts
│   └── api.ts
└── utils/            # Helper functions
```

### 5. Build App Shell
- Create persistent header with Pokéball logo
- Implement bottom navigation (Home, Trading, Calculator, Teams)
- Add page routing logic
- Ensure 4px border around app container

### 6. Implement Home Page
- Quick action buttons grid (4 buttons)
- Recent news cards (2 sample items)
- Proper spacing and card styles

### 7. Test Responsiveness
- Test on mobile viewport (375px, 420px)
- Test on tablet viewport (768px)
- Ensure navigation works smoothly

## Success Criteria
- ✅ App runs with `npm run dev`
- ✅ Navigation switches between pages without page reload
- ✅ Design matches mockup1.html appearance
- ✅ Mobile-first layout works on 375px+ screens
- ✅ No console errors
- ✅ TypeScript compiles without errors

## Status: IN_PROGRESS

## Notes
- Using vanilla TypeScript instead of a framework for simplicity and speed
- Tailwind config must include custom Pokémon colors from mockups
- Bottom navigation should highlight active page
- All pages start as placeholder shells (detailed features in later phases)
