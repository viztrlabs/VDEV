# VizTR Telegram Bot — Phase 1 Deployment Instructions

## Summary

Successfully implemented a production-ready Telegram Bot (@Viztr_bot) with 11 commands, inline keyboard navigation, secure webhook endpoint, and comprehensive test coverage.

---

## Files Created (13 new files)

### Core Library (`lib/telegram/`)
| File | Purpose |
|------|---------|
| `types.ts` | Telegram Bot API TypeScript interfaces |
| `validation.ts` | Zod schemas for Update, Message, CallbackQuery validation |
| `config.ts` | Environment variable validation |
| `client.ts` | Centralized Telegram API client with retry logic |
| `deduplication.ts` | In-memory update_id deduplication with 24h TTL |
| `keyboards.ts` | Inline keyboard builders (main menu, services, portfolio, etc.) |
| `callbacks.ts` | Callback query router and handlers |
| `content.ts` | Static content from website (about, services, portfolio, contact) |
| `commands/registry.ts` | Command definitions + metadata for `setMyCommands` |
| `commands/handlers.ts` | All 11 command implementations |
| `index.ts` | Barrel export |

### API Route
| File | Purpose |
|------|---------|
| `app/api/telegram/webhook/route.ts` | Secure webhook endpoint (POST only) |

### Scripts
| File | Purpose |
|------|---------|
| `scripts/register-telegram-commands.ts` | Register bot commands via Telegram API |

### Tests (9 test suites, 122 tests)
| File | Tests |
|------|-------|
| `lib/telegram/__tests__/config.test.ts` | 6 |
| `lib/telegram/__tests__/deduplication.test.ts` | 8 |
| `lib/telegram/__tests__/validation.test.ts` | 24 |
| `lib/telegram/__tests__/client.test.ts` | 13 |
| `lib/telegram/__tests__/keyboards.test.ts` | 19 |
| `lib/telegram/__tests__/content.test.ts` | 17 |
| `lib/telegram/commands/__tests__/registry.test.ts` | 10 |
| `lib/telegram/commands/__tests__/handlers.test.ts` | 12 |
| `lib/telegram/__tests__/callbacks.test.ts` | 13 |

### Files Modified (2)
| File | Change |
|------|--------|
| `.env.example` | Added `TELEGRAM_BOT_USERNAME=Viztr_bot` and `NEXT_PUBLIC_SITE_URL=https://viztr.in` |
| `package.json` | Added `telegram:register-commands` script |

---

## Commands Implemented (11/11)

| Command | Description | Status |
|---------|-------------|--------|
| `/start` | Welcome + Main Menu (4-row inline keyboard) | ✅ Tested |
| `/help` | Command reference | ✅ Tested |
| `/about` | Brand description (Visualize ✦ Experience ✦ Transform) | ✅ Tested |
| `/services` | Studio (3) + XR World (6) categories | ✅ Tested |
| `/portfolio` | 5 categories with project counts | ✅ Tested |
| `/website` | URL button → viztr.in | ✅ Tested |
| `/channel` | "Not configured" notice | ✅ Tested |
| `/community` | WhatsApp Channel + Community URLs | ✅ Tested |
| `/contact` | Verified email, phones, addresses | ✅ Tested |
| `/support` | Support instructions + enquiry link | ✅ Tested |
| `/privacy` | Link to `/privacy-policy` | ✅ Tested |

---

## Security Features Implemented

| Feature | Implementation |
|---------|----------------|
| Webhook secret verification | Checks `secret_token` query param AND `X-Telegram-Bot-Api-Secret-Token` header |
| Update deduplication | In-memory `Map<update_id, expiry>` with 24h TTL |
| Rate limiting | Reuses existing `lib/rate-limit.ts` (30 req/min anonymous) |
| Input validation | Zod schemas for Update, Message, CallbackQuery |
| Safe message formatting | HTML escaping, 4096 char limit enforcement |
| No credential logging | Token sanitized in errors, never logged |
| Telegram API error handling | Exponential backoff retry (3 attempts), graceful degradation |
| HTTP method validation | Only POST allowed (405 for others) |

---

## Environment Variables Required

Add to Vercel project settings:

| Variable | Value | Required |
|----------|-------|----------|
| `TELEGRAM_BOT_TOKEN` | From @BotFather | ✅ Yes |
| `TELEGRAM_WEBHOOK_SECRET` | Generate: `openssl rand -hex 32` | ✅ Yes |
| `TELEGRAM_BOT_USERNAME` | `Viztr_bot` | ✅ Yes |
| `NEXT_PUBLIC_SITE_URL` | `https://viztr.in` (or Vercel URL) | ✅ Yes |

---

## Deployment Steps

### 1. Create Bot & Get Token
```bash
# Talk to @BotFather on Telegram
/newbot
# Name: VizTR
# Username: Viztr_bot
# Copy the token
```

### 2. Generate Webhook Secret
```bash
openssl rand -hex 32
# Copy the output
```

### 3. Set Environment Variables in Vercel
Go to Vercel Dashboard → Project → Settings → Environment Variables
Add all 4 variables (Production environment)

### 4. Deploy
```bash
# Push to main branch
git add .
git commit -m "feat: Telegram Bot Phase 1"
git push origin main
# Vercel auto-deploys
```

### 5. Register Webhook
After deployment, get the Vercel URL (e.g., `https://viztr.vercel.app`):

```bash
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
  -d "url=https://viztr.vercel.app/api/telegram/webhook" \
  -d "secret_token=<SECRET>"
```

### 6. Register Commands
```bash
# Set env vars locally or use Vercel CLI
pnpm run telegram:register-commands
```

### 7. Test in Telegram
Open @Viztr_bot and test all commands:
- `/start` → Shows main menu
- Navigate all inline buttons
- Verify all 11 commands work

---

## Webhook URLs

| Environment | URL |
|-------------|-----|
| Production | `https://viztr.vercel.app/api/telegram/webhook` |
| Custom Domain (when ready) | `https://viztr.in/api/telegram/webhook` |
| Local (ngrok) | `https://<ngrok-id>.ngrok-free.app/api/telegram/webhook` |

---

## Rollback Instructions

If issues arise:

1. **Remove webhook:**
   ```bash
   curl -X POST "https://api.telegram.org/bot<TOKEN>/deleteWebhook"
   ```

2. **Revert code:**
   ```bash
   git revert <commit-hash>
   ```

3. **Redeploy:**
   ```bash
   git push origin main
   ```

4. **No database migrations** — Phase 1 requires zero schema changes.

---

## Testing Checklist

- [ ] `/start` shows welcome with 4-row inline keyboard
- [ ] `/help` lists all 11 commands
- [ ] `/about` shows brand tagline
- [ ] `/services` → Studio → shows 3 services
- [ ] `/services` → XR World → shows 6 services
- [ ] `/portfolio` shows 5 categories with counts
- [ ] `/website` shows URL button to viztr.in
- [ ] `/channel` shows "not configured"
- [ ] `/community` shows both WhatsApp URLs
- [ ] `/contact` shows verified email/phones
- [ ] `/support` shows support info
- [ ] `/privacy` links to privacy-policy
- [ ] All inline buttons navigate correctly
- [ ] "Back" buttons return to parent menu
- [ ] Invalid secret token → 401
- [ ] Duplicate update_id → 200 (single processing)
- [ ] Malformed JSON → 400
- [ ] Rate limit → 429 with Retry-After

---

## Outstanding Dependencies (Require User Action)

| Item | Status | Action |
|------|--------|--------|
| `TELEGRAM_BOT_TOKEN` | ❌ Missing | Create bot via @BotFather |
| `TELEGRAM_WEBHOOK_SECRET` | ❌ Missing | Generate secure random string |
| `TELEGRAM_BOT_USERNAME` | ✅ In .env.example | Verify `@Viztr_bot` is actual username |
| `NEXT_PUBLIC_SITE_URL` | ✅ In .env.example | Set to `https://viztr.in` |
| Custom domain `viztr.in` | ⚠️ Not on Vercel | Configure in Vercel dashboard |
| Telegram Channel URL | ⚠️ Not provided | Spec says "keep disabled" |

---

## Architecture Notes

- **No database changes** — Uses existing website data (portfolio, services, contact)
- **Vercel deployment** — Not Cloudflare (AGENTS.md referenced Cloudflare but actual is Vercel)
- **Existing rate limiting** — Reuses Upstash Redis with in-memory fallback
- **Existing Supabase** — Not used in Phase 1 (no new tables needed)
- **Existing middleware** — Webhook excluded from middleware matcher
- **TypeScript** — Strict types for all Telegram API structures
- **Tests** — 122 unit tests covering all components

---

## Next Steps (Phase 2+)

Per AGENTS.md, future phases will add:
- Phase 2: Membership registration, user categories
- Phase 3: Lead generation, CRM integration
- Phase 4: Admin notifications, project milestones
- Phase 5: Client account linking, dashboard integration
- Phase 6: AI assistant, analytics

Current architecture is extensible for these features.

---

*Generated: 2026-11-18*  
*Build: ✅ Successful*  
*Tests: 122/122 passing*  
*Lint: ✅ No errors*