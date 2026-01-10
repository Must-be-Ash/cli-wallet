# Security Guidelines

## API Security

### CORS Configuration

The API is configured to allow cross-origin requests from any domain. This is necessary for the CLI tool to function properly. CORS headers are set in `next.config.ts`:

- `Access-Control-Allow-Origin: *` - Allows requests from any origin
- `Access-Control-Allow-Methods: GET, POST, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type, Authorization`

### Request Validation

Request validation is handled in `middleware.ts`:

- Only GET and POST methods are allowed
- OPTIONS requests are handled for CORS preflight
- All API requests are logged with method, path, and IP address
- Suspicious user agents are flagged

### Rate Limiting

**✓ Implemented:** Rate limiting is active for all wallet creation endpoints.

**Limits:**
- **20 wallets per IP address per 24 hours**
- Applies to both EOA and Smart Account creation endpoints
- Resets automatically after 24 hours

**Implementation:**
- Uses Redis (via Vercel Marketplace)
- IP-based rate limiting via `X-Forwarded-For` header
- Returns HTTP 429 (Too Many Requests) when limit exceeded
- Includes helpful error messages with reset time
- Fail-open design: allows requests if Redis is unavailable

**Rate Limit Headers:**
When rate limit is exceeded, the API returns these headers:
```
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 20
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1736478939000
Retry-After: 3600
```

**Error Response:**
```json
{
  "success": false,
  "error": "Rate limit exceeded. You can create up to 20 wallets per day.",
  "details": {
    "limit": 20,
    "window": "24 hours",
    "resetIn": "5 hours and 30 minutes"
  }
}
```

**Setting Up Redis:**
1. Go to your Vercel project dashboard → Storage tab
2. Click "Create Database" → Select Redis from Marketplace
3. Connect Redis to your project (automatically adds `REDIS_URL` environment variable)
4. Redeploy your application
5. See [Vercel Redis Documentation](https://vercel.com/docs/storage/vercel-redis)

**Note:** Vercel KV has been sunset and replaced with Redis via Vercel Marketplace.

### API Key Authentication (Optional)

For production use, consider adding API key authentication:

1. Generate API keys for authorized clients
2. Store keys in environment variables or a database
3. Validate API key in middleware before processing requests
4. Return 401 Unauthorized for invalid/missing keys

Example implementation:

```typescript
// In middleware.ts
const apiKey = request.headers.get('X-API-Key');
const validKeys = process.env.API_KEYS?.split(',') || [];

if (!validKeys.includes(apiKey)) {
  return NextResponse.json(
    { success: false, error: 'Invalid API key' },
    { status: 401 }
  );
}
```

## Environment Variables Security

### Never Commit Secrets

- `.env` files are in `.gitignore` and should never be committed
- Use Vercel environment variables for production
- Rotate CDP API keys if compromised

### Required Permissions

Your CDP API Key must have these scopes:
- `accounts#create` - Create new wallet accounts
- `accounts#export` - Export private keys
- `accounts#read` - Read account information

### Key Rotation

Rotate your CDP API credentials regularly:
1. Generate new API keys in CDP Portal
2. Update environment variables in Vercel
3. Redeploy the application
4. Delete old API keys from CDP Portal

## Monitoring and Logging

### Request Logging

All API requests are logged with:
- HTTP method
- Request path
- Client IP address (when available)
- Timestamp

Example log:
```
[API] POST /api/wallet/eoa - 192.168.1.1
```

### Error Logging

Errors are logged with context:
- Error message
- Stack trace (in development)
- Request details

### Production Monitoring

For production deployments, integrate with monitoring services:

1. **Vercel Analytics**
   - Built-in monitoring for Vercel deployments
   - View request metrics and errors

2. **Sentry** (Recommended)
   - Error tracking and performance monitoring
   - Set up alerts for critical errors

3. **Datadog** or **New Relic**
   - Comprehensive application monitoring
   - Custom dashboards and alerts

## Security Best Practices

### 1. Input Validation

All user inputs are validated:
- Request method validation in middleware
- JSON parsing with try-catch blocks
- Type checking with TypeScript

### 2. Error Handling

Errors are handled gracefully:
- Generic error messages to clients (don't leak implementation details)
- Detailed errors logged server-side
- Appropriate HTTP status codes

### 3. HTTPS Only

- Always use HTTPS in production
- Vercel automatically provides SSL certificates
- Never expose API keys in URLs or query parameters

### 4. Content Security

Security headers are configured:
- `X-Content-Type-Options: nosniff` - Prevent MIME type sniffing
- `X-Frame-Options: DENY` - Prevent clickjacking
- `X-XSS-Protection: 1; mode=block` - XSS protection
- `Referrer-Policy: strict-origin-when-cross-origin` - Control referrer information

## Incident Response

If you suspect a security incident:

1. **Immediately rotate API keys**
   - CDP API keys in CDP Portal
   - Any other compromised credentials

2. **Review logs**
   - Check Vercel logs for suspicious activity
   - Look for unusual request patterns

3. **Update dependencies**
   - Run `npm audit` to check for vulnerabilities
   - Update packages with `npm update`

4. **Notify users** (if applicable)
   - If user data is compromised
   - Provide clear instructions for security

## Reporting Security Issues

If you discover a security vulnerability:

1. **Do not** open a public GitHub issue
2. Email security concerns to the maintainer
3. Include details of the vulnerability
4. Allow time for a fix before public disclosure

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Vercel Security Best Practices](https://vercel.com/docs/security)
- [Next.js Security Headers](https://nextjs.org/docs/app/api-reference/next-config-js/headers)
- [CDP Security Documentation](https://docs.cdp.coinbase.com/wallet-api/docs/security)
