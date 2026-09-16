# Environment Variables Documentation

This document lists all environment variables required for the VizTR Studio application.

## Table of Contents
- [Authentication](#authentication)
- [Database](#database)
- [Storage](#storage)
- [Third-Party Services](#third-party-services)
- [Analytics](#analytics)
- [Feature Flags](#feature-flags)
- [Application](#application)

## Authentication

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NEXTAUTH_URL` | The canonical URL of your site (e.g., `https://viztr.com`) | Yes | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Secret key for signing NextAuth JWTs. Use a strong random string. | Yes | - |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID for Google Workspace SSO | No | - |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | No | - |
| `CLIENT_PORTAL_SECRET` | Secret for client portal JWT tokens | No | `dev-client-portal-secret-change-in-production` |

## Database

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string (Supabase or direct) | Yes | - |
| `SUPABASE_URL` | Supabase project URL | Yes | - |
| `SUPABASE_ANON_KEY` | Supabase anonymous/public key | Yes | - |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) | Yes | - |

## Storage

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `SUPABASE_STORAGE_BUCKET` | Default Supabase Storage bucket name | No | `viztr-assets` |
| `AWS_S3_BUCKET` | AWS S3 bucket for asset storage | No | - |
| `AWS_S3_REGION` | AWS S3 region | No | `us-east-1` |
| `AWS_ACCESS_KEY_ID` | AWS access key | No | - |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | No | - |
| `CLOUDFLARE_R2_ACCOUNT_ID` | Cloudflare R2 account ID | No | - |
| `CLOUDFLARE_R2_ACCESS_KEY_ID` | Cloudflare R2 access key | No | - |
| `CLOUDFLARE_R2_SECRET_ACCESS_KEY` | Cloudflare R2 secret key | No | - |
| `GOOGLE_DRIVE_CLIENT_ID` | Google Drive API client ID | No | - |
| `GOOGLE_DRIVE_CLIENT_SECRET` | Google Drive API client secret | No | - |

## Third-Party Services

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `OPENAI_API_KEY` | OpenAI API key for AI features | No | - |
| `ANTHROPIC_API_KEY` | Anthropic Claude API key | No | - |
| `GOOGLE_GEMINI_API_KEY` | Google Gemini API key | No | - |
| `GITHUB_TOKEN` | GitHub token for repository integrations | No | - |
| `SENDGRID_API_KEY` | SendGrid API key for email notifications | No | - |
| `RESEND_API_KEY` | Resend API key for email notifications | No | - |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL for rate limiting | No | - |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token | No | - |
| `PUSHER_APP_ID` | Pusher app ID for real-time features | No | - |
| `PUSHER_APP_KEY` | Pusher app key | No | - |
| `PUSHER_APP_SECRET` | Pusher app secret | No | - |

## Analytics

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics 4 measurement ID (e.g., `G-XXXXXXXXXX`) | No | - |

## Feature Flags

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_FEATURE_SUPER_ADMIN_CONSOLIDATION` | Enable consolidated Super Admin dashboard | No | `false` |
| `NEXT_PUBLIC_FEATURE_XR_WORLD` | Enable XR World features | No | `false` |
| `NEXT_PUBLIC_FEATURE_BOOKING_SYSTEM` | Enable booking system | No | `false` |
| `NEXT_PUBLIC_FEATURE_CONTACT_FORM` | Enable contact form | No | `false` |
| `NEXT_PUBLIC_FEATURE_CLIENT_PORTAL` | Enable client portal | No | `false` |

## Application

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment mode (`development`, `production`, `test`) | Yes | `development` |
| `NEXT_PUBLIC_APP_URL` | Public application URL | No | `http://localhost:3000` |
| `NEXT_PUBLIC_API_URL` | Public API URL | No | `http://localhost:3000` |
| `UPLOADTHING_SECRET` | UploadThing secret key | No | - |
| `UPLOADTHING_APP_ID` | UploadThing app ID | No | - |

## Setup Instructions

1. Copy `.env.example` to `.env.local` for development
2. Copy `.env.example` to `.env.production` for production
3. Never commit `.env` files to version control
4. Use strong, randomly generated secrets for all authentication keys
5. Rotate secrets regularly in production

## Security Notes

- `SUPABASE_SERVICE_ROLE_KEY` and other server-only keys must never be exposed to the client
- Use `NEXT_PUBLIC_` prefix only for variables that are safe to expose to the browser
- Store production secrets in your deployment platform's environment variable manager (Vercel, Netlify, etc.)
