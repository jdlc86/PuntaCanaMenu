# Restaurant Table Ordering System - Frontend

Sistema moderno de pedidos para restaurantes construido con Next.js 14, Supabase y integración con Cloudflare Workers para autenticación JWT.

## 🌟 Características Principales

- 📱 **Diseño Mobile-First**: Interfaz optimizada para dispositivos móviles
- 🍽️ **Menú Interactivo**: Navegación por categorías con búsqueda y filtros
- 🛒 **Carrito de Compras**: Gestión de pedidos con personalizaciones
- 💰 **Sistema de Propinas**: Cálculo automático de propinas y revisión de pedidos
- 📱 **Integración WhatsApp**: Envío de pedidos y consultas por WhatsApp
- 🖼️ **Carrusel de Imágenes**: Visualización de múltiples fotos por plato
- 🌐 **Multi-idioma**: Soporte para 5 idiomas (ES, EN, DE, FR, ZH)
- 🏷️ **Información de Alérgenos**: Visualización clara de alérgenos
- 🔐 **Autenticación JWT**: Sistema seguro de autenticación por mesa
- 🔔 **Notificaciones Push**: Alertas en tiempo real para actualizaciones
- ⏱️ **Temporizador de Sesión**: Control de tiempo de sesión por mesa
- 🎨 **Temas**: Soporte para modo claro y oscuro
- 🚨 **Sistema de Alertas Cloudflare**: Manejo de errores y mensajes del sistema

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 14 (App Router)
- **UI**: React 19, Tailwind CSS 4, shadcn/ui
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: JWT con Cloudflare Workers
- **Estado**: React Context API, SWR
- **Tipado**: TypeScript
- **Estilos**: Tailwind CSS 4 con componentes Radix UI
- **Iconos**: Lucide React
- **Notificaciones**: Sonner, React Hot Toast
- **Formularios**: React Hook Form + Zod
- **Analytics**: Vercel Analytics

## 📋 Requisitos Previos

- Node.js 18+ 
- pnpm (recomendado) o npm
- Cuenta de Supabase
- Cuenta de Vercel (para deployment)
- Cloudflare Worker configurado (para JWT)

## 🚀 Instalación y Configuración

### 1. Clonar el Repositorio

\`\`\`bash
git clone <repository-url>
cd restaurant-ordering-frontend
\`\`\`

### 2. Instalar Dependencias

\`\`\`bash
pnpm install
# o
npm install
\`\`\`

### 3. Configurar Variables de Entorno

Copia el archivo de ejemplo y configura las variables:

\`\`\`bash
cp .env.example .env.local
\`\`\`

Edita `.env.local` con tus credenciales:

\`\`\`env
# Supabase Configuration
SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT Configuration (PRODUCTION ONLY)
JWT_SECRET=your-jwt-secret-key
NEXT_PUBLIC_REQUIRE_JWT=false  # Set to "true" in production

# WhatsApp Configuration
NEXT_PUBLIC_WA_PHONE=1234567890  # Phone number without + or spaces
NEXT_PUBLIC_WA_ENABLE_DISH_INFO=true  # Enable info button on dishes
NEXT_PUBLIC_WA_ENABLE_ORDER_SEND=true  # Enable order sending via WhatsApp
\`\`\`

### 4. Configurar Base de Datos

Ejecuta los scripts SQL en Supabase en orden:

\`\`\`bash
# 1. Crear esquema de base de datos
scripts/01_create_database_schema.sql

# 2. Poblar datos de ejemplo
scripts/02_seed_sample_data.sql

# 3. Crear vista de menú visible
scripts/03_create_menu_visible_view.sql
\`\`\`

### 5. Ejecutar en Desarrollo

\`\`\`bash
pnpm dev
# o
npm run dev
\`\`\`

La aplicación estará disponible en `http://localhost:3000`

## 📱 Modos de Acceso

El sistema soporta tres tipos de pedidos (`order_type`):

### 🍽️ Tipo R - Restaurant (Mesa)
- Cliente escanea QR en la mesa del restaurante
- Acceso completo a todas las funcionalidades
- Puede llamar al camarero y pedir la cuenta
- Formato de pedido: `R-{timestamp}-{random}`

### 🌐 Tipo O - Online (Delivery/Takeaway)
- Acceso a través de gateway online
- Funciones de camarero deshabilitadas
- Solo permite hacer pedidos
- Formato de pedido: `O-{timestamp}-{random}`

### 👨‍🍳 Tipo C - Camarero (Staff)
- Acceso del personal del restaurante
- Puede hacer pedidos en nombre del cliente
- Formato de pedido: `C-{timestamp}-{random}`

## 🔐 Sistema de Autenticación JWT

### Modo Desarrollo

Para desarrollo local, el JWT es opcional:

\`\`\`env
NEXT_PUBLIC_REQUIRE_JWT=false  # o no establecer la variable
\`\`\`

Accede con parámetros URL:
\`\`\`
http://localhost:3000?mesa=5&type=R
\`\`\`

### Modo Producción

En producción, el JWT es obligatorio:

\`\`\`env
NEXT_PUBLIC_REQUIRE_JWT=true
JWT_SECRET=your-secure-secret
\`\`\`

El flujo es:
1. Usuario escanea QR generado por Cloudflare Worker
2. URL contiene token JWT: `https://app.com?token=JWT_TOKEN`
3. App valida el token y extrae `table_id` y `order_type`
4. Token se almacena en `sessionStorage` para requests autenticados

Ver [docs/JWT_INTEGRATION.md](docs/JWT_INTEGRATION.md) para más detalles.

## 🚨 Sistema de Alertas Cloudflare

Cloudflare puede enviar mensajes de error/advertencia al usuario mediante query parameters:

\`\`\`
https://app.com?cf_message=Tu sesión ha expirado&cf_type=error
\`\`\`

Tipos de mensaje:
- `error`: Errores críticos (rojo) - Bloquea acceso a la carta
- `warning`: Advertencias (amarillo) - Permite cerrar o reintentar
- `info`: Información (azul) - Permite cerrar o continuar

Ver [docs/CLOUDFLARE_ALERTS.md](docs/CLOUDFLARE_ALERTS.md) para más detalles.

## 📱 Integración WhatsApp

El sistema integra WhatsApp para dos funcionalidades principales:

### 1. Consultas sobre Platos
- Botón de información (ℹ️) en cada plato del menú
- Envía mensaje con nombre, descripción y alérgenos
- Se puede activar/desactivar con `NEXT_PUBLIC_WA_ENABLE_DISH_INFO`

### 2. Envío de Pedidos
- Opción para enviar pedidos completos por WhatsApp
- Mensaje formateado con ID, items, precios y propina
- Se puede activar/desactivar con `NEXT_PUBLIC_WA_ENABLE_ORDER_SEND`

### Configuración

\`\`\`env
# Número de teléfono (sin + ni espacios)
NEXT_PUBLIC_WA_PHONE=34612345678

# Activar/desactivar funcionalidades
NEXT_PUBLIC_WA_ENABLE_DISH_INFO=true    # Botón info en platos
NEXT_PUBLIC_WA_ENABLE_ORDER_SEND=true   # Envío de pedidos
\`\`\`

Ver [docs/WHATSAPP_INTEGRATION.md](docs/WHATSAPP_INTEGRATION.md) para más detalles.

## 📁 Estructura del Proyecto

\`\`\`
├── app/
│   ├── api/              # API Routes
│   │   ├── menu/         # Endpoints de menú
│   │   ├── orders/       # Gestión de pedidos
│   │   ├── service-request/  # Llamar camarero/cuenta
│   │   └── validate-token/   # Validación JWT
│   ├── globals.css       # Estilos globales
│   ├── layout.tsx        # Layout principal
│   └── page.tsx          # Página principal
├── components/
│   ├── ui/               # Componentes shadcn/ui
│   ├── menu-browser.tsx  # Navegador de menú
│   ├── floating-cart.tsx # Carrito flotante
│   ├── order-confirmation.tsx  # Confirmación de pedido
│   ├── cloudflare-alert.tsx    # Sistema de alertas
│   └── ...
├── lib/
│   ├── supabase/         # Clientes Supabase
│   ├── table-context.tsx # Contexto de mesa/JWT
│   ├── cart-context.tsx  # Contexto de carrito
│   ├── i18n.ts           # Sistema de traducciones
│   ├── jwt.ts            # Utilidades JWT
│   ├── whatsapp.ts       # Integración WhatsApp
│   └── ...
├── scripts/              # Scripts SQL para Supabase
├── docs/                 # Documentación adicional
└── public/               # Assets estáticos
\`\`\`

## 🌐 Internacionalización (i18n)

El sistema soporta 5 idiomas:

- 🇪🇸 Español (ES) - Por defecto
- 🇬🇧 Inglés (EN)
- 🇩🇪 Alemán (DE)
- 🇫🇷 Francés (FR)
- 🇨🇳 Chino (ZH)

El idioma se detecta automáticamente del navegador o se puede cambiar manualmente desde el selector de idioma.

## 📦 Deployment en Vercel

### 1. Conectar Repositorio

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Click en "New Project"
3. Importa tu repositorio de Git

### 2. Configurar Variables de Entorno

Agrega todas las variables de `.env.local` en Vercel:

- Variables de Supabase
- `JWT_SECRET` (genera uno seguro)
- `NEXT_PUBLIC_REQUIRE_JWT=true`
- `NEXT_PUBLIC_WA_PHONE`
- `NEXT_PUBLIC_WA_ENABLE_DISH_INFO`
- `NEXT_PUBLIC_WA_ENABLE_ORDER_SEND`

### 3. Deploy

\`\`\`bash
git push origin main
\`\`\`

Vercel desplegará automáticamente.

### 4. Configurar Dominio Personalizado

1. Ve a Project Settings → Domains
2. Agrega tu dominio personalizado
3. Configura DNS según las instrucciones

## 🔧 Scripts Disponibles

\`\`\`bash
# Desarrollo
pnpm dev

# Build de producción
pnpm build

# Iniciar servidor de producción
pnpm start

# Linting
pnpm lint
\`\`\`

## 📚 Documentación Adicional

- [JWT Integration](docs/JWT_INTEGRATION.md) - Sistema de autenticación JWT
- [Cloudflare Alerts](docs/CLOUDFLARE_ALERTS.md) - Sistema de alertas
- [WhatsApp Integration](docs/WHATSAPP_INTEGRATION.md) - Integración de WhatsApp
- [User Guide](docs/USER_GUIDE.md) - Guía de usuario
- [Development Guide](docs/DEVELOPMENT.md) - Guía de desarrollo

## 🐛 Troubleshooting

### Error: "Token inválido"

- Verifica que `JWT_SECRET` coincida entre Cloudflare Worker y la app
- Comprueba que el token no haya expirado
- En desarrollo, asegúrate de que `NEXT_PUBLIC_REQUIRE_JWT=false`

### Error: "No se puede conectar a Supabase"

- Verifica las credenciales de Supabase en `.env.local`
- Comprueba que las tablas existan en la base de datos
- Revisa las políticas RLS en Supabase

### Menú no se carga

- Ejecuta los scripts SQL en orden
- Verifica que haya datos en la tabla `menu_items`
- Revisa la consola del navegador para errores

### WhatsApp no se abre

- Verifica que `NEXT_PUBLIC_WA_PHONE` esté configurado correctamente
- Comprueba que las funcionalidades estén activadas (`NEXT_PUBLIC_WA_ENABLE_*`)
- Revisa que el navegador permita abrir ventanas emergentes

### Notificaciones push no funcionan

- Verifica que el navegador soporte Service Workers
- Comprueba que el usuario haya dado permisos
- Revisa que `sw.js` esté en la carpeta `public/`

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y propietario.

## 📞 Soporte

Para soporte, contacta al equipo de desarrollo o abre un issue en el repositorio.

---

Desarrollado con ❤️ para mejorar la experiencia de pedidos en restaurantes
