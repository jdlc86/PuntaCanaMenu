# Guía de Desarrollo

## Introducción

Esta guía proporciona información detallada para desarrolladores que trabajan en el sistema de pedidos del restaurante.

## 🏗️ Arquitectura

### Stack Tecnológico

\`\`\`
Frontend:
├── Next.js 14 (App Router)
├── React 19
├── TypeScript 5
├── Tailwind CSS 4
└── shadcn/ui

Backend:
├── Next.js API Routes
├── Supabase (PostgreSQL)
└── Cloudflare Workers (JWT)

Estado:
├── React Context API
├── SWR (data fetching)
└── sessionStorage (JWT)

UI Components:
├── Radix UI primitives
├── Lucide React icons
├── Sonner (toasts)
└── React Hook Form + Zod
\`\`\`

### Estructura de Carpetas

\`\`\`
restaurant-ordering-frontend/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── menu/          # Menu endpoints
│   │   ├── orders/        # Order management
│   │   ├── service-request/  # Waiter calls
│   │   └── validate-token/   # JWT validation
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
│
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── menu-browser.tsx  # Main menu component
│   ├── floating-cart.tsx # Shopping cart
│   ├── order-confirmation.tsx
│   ├── cloudflare-alert.tsx
│   └── ...
│
├── lib/                   # Utilities and helpers
│   ├── supabase/         # Supabase clients
│   │   ├── client.ts     # Browser client
│   │   └── server.ts     # Server client
│   ├── table-context.tsx # Table/JWT context
│   ├── cart-context.tsx  # Shopping cart context
│   ├── i18n.ts           # Internationalization
│   ├── jwt.ts            # JWT utilities
│   ├── api.ts            # API client
│   ├── money.ts          # Currency formatting
│   ├── whatsapp.ts       # WhatsApp integration
│   └── utils.ts          # General utilities
│
├── hooks/                 # Custom React hooks
│   ├── use-mobile.ts     # Mobile detection
│   ├── use-toast.ts      # Toast notifications
│   └── ...
│
├── types/                 # TypeScript types
│   └── menu.ts           # Menu item types
│
├── scripts/               # SQL scripts
│   ├── 01_create_database_schema.sql
│   ├── 02_seed_sample_data.sql
│   └── 03_create_menu_visible_view.sql
│
├── docs/                  # Documentation
│   ├── JWT_INTEGRATION.md
│   ├── CLOUDFLARE_ALERTS.md
│   ├── USER_GUIDE.md
│   ├── DEVELOPMENT.md
│   └── API.md
│
└── public/                # Static assets
    ├── sw.js             # Service Worker
    ├── LOGO.png          # Restaurant logo
    └── *.jpg             # Dish images
\`\`\`

## 🔧 Configuración del Entorno

### Variables de Entorno

\`\`\`env
# Supabase
SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# JWT (Production only)
JWT_SECRET=your-secret-key
NEXT_PUBLIC_REQUIRE_JWT=false  # true in production

# WhatsApp
NEXT_PUBLIC_WA_PHONE=1234567890

# Optional
NEXT_PUBLIC_ANALYTICS_ID=xxx
\`\`\`

### Instalación

\`\`\`bash
# Clonar repositorio
git clone <repo-url>
cd restaurant-ordering-frontend

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales

# Ejecutar base de datos
# Ejecutar scripts SQL en Supabase en orden

# Iniciar desarrollo
pnpm dev
\`\`\`

## 📊 Base de Datos

### Esquema Principal

#### Tabla: `menu_items`

\`\`\`sql
CREATE TABLE menu_items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(100),
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  allergens TEXT[],
  rating DECIMAL(3, 2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

#### Tabla: `orders`

\`\`\`sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  table_id VARCHAR(20) NOT NULL,
  order_type VARCHAR(1) NOT NULL, -- 'R', 'O', 'C'
  items JSONB NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  tip DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

#### Tabla: `service_requests`

\`\`\`sql
CREATE TABLE service_requests (
  id SERIAL PRIMARY KEY,
  table_id VARCHAR(20) NOT NULL,
  request_type VARCHAR(50) NOT NULL, -- 'waiter', 'bill'
  message TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP
);
\`\`\`

#### Tabla: `announcements`

\`\`\`sql
CREATE TABLE announcements (
  id SERIAL PRIMARY KEY,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info', -- 'info', 'warning', 'promo'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);
\`\`\`

### Políticas RLS

\`\`\`sql
-- Permitir lectura pública de menú
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access"
ON menu_items FOR SELECT
USING (is_available = true);

-- Permitir inserción de pedidos
CREATE POLICY "Allow insert orders"
ON orders FOR INSERT
WITH CHECK (true);

-- Permitir lectura de pedidos por mesa
CREATE POLICY "Allow read own orders"
ON orders FOR SELECT
USING (table_id = current_setting('request.jwt.claims')::json->>'table_id');
\`\`\`

## 🎨 Sistema de Diseño

### Colores (Design Tokens)

\`\`\`css
/* globals.css */
@theme inline {
  /* Primary */
  --color-primary: #f97316;
  --color-primary-foreground: #ffffff;
  
  /* Background */
  --color-background: #ffffff;
  --color-foreground: #0a0a0a;
  
  /* Muted */
  --color-muted: #f5f5f5;
  --color-muted-foreground: #737373;
  
  /* Accent */
  --color-accent: #f5f5f5;
  --color-accent-foreground: #0a0a0a;
  
  /* Destructive */
  --color-destructive: #ef4444;
  --color-destructive-foreground: #ffffff;
  
  /* Border */
  --color-border: #e5e5e5;
  --color-input: #e5e5e5;
  --color-ring: #f97316;
  
  /* Radius */
  --radius: 0.5rem;
}
\`\`\`

### Tipografía

\`\`\`typescript
// layout.tsx
import { Geist, Geist_Mono } from 'next/font/google'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})
\`\`\`

### Componentes UI

Todos los componentes UI están en `components/ui/` y siguen el patrón de shadcn/ui:

- Basados en Radix UI
- Totalmente personalizables
- Accesibles por defecto
- Tipados con TypeScript

## 🔐 Autenticación JWT

### Flujo de Autenticación

\`\`\`typescript
// 1. Cloudflare Worker genera JWT
const token = await new SignJWT({
  table_id: "12",
  order_type: "R",
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 86400
})
  .setProtectedHeader({ alg: 'HS256' })
  .sign(secret)

// 2. Usuario escanea QR con token
// URL: https://app.com?token=JWT_TOKEN

// 3. TableProvider valida token
const { tableNumber, orderType, token } = useTable()

// 4. API valida token en cada request
const validation = await validateTableToken(token)
\`\`\`

### Implementación

\`\`\`typescript
// lib/jwt.ts
export async function validateTableToken(token: string | null) {
  if (!token) {
    return { valid: false, error: "No token provided" }
  }
  
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)
    
    return {
      valid: true,
      payload: payload as JWTPayload
    }
  } catch (error) {
    return { valid: false, error: "Invalid token" }
  }
}
\`\`\`

## 🌐 Internacionalización

### Sistema i18n

\`\`\`typescript
// lib/i18n.ts
export const translations = {
  es: {
    welcome: "Bienvenido",
    menu: "Menú",
    cart: "Carrito",
    // ...
  },
  en: {
    welcome: "Welcome",
    menu: "Menu",
    cart: "Cart",
    // ...
  },
  // de, fr, zh...
}

export function useTranslation(lang: Language) {
  return (key: string) => translations[lang][key] || key
}
\`\`\`

### Uso

\`\`\`typescript
const { language } = useTable()
const t = useTranslation(language)

return <h1>{t("welcome")}</h1>
\`\`\`

## 📡 API Routes

### Estructura

\`\`\`typescript
// app/api/menu/route.ts
export async function GET(request: Request) {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('is_available', true)
    
    if (error) throw error
    
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch menu' },
      { status: 500 }
    )
  }
}
\`\`\`

### Endpoints Disponibles

Ver [docs/API.md](docs/API.md) para documentación completa.

## 🧪 Testing

### Unit Tests

\`\`\`bash
# Ejecutar tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage
\`\`\`

### E2E Tests

\`\`\`bash
# Ejecutar Playwright
pnpm test:e2e

# UI mode
pnpm test:e2e:ui
\`\`\`

## 🚀 Deployment

### Vercel

\`\`\`bash
# Instalar Vercel CLI
pnpm i -g vercel

# Login
vercel login

# Deploy
vercel

# Production
vercel --prod
\`\`\`

### Variables de Entorno en Vercel

1. Ve a Project Settings → Environment Variables
2. Agrega todas las variables de `.env.local`
3. Asegúrate de marcar las correctas como Production/Preview/Development

### Build

\`\`\`bash
# Build local
pnpm build

# Iniciar producción
pnpm start
\`\`\`

## 🐛 Debugging

### Console Logs

\`\`\`typescript
// Usar prefijo [v0] para logs de debug
console.log("[v0] User data:", userData)
console.log("[v0] API response:", response)
\`\`\`

### React DevTools

1. Instalar extensión de React DevTools
2. Inspeccionar componentes y estado
3. Revisar Context values

### Network Tab

1. Abrir DevTools → Network
2. Filtrar por Fetch/XHR
3. Revisar requests y responses

## 📝 Convenciones de Código

### TypeScript

\`\`\`typescript
// Usar interfaces para objetos
interface MenuItem {
  id: number
  name: string
  price: number
}

// Usar types para unions
type OrderType = 'R' | 'O' | 'C'

// Exportar tipos
export type { MenuItem, OrderType }
\`\`\`

### Componentes

\`\`\`typescript
// Usar function declarations
export function MyComponent({ prop }: Props) {
  return <div>{prop}</div>
}

// Props interface
interface Props {
  prop: string
}
\`\`\`

### Naming

- **Componentes**: PascalCase (`MenuBrowser`)
- **Funciones**: camelCase (`fetchMenu`)
- **Constantes**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Archivos**: kebab-case (`menu-browser.tsx`)

### Imports

\`\`\`typescript
// Orden de imports
import { useState } from 'react'           // React
import { useRouter } from 'next/navigation' // Next.js
import { Button } from '@/components/ui'   // UI components
import { useTable } from '@/lib/table-context' // Lib
import type { MenuItem } from '@/types/menu'   // Types
\`\`\`

## 🔄 Git Workflow

### Branches

\`\`\`bash
main          # Production
develop       # Development
feature/*     # New features
bugfix/*      # Bug fixes
hotfix/*      # Production hotfixes
\`\`\`

### Commits

\`\`\`bash
# Formato
type(scope): message

# Ejemplos
feat(menu): add search functionality
fix(cart): resolve quantity update bug
docs(readme): update installation steps
style(ui): improve button spacing
refactor(api): simplify error handling
\`\`\`

### Pull Requests

1. Crear branch desde `develop`
2. Hacer cambios y commits
3. Push y crear PR
4. Code review
5. Merge a `develop`
6. Deploy a staging
7. Merge a `main` para production

## 📚 Recursos

### Documentación

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Supabase Docs](https://supabase.com/docs)

### Herramientas

- [VS Code](https://code.visualstudio.com)
- [Vercel](https://vercel.com)
- [Supabase Dashboard](https://app.supabase.com)
- [Cloudflare Dashboard](https://dash.cloudflare.com)

## 🤝 Contribuir

1. Fork el proyecto
2. Crear feature branch
3. Hacer cambios
4. Escribir tests
5. Commit con mensaje descriptivo
6. Push y crear PR
7. Esperar code review

## 📞 Soporte

- **Issues**: Abrir issue en GitHub
- **Slack**: Canal #dev-restaurant
- **Email**: dev@restaurant.com

---

**Happy Coding!** 🚀
