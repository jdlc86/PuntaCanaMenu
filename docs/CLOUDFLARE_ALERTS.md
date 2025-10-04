# Sistema de Alertas de Cloudflare

## Descripción General

El sistema de alertas de Cloudflare permite mostrar mensajes importantes al usuario cuando se detectan situaciones excepcionales antes de servir la aplicación. Esto es útil para manejar errores de autenticación, sesiones expiradas, o cualquier otra situación que requiera notificar al usuario.

## Flujo de Funcionamiento

\`\`\`
1. Usuario escanea QR
   ↓
2. Cloudflare detecta irregularidad
   ↓
3. Cloudflare redirige con query parameters
   ?cf_message=...&cf_type=error
   ↓
4. App detecta parámetros y muestra alerta
   ↓
5. Usuario ve mensaje y puede tomar acción
\`\`\`

## Tipos de Mensajes

### 🔴 Error (Crítico)

**Uso**: Errores que impiden el uso de la aplicación

**Características**:
- Color: Rojo
- Icono: AlertCircle
- Comportamiento: Bloquea acceso a la carta
- Acción: Solo permite "Escanear QR nuevamente"

**Ejemplos**:
\`\`\`
?cf_message=Tu sesión ha expirado&cf_type=error
?cf_message=Token inválido o corrupto&cf_type=error
?cf_message=Mesa no encontrada en el sistema&cf_type=error
\`\`\`

### 🟡 Warning (Advertencia)

**Uso**: Situaciones que requieren atención pero no bloquean la app

**Características**:
- Color: Amarillo
- Icono: AlertTriangle
- Comportamiento: Permite cerrar o reintentar
- Acciones: "Cerrar" y "Reintentar"

**Ejemplos**:
\`\`\`
?cf_message=La sesión está por expirar&cf_type=warning
?cf_message=Conexión inestable detectada&cf_type=warning
?cf_message=Algunos servicios no están disponibles&cf_type=warning
\`\`\`

### 🔵 Info (Información)

**Uso**: Mensajes informativos que no requieren acción inmediata

**Características**:
- Color: Azul
- Icono: Info
- Comportamiento: Permite cerrar o continuar
- Acciones: "Cerrar" y "Continuar"

**Ejemplos**:
\`\`\`
?cf_message=Bienvenido al sistema de pedidos&cf_type=info
?cf_message=Nueva versión disponible&cf_type=info
?cf_message=Mantenimiento programado para mañana&cf_type=info
\`\`\`

## Formato de URL

### Estructura Básica

\`\`\`
https://your-app.vercel.app?cf_message={mensaje}&cf_type={tipo}
\`\`\`

### Parámetros

| Parámetro | Tipo | Valores | Requerido | Descripción |
|-----------|------|---------|-----------|-------------|
| `cf_message` | string | Cualquier texto | Sí | Mensaje a mostrar al usuario |
| `cf_type` | string | `error`, `warning`, `info` | Sí | Tipo de mensaje |

### Ejemplos Completos

\`\`\`bash
# Error crítico
https://app.com?cf_message=Sesión%20expirada&cf_type=error

# Advertencia
https://app.com?cf_message=Conexión%20lenta&cf_type=warning

# Información
https://app.com?cf_message=Bienvenido&cf_type=info
\`\`\`

**Nota**: Los espacios y caracteres especiales deben estar URL-encoded.

## Implementación en Cloudflare Worker

### Ejemplo Básico

\`\`\`typescript
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    
    // Validar token
    const token = url.searchParams.get('token')
    
    if (!token) {
      // Redirigir con mensaje de error
      const errorUrl = new URL(env.APP_URL)
      errorUrl.searchParams.set('cf_message', 'No se proporcionó token de autenticación')
      errorUrl.searchParams.set('cf_type', 'error')
      
      return Response.redirect(errorUrl.toString(), 302)
    }
    
    // Validar token
    const validation = await validateToken(token, env.JWT_SECRET)
    
    if (!validation.valid) {
      const errorUrl = new URL(env.APP_URL)
      errorUrl.searchParams.set('cf_message', validation.error || 'Token inválido')
      errorUrl.searchParams.set('cf_type', 'error')
      
      return Response.redirect(errorUrl.toString(), 302)
    }
    
    // Token válido, redirigir a la app
    const appUrl = new URL(env.APP_URL)
    appUrl.searchParams.set('token', token)
    
    return Response.redirect(appUrl.toString(), 302)
  }
}
\`\`\`

### Casos de Uso Comunes

#### 1. Token Expirado

\`\`\`typescript
if (payload.exp < Date.now() / 1000) {
  const errorUrl = new URL(env.APP_URL)
  errorUrl.searchParams.set('cf_message', 'Tu sesión ha expirado. Por favor, escanea el QR nuevamente.')
  errorUrl.searchParams.set('cf_type', 'error')
  return Response.redirect(errorUrl.toString(), 302)
}
\`\`\`

#### 2. Mesa No Encontrada

\`\`\`typescript
const table = await getTable(payload.table_id)

if (!table) {
  const errorUrl = new URL(env.APP_URL)
  errorUrl.searchParams.set('cf_message', 'Mesa no encontrada en el sistema. Contacta al personal.')
  errorUrl.searchParams.set('cf_type', 'error')
  return Response.redirect(errorUrl.toString(), 302)
}
\`\`\`

#### 3. Sesión Próxima a Expirar

\`\`\`typescript
const timeLeft = payload.exp - (Date.now() / 1000)

if (timeLeft < 300) { // Menos de 5 minutos
  const warningUrl = new URL(env.APP_URL)
  warningUrl.searchParams.set('token', token)
  warningUrl.searchParams.set('cf_message', 'Tu sesión expirará pronto. Guarda tus cambios.')
  warningUrl.searchParams.set('cf_type', 'warning')
  return Response.redirect(warningUrl.toString(), 302)
}
\`\`\`

#### 4. Mantenimiento Programado

\`\`\`typescript
const maintenanceTime = new Date('2025-02-15T02:00:00Z')
const now = new Date()

if (now < maintenanceTime && maintenanceTime.getTime() - now.getTime() < 3600000) {
  const infoUrl = new URL(env.APP_URL)
  infoUrl.searchParams.set('token', token)
  infoUrl.searchParams.set('cf_message', 'Mantenimiento programado en 1 hora. Completa tus pedidos.')
  infoUrl.searchParams.set('cf_type', 'info')
  return Response.redirect(infoUrl.toString(), 302)
}
\`\`\`

## Implementación en Next.js

### Componente CloudflareAlert

El componente `CloudflareAlert` se encarga de:

1. Detectar los query parameters `cf_message` y `cf_type`
2. Mostrar un modal bloqueante con el mensaje
3. Aplicar estilos según el tipo de mensaje
4. Proporcionar acciones apropiadas

### Ubicación

\`\`\`
components/cloudflare-alert.tsx
\`\`\`

### Integración en la App

El componente se integra en `app/page.tsx`:

\`\`\`tsx
import CloudflareAlert from "@/components/cloudflare-alert"

export default function Home() {
  return (
    <>
      <CloudflareAlert />
      {/* Resto de la aplicación */}
    </>
  )
}
\`\`\`

### Comportamiento

- **Detección automática**: Al cargar la página, detecta los parámetros
- **Modal bloqueante**: Impide interacción con la app hasta tomar acción
- **Limpieza de URL**: Después de mostrar, limpia los parámetros de la URL
- **Responsive**: Se adapta a móviles y desktop

## Estilos Visuales

### Error (Rojo)

\`\`\`tsx
<div className="border-red-500 bg-red-50 dark:bg-red-950">
  <AlertCircle className="h-5 w-5 text-red-600" />
  <h2 className="text-red-900 dark:text-red-100">Error</h2>
  <p className="text-red-700 dark:text-red-300">{message}</p>
</div>
\`\`\`

### Warning (Amarillo)

\`\`\`tsx
<div className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
  <AlertTriangle className="h-5 w-5 text-yellow-600" />
  <h2 className="text-yellow-900 dark:text-yellow-100">Advertencia</h2>
  <p className="text-yellow-700 dark:text-yellow-300">{message}</p>
</div>
\`\`\`

### Info (Azul)

\`\`\`tsx
<div className="border-blue-500 bg-blue-50 dark:bg-blue-950">
  <Info className="h-5 w-5 text-blue-600" />
  <h2 className="text-blue-900 dark:text-blue-100">Información</h2>
  <p className="text-blue-700 dark:text-blue-300">{message}</p>
</div>
\`\`\`

## Internacionalización

Los mensajes de Cloudflare se muestran tal como se reciben (en el idioma que Cloudflare los envíe). Sin embargo, los botones y títulos se traducen automáticamente según el idioma seleccionado:

\`\`\`typescript
// Traducciones en lib/i18n.ts
{
  error: "Error",
  warning: "Advertencia", 
  information: "Información",
  close: "Cerrar",
  retry: "Reintentar",
  continue: "Continuar",
  scanQRAgain: "Escanear QR nuevamente"
}
\`\`\`

## Testing

### Probar Localmente

\`\`\`bash
# Error
http://localhost:3000?cf_message=Sesión%20expirada&cf_type=error

# Warning
http://localhost:3000?cf_message=Conexión%20lenta&cf_type=warning

# Info
http://localhost:3000?cf_message=Bienvenido&cf_type=info
\`\`\`

### Casos de Prueba

1. **Error sin mensaje**: Debe mostrar mensaje genérico
2. **Tipo inválido**: Debe tratar como `info`
3. **Mensaje muy largo**: Debe ser scrollable
4. **Caracteres especiales**: Deben mostrarse correctamente
5. **Múltiples alertas**: Solo debe mostrar la primera

## Mejores Prácticas

### ✅ Hacer

- Usar mensajes claros y concisos
- Proporcionar contexto sobre qué hacer
- URL-encode los mensajes correctamente
- Usar el tipo apropiado según la severidad
- Incluir instrucciones de recuperación

### ❌ Evitar

- Mensajes técnicos incomprensibles para usuarios
- Mensajes demasiado largos
- Usar `error` para todo
- Exponer información sensible en los mensajes
- Olvidar URL-encode caracteres especiales

## Seguridad

### Consideraciones

1. **No exponer información sensible**: Los mensajes son visibles en la URL
2. **Validar en el servidor**: No confiar solo en mensajes de Cloudflare
3. **Rate limiting**: Implementar límites para prevenir spam
4. **Sanitización**: Escapar HTML en los mensajes para prevenir XSS

### Ejemplo de Sanitización

\`\`\`typescript
// El componente ya escapa HTML automáticamente usando React
<p className="text-sm">{message}</p> // Seguro
\`\`\`

## Monitoreo y Logs

### Cloudflare Worker

\`\`\`typescript
// Log de alertas enviadas
console.log({
  type: 'cloudflare_alert',
  message: errorMessage,
  alert_type: 'error',
  table_id: payload.table_id,
  timestamp: new Date().toISOString()
})
\`\`\`

### Next.js App

\`\`\`typescript
// El componente ya incluye logs
console.log('[CloudflareAlert] Showing alert:', { type, message })
\`\`\`

## Troubleshooting

### La alerta no se muestra

1. Verifica que los parámetros estén en la URL
2. Comprueba la consola del navegador
3. Asegúrate de que `CloudflareAlert` esté en `page.tsx`

### El mensaje se muestra incorrectamente

1. Verifica que esté URL-encoded
2. Comprueba caracteres especiales
3. Revisa la longitud del mensaje

### La alerta se muestra múltiples veces

1. Verifica que se limpien los parámetros de la URL
2. Comprueba que no haya múltiples instancias del componente

## Roadmap

- [ ] Soporte para múltiples alertas en cola
- [ ] Persistencia de alertas en sessionStorage
- [ ] Animaciones de entrada/salida
- [ ] Sonidos de notificación opcionales
- [ ] Historial de alertas
- [ ] Analytics de alertas mostradas

---

**Última actualización**: Febrero 2025
