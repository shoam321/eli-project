# Web Migration & Backend Consolidation Guide

## 🎯 Goal

Convert iLab Mobile Manager from:
- **Old:** Mobile-only app + custom backend at `app.ilabassistant.com`
- **New:** Web + Mobile app + **Supabase backend** hosted on Vercel

**Result:** Single source of truth, no more server maintenance, always online.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         VERCEL HOSTING                       │
│  ┌──────────────────────────────────────────────────────────┐│
│  │  Web UI (React/Next.js)                                  ││
│  │  - Order management interface                             ││
│  │  - Client dashboard                                       ││
│  │  - Inventory tracking                                     ││
│  │  - Analytics & reporting                                  ││
│  │  URL: ilabmanager.vercel.app                              ││
│  └──────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE BACKEND                          │
│  ┌──────────────────────────────────────────────────────────┐│
│  │  Authentication (JWT tokens)                             ││
│  │  PostgreSQL Database                                      ││
│  │  Real-time Subscriptions                                  ││
│  │  REST API (auto-generated)                                ││
│  │  Firebase integration for notifications                   ││
│  └──────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              ↕
              ┌───────────────┴───────────────┐
              ↓                               ↓
    ┌─────────────────┐          ┌─────────────────┐
    │  iOS App        │          │  Android App    │
    │  (React Native) │          │  (React Native) │
    │  App Store      │          │  Play Store     │
    └─────────────────┘          └─────────────────┘
```

---

## Phase 1: Setup (Days 1-2)

### Step 1.1: Create Supabase Project

1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub or email
4. Create new project:
   - Name: `ilab-manager`
   - Region: Closest to your users
   - Database password: **Strong password** (save it!)

5. In project settings, save your credentials:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **Anon Key** (public, for frontend)
   - **Service Role Key** (secret, for backend only)

### Step 1.2: Design Database Schema

Migrate your current data structure to PostgreSQL:

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Clients
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  client_id UUID REFERENCES clients(id),
  order_date TIMESTAMP DEFAULT NOW(),
  status VARCHAR(50),
  total_amount DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Order Parts
CREATE TABLE order_parts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id),
  part_name VARCHAR(255),
  quantity INT,
  price DECIMAL(10, 2),
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Parts/Inventory
CREATE TABLE parts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(255),
  quantity INT,
  price DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add similar tables for:
-- - suppliers
-- - cashiers
-- - transactions
-- - projects
-- - devices
```

**Steps:**
1. Go to Supabase project → SQL Editor
2. Paste table creation SQL
3. Run queries
4. Verify tables created

### Step 1.3: Setup Authentication

**Option A: Supabase Auth (Recommended)**
```sql
-- Supabase automatically creates auth.users table
-- Enable email/password auth in Supabase dashboard:
-- Authentication → Providers → Email (enable)
```

**Option B: Keep existing auth, sync with Supabase**
- If you have existing user database, migrate data to Supabase

### Step 1.4: Migrate Data (if old backend still accessible)

```bash
# Export from old backend (if possible)
# Then import to Supabase

# Or manually in Supabase dashboard:
# Table → Import → CSV/JSON
```

### Step 1.5: Test Connection

```javascript
// test-supabase.js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://YOUR_PROJECT.supabase.co',
  'YOUR_ANON_KEY'
)

// Test connection
const { data, error } = await supabase.auth.getSession()
console.log('Connected to Supabase:', !error)
```

---

## Phase 2: Build Web Version (Days 3-14)

### Step 2.1: Setup Next.js Project

```bash
# Create new Next.js project
npx create-next-app@latest ilab-web --typescript

cd ilab-web

# Install Supabase client
npm install @supabase/supabase-js

# Install UI components (optional but recommended)
npm install tailwindcss autoprefixer
npm install shadcn-ui  # Beautiful React components
```

### Step 2.2: Create Supabase Client

**File:** `lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

**File:** `.env.local`

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Step 2.3: Build Components

Convert React Native components to web React:

**Example: Orders List**

```typescript
// components/OrdersList.tsx
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function OrdersList() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch from Supabase instead of old API
    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) console.error(error)
      else setOrders(data)
      
      setLoading(false)
    }

    fetchOrders()
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Orders</h1>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Order ID</th>
            <th className="p-2">Client</th>
            <th className="p-2">Date</th>
            <th className="p-2">Status</th>
            <th className="p-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id} className="border-t">
              <td className="p-2">{order.id}</td>
              <td className="p-2">{order.client_id}</td>
              <td className="p-2">{new Date(order.created_at).toLocaleDateString()}</td>
              <td className="p-2">{order.status}</td>
              <td className="p-2">${order.total_amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

### Step 2.4: Build Key Pages

Create these pages in `app/`:

```
app/
├── (auth)/
│   ├── login/page.tsx          # Login page
│   └── signup/page.tsx         # Registration
├── dashboard/
│   ├── page.tsx                # Main dashboard
│   ├── orders/page.tsx         # Orders list
│   ├── orders/[id]/page.tsx    # Order details
│   ├── clients/page.tsx        # Clients list
│   ├── inventory/page.tsx      # Parts/inventory
│   ├── cashier/page.tsx        # Cashier operations
│   └── analytics/page.tsx      # Reports
├── layout.tsx                  # Root layout
└── page.tsx                    # Home page
```

### Step 2.5: Authentication

```typescript
// app/(auth)/login/page.tsx
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) alert(error.message)
    else router.push('/dashboard')
  }

  return (
    <form onSubmit={handleLogin} className="max-w-md mx-auto p-4">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="w-full p-2 border mb-2"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="w-full p-2 border mb-2"
      />
      <button type="submit" className="w-full bg-blue-500 text-white p-2">
        Login
      </button>
    </form>
  )
}
```

### Step 2.6: Deploy to Vercel

```bash
# 1. Push to GitHub
git init
git add .
git commit -m "Initial web version"
git remote add origin https://github.com/yourusername/ilab-web.git
git push -u origin main

# 2. Go to Vercel dashboard
# https://vercel.com/dashboard

# 3. Click "Add New Project"
# 4. Import GitHub repo (ilab-web)
# 5. Add environment variables:
#    NEXT_PUBLIC_SUPABASE_URL
#    NEXT_PUBLIC_SUPABASE_ANON_KEY
# 6. Click Deploy

# App will be live at: https://ilab-web.vercel.app
```

---

## Phase 3: Update Mobile App (Days 15-21)

### Step 3.1: Update API Endpoint

**File:** `src/config/constants.js`

```javascript
// OLD
// export const remote = {
//   host: 'https://app.ilabassistant.com',
//   api: 'https://app.ilabassistant.com/ApiForApp',
// };

// NEW - Use Supabase
export const remote = {
  supabaseUrl: 'https://YOUR_PROJECT.supabase.co',
  supabaseKey: 'YOUR_ANON_KEY',
};
```

### Step 3.2: Update API Client

**File:** `src/config/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js'
import { remote } from './constants'

export const supabase = createClient(
  remote.supabaseUrl,
  remote.supabaseKey
)
```

### Step 3.3: Update Actions (Replace Axios with Supabase)

**File:** `src/actions/orders.js` (BEFORE - using old API)

```javascript
export const getOrders = () => dispatch => 
  restClient.getAxios().post(remote.api, { tag: 'get_orders' })
    .then(({ data }) => {
      dispatch({ type: mainTypes.DATA_LOADED, payload: data.orders, key: 'orders' })
      return Promise.resolve(data)
    })
```

**File:** `src/actions/orders.js` (AFTER - using Supabase)

```javascript
import { supabase } from '../config/supabase'

export const getOrders = () => async dispatch => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return Promise.reject(error)
  
  dispatch({ type: mainTypes.DATA_LOADED, payload: data, key: 'orders' })
  return Promise.resolve(data)
}

export const postOrder = order => async dispatch => {
  const { data, error } = await supabase
    .from('orders')
    .insert([order])
    .select()

  if (error) return Promise.reject(error)
  
  dispatch(getOrders())
  return Promise.resolve(data)
}
```

### Step 3.4: Update Firebase (Keep same)

Firebase integration stays the same for push notifications. Just ensure FCM tokens still sync with Supabase:

```typescript
export const postFcmToken = dev_key => async () => {
  const { error } = await supabase
    .from('user_devices')
    .insert([{ 
      user_id: currentUserId,
      fcm_token: dev_key,
      platform: Platform.OS 
    }])

  if (error) return Promise.reject(error)
  return Promise.resolve()
}
```

### Step 3.5: Test Mobile App

```bash
# Test on Android
npm run android

# Test on iOS
npm run ios

# Verify all features work with Supabase
```

### Step 3.6: Submit Updates to App Stores

**Android:**
```bash
cd android
./gradlew bundleRelease
# Upload AAB to Google Play Console
```

**iOS:**
```bash
# Archive in Xcode → Product → Archive
# Upload via App Store Connect
```

---

## Phase 4: Decommission Old Backend

Once web & mobile are working with Supabase:

1. **Keep old backend running** for 30 days (safety fallback)
2. **Monitor Supabase** for any issues
3. **After 30 days** → Shut down old backend server
4. **Redirect traffic** from old domain to new web app

---

## Benefits After Migration

| Aspect | Before | After |
|--------|--------|-------|
| Server Maintenance | Manual, costly | Managed by Supabase |
| SSL Certificate | Expired, problematic | Automatic, always valid |
| Downtime | Possible | Enterprise SLA (99.9%) |
| Data Access | Mobile only | Web + Mobile |
| Scalability | Limited | Unlimited |
| Cost | $100-500/month | Free tier or $25/month |
| Backup | Manual | Automatic daily |
| Disaster Recovery | Complex | Built-in |

---

## Cost Breakdown

| Component | Free Tier | Paid (if needed) |
|-----------|-----------|-----------------|
| Supabase Database | 500 MB, 2 GB bandwidth | $25/month per project |
| Vercel Web Hosting | ✅ Free | Pro: $20/month |
| Firebase (push notifications) | ✅ Free | Blaze pay-as-you-go |
| **TOTAL** | **$0** | **~$45/month** (if all paid) |

**Most likely:** Stays free tier or $25/month

---

## Migration Checklist

```
WEEK 1: SETUP
[ ] Create Supabase project
[ ] Design database schema
[ ] Migrate existing data (if possible)
[ ] Setup authentication
[ ] Test Supabase connection

WEEK 2-3: BUILD WEB
[ ] Setup Next.js project
[ ] Build authentication pages
[ ] Build orders dashboard
[ ] Build clients management
[ ] Build inventory tracker
[ ] Build cashier interface
[ ] Build analytics/reports
[ ] Deploy to Vercel
[ ] Test all features

WEEK 4: UPDATE MOBILE
[ ] Update API client to Supabase
[ ] Replace all Axios calls
[ ] Test on iOS device
[ ] Test on Android device
[ ] Submit to Apple App Store
[ ] Submit to Google Play
[ ] Wait for approval

POST-LAUNCH
[ ] Monitor both apps for 30 days
[ ] Fix any issues
[ ] Keep old backend as fallback
[ ] Decommission old backend (day 31)
```

---

## Troubleshooting

### Issue: Old backend data not in Supabase
**Solution:** Export data from old backend, import to Supabase

### Issue: Authentication not working
**Solution:** Verify JWT token configuration, check Supabase auth settings

### Issue: Performance slower on web
**Solution:** Add database indexes, optimize queries, use caching

### Issue: Mobile app can't reach Supabase
**Solution:** Check CORS settings in Supabase project settings

---

## Next Steps

1. **Start Phase 1** — Create Supabase project today
2. **Get database schema right** — This is critical
3. **Build web version** — Use provided Next.js template
4. **Test thoroughly** — Both web and mobile
5. **Deploy to production** — Vercel handles it
6. **Monitor performance** — Use Supabase analytics
7. **Sunset old backend** — After 30 days

You're no longer dependent on a server! 🚀

