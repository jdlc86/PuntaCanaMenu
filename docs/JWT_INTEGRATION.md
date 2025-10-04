# JWT Integration for Table Authentication

## Overview

This system implements JWT-based authentication for restaurant tables using signed payloads from a Cloudflare Worker.

## Architecture

### Flow

1. **QR Code Generation** (Cloudflare Worker)
   - Worker generates a JWT token with table information
   - Token contains: `table_id`, `order_type`, `iat`, `exp`
   - Token is signed using HMAC SHA-256
   - QR code contains URL with token: `https://app.com?token=JWT_TOKEN`

2. **Token Validation** (Next.js App)
   - User scans QR code and opens app with token
   - `TableProvider` extracts token from URL
   - Token is validated via `/api/validate-token`
   - Valid tokens are stored in `sessionStorage`

3. **Authenticated Requests**
   - All orders include token in Authorization header
   - Service requests (call waiter, request bill) validate token
   - Backend verifies token signature and expiration

## Token Structure

\`\`\`json
{
  "table_id": "12",
  "order_type": "R",
  "iat": 1704067200,
  "exp": 1704153600
}
\`\`\`

### Fields

- `table_id`: String identifier for the table
- `order_type`: One of "R" (Restaurant), "O" (Online), "C" (Camarero/Waiter)
  - **R**: Access from restaurant (customer scans QR at table)
  - **O**: Access through online gateway (delivery/takeaway orders)
  - **C**: Access by waiter (staff placing order on behalf of customer)
- `iat`: Issued at timestamp (Unix epoch)
- `exp`: Expiration timestamp (Unix epoch)

## Order Number Format

Order numbers are automatically generated with a prefix based on the `order_type`:

- **R-{timestamp}-{random}**: Restaurant orders (e.g., `R-1704067200-123`)
- **O-{timestamp}-{random}**: Online orders (e.g., `O-1704067200-456`)
- **C-{timestamp}-{random}**: Waiter orders (e.g., `C-1704067200-789`)

This prefix system allows easy identification and filtering of orders by type.

## Implementation

### Environment Variables

\`\`\`bash
# Required for production (SERVER-SIDE ONLY)
JWT_SECRET=your-secret-key-here

# Optional: Control whether JWT is required (default: false for development)
NEXT_PUBLIC_REQUIRE_JWT=false  # Set to "true" in production
\`\`\`

**SECURITY WARNING**: Never use `NEXT_PUBLIC_JWT_SECRET`. The JWT secret must NEVER be exposed to the client. All JWT validation happens server-side only.

### Development Mode

When `NEXT_PUBLIC_REQUIRE_JWT` is not set to "true", the app runs in development mode:

- **No token required**: Access the app directly without a JWT token
- **URL parameters**: Set table and order type via URL
  - `?mesa=12` or `?table=12` - Set table number
  - `&type=R` - Set order type (R, O, or C)
  - Example: `http://localhost:3000?mesa=5&type=R`
- **Default values**: If no parameters provided, defaults to table "1" and type "R"
- **Warnings logged**: Console shows when running in development mode

**Production Setup**: Set `NEXT_PUBLIC_REQUIRE_JWT=true` to enforce JWT validation.

### Client-Side Usage

\`\`\`typescript
import { useTable } from "@/lib/table-context"

function MyComponent() {
  const { tableNumber, orderType, token, isValidated, isLoading, error } = useTable()
  
  // tableNumber: "12"
  // orderType: "R" | "O" | "C"
  // token: "eyJhbGc..." (null in dev mode)
  // isValidated: true (always true in dev mode, validated in production)
  // isLoading: false when ready
  // error: null if no errors
}
\`\`\`

### API Validation

\`\`\`typescript
import { extractToken, validateTableToken } from "@/lib/jwt"

export async function POST(request: Request) {
  const token = extractToken(request)
  const validation = await validateTableToken(token)
  
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 401 })
  }
  
  // Process authenticated request
  const { table_id, order_type } = validation.payload
  
  // Generate order number with correct prefix
  const orderId = generateOrderNumber(order_type)
}
\`\`\`

## Security Considerations

1. **Secret Management**
   - Use strong, randomly generated secrets
   - Never commit secrets to version control
   - **NEVER expose JWT_SECRET to the client** (no NEXT_PUBLIC_ prefix)
   - Rotate secrets periodically

2. **Token Expiration**
   - Set reasonable expiration times (e.g., 24 hours)
   - Implement token refresh if needed

3. **HTTPS Only**
   - Always use HTTPS in production
   - Tokens should never be transmitted over HTTP

4. **Validation**
   - Always validate signature server-side
   - Check expiration time
   - Verify table number matches token
   - Reject modified tokens immediately

5. **Development vs Production**
   - Development: Set `NEXT_PUBLIC_REQUIRE_JWT=false` or leave unset
   - Production: Set `NEXT_PUBLIC_REQUIRE_JWT=true` to enforce JWT validation
   - Never deploy to production without JWT validation enabled

## Production Deployment

1. Generate secure JWT secret:
   \`\`\`bash
   openssl rand -base64 32
   \`\`\`

2. Add to Vercel environment variables:
   - `JWT_SECRET`: Your generated secret (server-side only)
   - `NEXT_PUBLIC_REQUIRE_JWT`: Set to `true`

3. Configure Cloudflare Worker with same secret

4. Test token generation and validation

## Troubleshooting

### Token Validation Fails

- Check JWT_SECRET matches between Worker and App
- Verify token hasn't expired
- Ensure token format is correct (3 parts separated by dots)
- Check for clock skew between systems
- Verify JWT_SECRET is set (not NEXT_PUBLIC_JWT_SECRET)

### Development Mode Issues

- If app shows "No token provided" error, check `NEXT_PUBLIC_REQUIRE_JWT` is not set to "true"
- Use URL parameters: `?mesa=1&type=R` to set table in development
- Check browser console for development mode logs

### Orders Not Authenticated

- Verify token is stored in sessionStorage
- Check Authorization header is sent
- Review browser console for errors
- Ensure CORS is configured correctly
- In production, verify `NEXT_PUBLIC_REQUIRE_JWT=true` is set

## Cloudflare Worker Example

\`\`\`typescript
// Example Cloudflare Worker for generating tokens
import { SignJWT } from 'jose'

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url)
    const tableId = url.searchParams.get('table')
    const orderType = url.searchParams.get('type') || 'R' // Default to Restaurant
    
    if (!tableId) {
      return new Response('Table ID required', { status: 400 })
    }
    
    // Validate order type
    if (!['R', 'O', 'C'].includes(orderType)) {
      return new Response('Invalid order type. Must be R, O, or C', { status: 400 })
    }
    
    const secret = new TextEncoder().encode(env.JWT_SECRET)
    const token = await new SignJWT({
      table_id: tableId,
      order_type: orderType, // "R", "O", or "C"
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400 // 24 hours
    })
      .setProtectedHeader({ alg: 'HS256' })
      .sign(secret)
    
    const appUrl = `https://your-app.vercel.app?token=${token}`
    
    // Generate QR code with appUrl
    // Return QR code image or redirect
  }
}
\`\`\`

## Future Enhancements

- [ ] Token refresh mechanism
- [ ] Multi-table support (group orders)
- [ ] Staff authentication tokens
- [ ] Token revocation list
- [ ] Rate limiting per table
