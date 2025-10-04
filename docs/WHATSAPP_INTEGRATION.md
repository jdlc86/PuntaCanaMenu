# Integración de WhatsApp

## Descripción General

La aplicación integra WhatsApp para dos funcionalidades principales:
1. **Consultas sobre platos** - Botón de información (ℹ️) en cada plato
2. **Envío de pedidos** - Mensaje formateado con el pedido completo

## Variables de Entorno

### `NEXT_PUBLIC_WA_PHONE`
- **Descripción**: Número de teléfono del restaurante para WhatsApp
- **Formato**: Sin el símbolo `+` ni espacios (ej: `34600000000`)
- **Por defecto**: `34600000000`
- **Uso**: Se utiliza en `lib/whatsapp.ts` para generar URLs de WhatsApp

### `NEXT_PUBLIC_WA_ENABLE_DISH_INFO`
- **Descripción**: Activa/desactiva el botón de información (ℹ️) en cada plato
- **Valores**: `"true"` (activado) o `"false"` (desactivado)
- **Por defecto**: `"true"` (activado si no se especifica)
- **Uso**: Controla la visibilidad del botón de información en `components/menu-browser.tsx`

### `NEXT_PUBLIC_WA_ENABLE_ORDER_SEND`
- **Descripción**: Activa/desactiva el envío de pedidos por WhatsApp
- **Valores**: `"true"` (activado) o `"false"` (desactivado)
- **Por defecto**: `"true"` (activado si no se especifica)
- **Uso**: Controla:
  - La opción "Enviar por WhatsApp" en el checkout (`components/checkout-flow.tsx`)
  - La apertura automática de WhatsApp al confirmar pedido (`components/order-confirmation.tsx`)

## Configuración

### Activar todas las funcionalidades (por defecto)
\`\`\`bash
NEXT_PUBLIC_WA_PHONE=34612345678
NEXT_PUBLIC_WA_ENABLE_DISH_INFO=true
NEXT_PUBLIC_WA_ENABLE_ORDER_SEND=true
\`\`\`

### Desactivar botón de información en platos
\`\`\`bash
NEXT_PUBLIC_WA_PHONE=34612345678
NEXT_PUBLIC_WA_ENABLE_DISH_INFO=false
NEXT_PUBLIC_WA_ENABLE_ORDER_SEND=true
\`\`\`

### Desactivar envío de pedidos por WhatsApp
\`\`\`bash
NEXT_PUBLIC_WA_PHONE=34612345678
NEXT_PUBLIC_WA_ENABLE_DISH_INFO=true
NEXT_PUBLIC_WA_ENABLE_ORDER_SEND=false
\`\`\`

### Desactivar todas las funcionalidades de WhatsApp
\`\`\`bash
NEXT_PUBLIC_WA_PHONE=34612345678
NEXT_PUBLIC_WA_ENABLE_DISH_INFO=false
NEXT_PUBLIC_WA_ENABLE_ORDER_SEND=false
\`\`\`

## Funcionalidades

### 1. Botón de Información en Platos

**Ubicación**: `components/menu-browser.tsx`

**Comportamiento**:
- Muestra un botón (ℹ️) junto al precio de cada plato
- Al hacer clic, abre WhatsApp con un mensaje pre-escrito
- El mensaje incluye: nombre del plato, descripción y alérgenos
- Formato del mensaje: `"Necesito más información sobre: {plato}, {descripción} y Alérgenos {lista}"`

**Control**:
\`\`\`typescript
const enableDishInfo = process.env.NEXT_PUBLIC_WA_ENABLE_DISH_INFO !== "false"
\`\`\`

### 2. Envío de Pedidos por WhatsApp

**Ubicación**: 
- `components/checkout-flow.tsx` - Opción de confirmación
- `components/order-confirmation.tsx` - Apertura automática

**Comportamiento**:
- Permite seleccionar "Enviar por WhatsApp" como método de confirmación
- Al confirmar el pedido, abre WhatsApp automáticamente
- El mensaje incluye: ID del pedido, items, precios, propina, notas especiales
- Utiliza la función `openWhatsApp()` de `lib/whatsapp.ts`

**Control**:
\`\`\`typescript
const enableOrderSend = process.env.NEXT_PUBLIC_WA_ENABLE_ORDER_SEND !== "false"
\`\`\`

## Implementación Técnica

### Función `openWhatsApp()` (`lib/whatsapp.ts`)
\`\`\`typescript
export function openWhatsApp({
  orderId,
  total,
  tip,
  itemNotes,
  phone = process.env.NEXT_PUBLIC_WA_PHONE || "34600000000"
}: OpenWhatsAppParams)
\`\`\`

**Parámetros**:
- `orderId`: ID único del pedido
- `total`: Total del pedido (incluyendo propina)
- `tip`: Monto de la propina
- `itemNotes`: Notas especiales de los items
- `phone`: Número de teléfono (opcional, usa variable de entorno por defecto)

**URL generada**:
\`\`\`
https://api.whatsapp.com/send?phone={numero}&text={mensaje_codificado}
\`\`\`

### Función `openWhatsAppInfo()` (`components/menu-browser.tsx`)
\`\`\`typescript
const openWhatsAppInfo = (dish: MenuDish) => {
  const message = `${t("needMoreInfoAbout")}${dish.name}, ${dish.description} y Alérgenos ${allergensList}`
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
  window.open(whatsappUrl, "_blank")
}
\`\`\`

**URL generada**:
\`\`\`
https://wa.me/?text={mensaje_codificado}
\`\`\`

## Traducciones

Las traducciones para los mensajes de WhatsApp están en `lib/i18n.ts`:

- `needMoreInfoAbout` - "Necesito más información sobre: " (ES, EN, DE, FR, ZH)
- `whatsappOpened` - "WhatsApp se abrirá automáticamente"
- `whatsappWillOpen` - "WhatsApp se abrirá para confirmar el pedido"

## Casos de Uso

### Restaurante con servicio completo
- Activar ambas funcionalidades
- Los clientes pueden consultar sobre platos y enviar pedidos

### Restaurante solo con consultas
- Activar solo `NEXT_PUBLIC_WA_ENABLE_DISH_INFO`
- Los clientes pueden preguntar sobre platos, pero no enviar pedidos por WhatsApp

### Restaurante sin WhatsApp
- Desactivar ambas funcionalidades
- La aplicación funciona normalmente sin integración de WhatsApp

## Notas Importantes

1. **Número de teléfono**: Debe estar en formato internacional sin `+` ni espacios
2. **Variables públicas**: Todas las variables usan el prefijo `NEXT_PUBLIC_` para estar disponibles en el cliente
3. **Valores por defecto**: Si no se especifica, las funcionalidades están activadas por defecto
4. **Compatibilidad**: Funciona en dispositivos móviles y escritorio (abre WhatsApp Web en escritorio)
5. **Manejo de errores**: Si falla `window.open()`, usa `window.location.href` como fallback
