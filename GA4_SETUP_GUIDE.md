# Google Analytics 4 Setup Guide — Super Admin Analytics

## Problem

The Super Admin GA4 dashboard returns:

```json
{ "success": false, "error": "GA4 property ID not configured" }
```

This happens because `GA_PROPERTY_ID` is not set in `.env.local`. All six analytics API routes require it:

- `/api/admin/analytics/overview`
- `/api/admin/analytics/traffic`
- `/api/admin/analytics/pages`
- `/api/admin/analytics/acquisition`
- `/api/admin/analytics/audience`
- `/api/admin/analytics/conversions`

---

## Step 1: Get Your GA4 Property ID

1. Go to [Google Analytics](https://analytics.google.com/)
2. Select your GA4 property
3. Click **Admin** (gear icon, bottom left)
4. In the **Property** column, click **Property Settings**
5. Copy the **Property ID** — it's a numeric ID like `123456789`

> **Note:** This is NOT the Measurement ID (`G-XXXXXXXXXX`). The backend uses the numeric Property ID for the Google Analytics Data API (GA4).

---

## Step 2: Create a Google Cloud Service Account

The backend uses a **service account** to authenticate with the GA4 Data API (not OAuth).

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select or create a project
3. Navigate to **IAM & Admin** → **Service Accounts**
4. Click **Create Service Account**
   - Name: `viztr-ga4-analytics` (or similar)
   - Description: `Service account for VizTR GA4 Data API access`
5. Click **Create and Continue**
6. Grant **Viewer** role (or **Editor** if you need to write)
   - Optional: Add **GA4 Admin** role if managing properties
7. Click **Done**

### Create and Download Key

1. Click the service account email to open details
2. Go to **Keys** tab → **Add Key** → **Create new key** → **JSON**
3. Save the downloaded JSON file securely

### Grant GA4 Access

1. Go to [Google Analytics](https://analytics.google.com/) → **Admin**
2. In **Property** column → **Property Access Management**
3. Click **+** → **Add users**
4. Paste the **service account email** (from the JSON key, e.g., `viztr-ga4-analytics@my-project.iam.gserviceaccount.com`)
5. Assign **Viewer** role (minimum)
6. Click **Add**

---

## Step 3: Add Credentials to `.env.local`

Your `.env.local` already has placeholder entries (added by this fix). Replace the placeholders:

```env
# --- Google Analytics 4 (Super Admin Analytics) ---
# Get this from Google Analytics Admin → Property Settings → Property ID
# Format: a numeric ID like 123456789 (NOT the G-XXXXXXXXXX measurement ID)
GA_PROPERTY_ID="123456789"

# Service Account credentials for GA4 Data API
# Create a service account in Google Cloud Console → IAM → Service Accounts
# Grant it "Viewer" role on the GA4 property
# Download the JSON key and extract these values:
GA_SERVICE_ACCOUNT_EMAIL="viztr-ga4-analytics@my-project.iam.gserviceaccount.com"
GA_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

> **Important:** The private key MUST include the literal `\n` escape sequences (not actual newlines) for the `.env.local` format. The JSON key contains actual newlines — convert them to `\n` when pasting.

### Quick Private Key Conversion

If your JSON key has:
```json
{
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
}
```

Copy the value **exactly as-is** (including the `\n` characters) — the `.env.local` format preserves them correctly.

---

## Step 4: Restart the Dev Server

Env vars are only read at server startup:

```powershell
# Stop existing node processes, then restart
pnpm run dev:all
```

---

## Step 5: Verify

Hit the analytics overview endpoint:

```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/admin/analytics/overview" -Method GET -UseBasicParsing
```

You should get `{ "success": true, ... }` with actual GA4 data.

---

## Files Modified

| File | Change |
|------|--------|
| `.env.local` | Added `GA_PROPERTY_ID`, `GA_SERVICE_ACCOUNT_EMAIL`, `GA_PRIVATE_KEY` env vars |
| `lib/services/GoogleAnalyticsDataService.ts` | Fixed JWT signing using `crypto.createSign()` (was using non-existent `Buffer.sign()`) |

## API Routes That Use These Env Vars

All routes read `GA_PROPERTY_ID`, `GA_SERVICE_ACCOUNT_EMAIL`, `GA_PRIVATE_KEY`:

- `app/api/admin/analytics/overview/route.ts`
- `app/api/admin/analytics/traffic/route.ts`
- `app/api/admin/analytics/pages/route.ts`
- `app/api/admin/analytics/acquisition/route.ts`
- `app/api/admin/analytics/audience/route.ts`
- `app/api/admin/analytics/conversions/route.ts`

Each returns `{ success: false, error: 'GA4 property ID not configured' }` if `GA_PROPERTY_ID` is missing, or a 500 if service account credentials are invalid.