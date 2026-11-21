# VizTR Telegram Bot — Phase 1 Repository Audit Report

## Executive Summary
This audit examines the existing VizTR repository (Next.js 15.5.29, React 19.3.1, TypeScript) to integrate a production-ready Telegram Bot (@Viztr_bot) while preserving the existing application architecture. The repository is deployed on **Vercel** (not Cloudflare as referenced in AGENTS.md), with Supabase PostgreSQL backend.

---

## 1. Repository Architecture Findings

### 1.1 Technology Stack
| Component | Version/Details |
|-----------|----------------|
| **Framework** | Next.js 15.5.29 (App Router) |
| **React** | 19.3.1 |
| **TypeScript** | 6.0.3 |
| **Database** | Supabase PostgreSQL (project: `naludjmicbqcagrlsrba.supabase.co`) |
| **Authentication** | NextAuth.js 4.24.15 |
| **Rate Limiting** | Upstash Redis (`@upstash/ratelimit`, `@upstash/redis`) with in-memory fallback |
| **Deployment** | **Vercel** (production: `https://viztr.vercel.app`) |
| **AI/ML** | Google GenAI (`@google/genai`), OpenRouter, OpenAI fallbacks |

### 1.2 Existing Telegram Infrastructure (Partial)
**File: `app/api/messaging/telegram/route.ts`**
- Webhook endpoint at `/api/messaging/telegram`
- Secret token verification via `TELEGRAM_WEBHOOK_SECRET`
- Parses incoming messages via `lib/messaging/providers.ts`
- AI-powered responses via `lib/messaging/viztr-agent.ts`
- Supports `/resolve` operator command for escalation tickets

**File: `lib/messaging/providers.ts`**
- `MessagingAdapter` interface with `parseWebhook` and `sendTextReply`
- `telegramAdapter` implements `sendMessage` via Telegram Bot API
- Only handles `message` updates (no `callback_query`, `edited_message`, etc.)

**File: `lib/messaging/viztr-agent.ts`**
- RAG-based agent with knowledge base search
- Multi-provider AI fallback (Gemini → OpenRouter → OpenAI)
- Human escalation ticket creation
- Not command-based; free-text conversational

### 1.3 Existing Public Data Sources (Reusable for Bot)
| Source | Location | Content |
|--------|----------|---------|
| **Services** | `app/api/services/route.ts` | 3 services: CGI Renders, WebXR, Animation |
| **Portfolio** | `data/portfolio.ts` | 6 projects with categories: exterior, interior, walkthrough, xr, 360 |
| **About** | `app/about/page.tsx` | Brand identity, pillars, leadership, global hubs |
| **Contact** | `app/contact/page.tsx` | Verified emails, phones, office locations |
| **Privacy Policy** | `app/privacy/page.tsx` | Full policy at `/privacy-policy` |

### 1.4 Environment Configuration
**File: `.env.example`** — Already includes:
```bash
TELEGRAM_BOT_TOKEN=
TELEGRAM_WEBHOOK_SECRET=
```
**Missing from `.env.example`** (required per spec):
- `TELEGRAM_BOT_USERNAME` (= `Viztr_bot`)
- `NEXT_PUBLIC_SITE_URL` (= `https://viztr.in`)

### 1.5 Security Infrastructure
- **Rate Limiting**: `lib/rate-limit.ts` — Upstash Redis with sliding window, in-memory dev fallback
- **Middleware**: `middleware.ts` — Protects `/api/*` (30 req/min anon, 100 auth), `/admin/*`, `/client-dashboard/*`
- **Supabase Clients**: `lib/supabase.ts` (anon), `lib/supabase-admin.ts` (service role, server-only)
- **API Guard**: `app/api-guard.ts` — Role-based auth for admin APIs

---

## 2. Cloudflare Compatibility Assessment

### ⚠️ Critical Finding: Deployment Target Mismatch
**AGENTS.md references Cloudflare**, but **actual deployment is Vercel** (confirmed by `vercel.json`, `DEPLOYMENT.md`, production URL `https://viztr.vercel.app`).

| Aspect | AGENTS.md Expectation | Actual State |
|--------|----------------------|--------------|
| **Hosting** | Cloudflare Workers/Pages | **Vercel** |
| **Wrangler Config** | Expected | **Not present** |
| **OpenNext/vinext** | Referenced | **Not used** |
| **Edge Runtime** | Assumed | **Node.js runtime** (Next.js default) |
| **Bot Webhook URL** | `https://viztr.in/api/telegram/webhook` | **Domain `viztr.in` not yet configured on Vercel** |

### Implications for Telegram Integration
1. **Webhook URL**: Must use Vercel deployment URL (`https://viztr.vercel.app/api/telegram/webhook`) until custom domain `viztr.in` is configured on Vercel
2. **Runtime**: Standard Node.js runtime — no Edge/Workers compatibility issues
3. **Environment Variables**: Set in Vercel dashboard (not Cloudflare secrets)
4. **Rate Limiting**: Upstash Redis works on Vercel (already configured)

### Recommendation
**Proceed with Vercel-compatible implementation**. Document the domain discrepancy. When `viztr.in` is pointed to Vercel, update webhook registration.

---

## 3. Telegram Bot Integration Design

### 3.1 Required New Endpoint
Per spec: `https://viztr.in/api/telegram/webhook` (production)  
**Implementation**: Create `app/api/telegram/webhook/route.ts`  
**Note**: Existing endpoint at `/api/messaging/telegram` is for AI agent; new endpoint is for command-based bot.

### 3.2 Architecture Components

```
┌─────────────────────────────────────────────────────────────┐
│                    TELEGRAM BOT ARCHITECTURE                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Telegram API ──► /api/telegram/webhook (POST)              │
│       │                    │                                 │
│       │                    ▼                                 │
│       │            ┌───────────────┐                         │
│       │            │  Validation   │  ◄── X-Telegram-Bot-Api-Secret-Token
│       │            │  (secret,     │       update_id dedup
│       │            │   schema,     │       HMAC validation
│       │            │   method)     │
│       │            └───────┬───────┘                         │
│       │                    │                                 │
│       │                    ▼                                 │
│       │            ┌───────────────┐                         │
│       │            │  Router       │  ◄── CommandRegistry
│       │            │  (command/    │       CallbackQueryHandler
│       │            │   callback)   │
│       │            └───────┬───────┘                         │
│       │                    │                                 │
│       │       ┌────────────┼────────────┐                    │
│       │       ▼            ▼            ▼                    │
│       │  ┌────────┐  ┌──────────┐  ┌─────────┐              │
│       │  │Commands│  │Callbacks │  │Services │  (reusable)  │
│       │  │Handler │  │Handler   │  │Portfolio│              │
│       │  └────────┘  └──────────┘  └─────────┘              │
│       │                    │                                 │
│       │                    ▼                                 │
│       │            ┌───────────────┐                         │
│       │            │ TelegramClient│  ◄── Centralized API client
│       │            │ (typed,       │       sendMessage,
│       │            │  retry,       │       editMessageText,
│       │            │  error handling)      answerCallbackQuery,
│       │            └───────────────┘       setMyCommands,
│       │                                     getMe, setWebhook
│       └──────────────────────────────────────┘
```

### 3.3 Command Specifications

| Command | Description | Action |
|---------|-------------|--------|
| `/start` | Welcome + Main Menu | Interactive inline keyboard (4 rows) |
| `/help` | Command reference | List all commands with descriptions |
| `/about` | Brand description | Static content from website |
| `/services` | Service categories | Interactive navigation (Studio / XR World) |
| `/portfolio` | Portfolio categories | Categories with project counts/links |
| `/website` | Open website | URL button → `https://viztr.in` |
| `/channel` | Telegram channel | Disabled (not configured) |
| `/community` | WhatsApp links | Shows Channel + Community URLs |
| `/contact` | Contact details | Verified info from website |
| `/support` | Support instructions | Same as contact + escalation info |
| `/privacy` | Privacy policy | Link to `/privacy-policy` or content |

### 3.4 Inline Keyboard — `/start` Main Menu
```
ROW 1: [About VizTR] [Our Services]        (callback_data: "about", "services")
ROW 2: [Portfolio] [Get a Quote]            (callback_data: "portfolio", "quote")
ROW 3: [Website] [Contact]                  (url: "https://viztr.in", callback: "contact")
ROW 4: [WhatsApp Channel] [WhatsApp Community] (url buttons)
```

### 3.5 Security Requirements
- ✅ Webhook secret verification (`X-Telegram-Bot-Api-Secret-Token`)
- ✅ HTTP method validation (POST only)
- ✅ Update deduplication (track `update_id` in-memory with TTL)
- ✅ Rate limiting (reuse `lib/rate-limit.ts`)
- ✅ Input validation (Zod schemas for Update, Message, CallbackQuery)
- ✅ Safe message formatting (escape HTML/Markdown)
- ✅ No credential logging
- ✅ Telegram API error handling with retry

---

## 4. Implementation Plan (Phased)

### Phase 1A: Core Infrastructure (Files to Create)
| File | Purpose |
|------|---------|
| `lib/telegram/types.ts` | Typed Telegram Bot API structures (Update, Message, CallbackQuery, etc.) |
| `lib/telegram/client.ts` | Centralized Telegram API client with retry/error handling |
| `lib/telegram/validation.ts` | Zod schemas + validation helpers |
| `lib/telegram/deduplication.ts` | In-memory update_id deduplication with TTL |
| `app/api/telegram/webhook/route.ts` | Secure webhook endpoint |

### Phase 1B: Command System (Files to Create)
| File | Purpose |
|------|---------|
| `lib/telegram/commands/registry.ts` | Command registration + metadata for `setMyCommands` |
| `lib/telegram/commands/handlers.ts` | All command implementations |
| `lib/telegram/keyboards.ts` | Inline keyboard builders |
| `lib/telegram/callbacks.ts` | Callback query router + handlers |

### Phase 1C: Content Integration (Files to Modify)
| File | Change |
|------|--------|
| `.env.example` | Add `TELEGRAM_BOT_USERNAME`, `NEXT_PUBLIC_SITE_URL` |
| `lib/telegram/content.ts` | Static content exported from existing website data |

### Phase 1D: Configuration & Testing
| Task | Details |
|------|---------|
| Register commands | Call `setMyCommands` via Telegram API on startup |
| Type check | `pnpm exec tsc --noEmit` (scoped to new files) |
| Production build | `pnpm run build` (via safe-build.ps1) |
| Local webhook test | ngrok + Telegram webhook registration |

---

## 5. Files to Create (Summary)

### New Files (~12)
```
lib/telegram/
├── types.ts                    # Telegram API TypeScript interfaces
├── client.ts                   # Centralized API client
├── validation.ts               # Zod schemas & validators
├── deduplication.ts            # Update ID deduplication
├── keyboards.ts                # Inline keyboard builders
├── callbacks.ts                # Callback query handlers
├── commands/
│   ├── registry.ts             # Command definitions + metadata
│   └── handlers.ts             # Command implementations
├── content.ts                  # Static content (about, services, portfolio, contact)
└── index.ts                    # Barrel export

app/api/telegram/webhook/
└── route.ts                    # Secure webhook endpoint
```

### Modified Files (~2)
```
.env.example                    # Add missing env vars
```

---

## 6. Risk Assessment & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Domain mismatch** (`viztr.in` not on Vercel) | High | Medium | Use Vercel URL for webhook initially; document switch |
| **Existing `/api/messaging/telegram` conflict** | Low | Low | Different path; no conflict |
| **Rate limiting on webhook** | Medium | Medium | Exclude webhook from middleware matcher; apply internal rate limit |
| **Duplicate update processing** | Medium | High | In-memory deduplication with 24h TTL |
| **Telegram API failures** | Medium | Medium | Exponential backoff retry in client; graceful degradation |
| **Vercel cold starts** | Low | Low | Webhook responds < 1s; no long-running operations |

---

## 7. Verification Checklist (Pre-Deployment)

- [ ] TypeScript compiles without new errors on created files
- [ ] Production build succeeds (`pnpm run build`)
- [ ] Webhook responds 200 OK to Telegram test update
- [ ] All 11 commands return expected responses
- [ ] Inline keyboard navigation works (callbacks handled)
- [ ] External URL buttons open correct links
- [ ] Webhook secret verification rejects invalid tokens
- [ ] Duplicate `update_id` returns 200 without reprocessing
- [ ] Rate limiting allows normal usage, blocks abuse
- [ ] No secrets in client bundles or logs
- [ ] Environment variables validated at startup

---

## 8. Rollback Instructions

If issues arise post-deployment:
1. **Remove webhook**: `curl -X POST "https://api.telegram.org/bot<TOKEN>/deleteWebhook"`
2. **Revert code**: `git revert <commit-hash>` for Telegram bot files
3. **Redeploy**: `vercel --prod` (previous deployment auto-available in Vercel)
4. **No database migrations** — Phase 1 requires zero schema changes

---

## 9. Outstanding Dependencies (Require User Action)

| Item | Status | Action Required |
|------|--------|-----------------|
| `TELEGRAM_BOT_TOKEN` | ❌ Missing | Create bot via @BotFather, add to Vercel env |
| `TELEGRAM_WEBHOOK_SECRET` | ❌ Missing | Generate secure random string, add to Vercel env |
| `TELEGRAM_BOT_USERNAME` | ❌ Missing | Verify `@Viztr_bot` is the actual username |
| `NEXT_PUBLIC_SITE_URL` | ❌ Missing | Set to `https://viztr.in` (or Vercel URL temporarily) |
| Custom domain `viztr.in` | ⚠️ Not on Vercel | Configure in Vercel dashboard when ready |
| Telegram Channel URL | ⚠️ Not provided | Spec says "keep disabled until configured" |

---

*Report generated: 2026-11-18*  
*Repository: VizTR (Next.js 15, Vercel, Supabase)*  
*Audit scope: Phase 1 Telegram Bot Integration*