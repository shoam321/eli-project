# Converting Mobile App to Web (Approach 1: Separate Web App)

## The Problem

Your `index.js` uses React Native's `AppRegistry`, which **only works for mobile**:

```javascript
// Current - MOBILE ONLY
import { AppRegistry } from 'react-native';
import App from './App';
AppRegistry.registerComponent('imobile', () => App);
```

This doesn't work in browsers. We need to convert to **standard React** for the web.

---

## Solution: Create Web App in Parallel

Keep your mobile app as-is in `/`:
```
/ (current mobile app stays here)
├── src/
├── android/
├── ios/
├── App.js (React Native)
└── index.js (React Native AppRegistry)
```

Create new web app in `/ilab-web`:
```
/ilab-web/ (NEW - separate project)
├── app/
│   ├── page.tsx (Next.js)
│   ├── layout.tsx
│   └── (screens)/
├── components/
├── lib/
├── package.json (React, not React Native)
└── next.config.js
```

**They share the SAME backend (Supabase)** but have separate frontends.

---

## Step 1: Create Web Project

### 1.1 Generate Next.js App

```bash
# From your desktop/work directory (NOT inside eli project)
cd c:\Users\shoog\Desktop

# Create new Next.js app
npx create-next-app@latest ilab-web --typescript

# Select these options:
# ✓ TypeScript: Yes
# ✓ ESLint: Yes
# ✓ Tailwind CSS: Yes
# ✓ src/ directory: Yes
# ✓ App Router: Yes
# ✓ Alias: Yes

cd ilab-web
```

### 1.2 Install Supabase

```bash
npm install @supabase/supabase-js
```

### 1.3 Project Structure

After creation, your web app looks like:

```
ilab-web/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Home page
│   │   ├── layout.tsx            # Root layout
│   │   ├── globals.css           # Global styles
│   │   └── (auth)/
│   │       ├── login/page.tsx    # Login page
│   │       └── signup/page.tsx   # Signup page
│   └── components/
│       └── (components here)
├── public/                        # Static files
├── package.json
├── tsconfig.json
├── next.config.js
└── tailwind.config.js
```

---

## Step 2: Convert Components

### Current Mobile Version (React Native)

**File:** `src/components/Button.js` (MOBILE)
```javascript
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const Button = ({ title, onPress, style }) => (
  <TouchableOpacity onPress={onPress} style={[styles.button, style]}>
    <Text style={styles.text}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
  },
  text: {
    color: 'white',
    textAlign: 'center',
  },
});

export default Button;
```

### New Web Version (React)

**File:** `ilab-web/src/components/Button.tsx` (WEB)
```typescript
import React from 'react';

interface ButtonProps {
  title: string;
  onClick: () => void;
  className?: string;
}

export default function Button({ title, onClick, className }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 ${className || ''}`}
    >
      {title}
    </button>
  );
}
```

**Key differences:**
- `TouchableOpacity` → `<button>`
- `onPress` → `onClick`
- `StyleSheet` → Tailwind CSS classes
- `Text` → `<span>` or `<p>`

---

## Step 3: Convert Pages

### Mobile: Router-based Navigation

**Current:** `src/scenes/Router.js` (React Native Router)
```javascript
import { Router, Scene } from 'react-native-router-flux';

export default () => (
  <Router>
    <Scene key="root">
      <Scene key="login" component={LoginScene} />
      <Scene key="dashboard" component={DashboardScene} />
      <Scene key="orders" component={OrdersScene} />
    </Scene>
  </Router>
);
```

### Web: Next.js File-Based Routing

**New:** `ilab-web/src/app/` (Automatic routing)
```
ilab-web/src/app/
├── page.tsx                    # / (home)
├── login/page.tsx              # /login
├── dashboard/page.tsx          # /dashboard
└── orders/page.tsx             # /orders
```

**Navigation:** Instead of Router flux, use Next.js Link:

```typescript
// ilab-web/src/app/dashboard/page.tsx
import Link from 'next/link';

export default function Dashboard() {
  return (
    <div className="p-4">
      <h1>Dashboard</h1>
      <nav className="space-y-2">
        <Link href="/orders" className="block p-2 bg-blue-500 text-white">
          Orders
        </Link>
        <Link href="/clients" className="block p-2 bg-blue-500 text-white">
          Clients
        </Link>
      </nav>
    </div>
  );
}
```

---

## Step 4: Convert Data Fetching

### Mobile Version (using Axios)

**Current:** `src/actions/orders.js` (Mobile)
```javascript
import restClient from '../config/axios';

export const getOrders = () => dispatch => 
  restClient.getAxios().post(remote.api, { tag: 'get_orders' })
    .then(({ data }) => {
      dispatch({ type: mainTypes.DATA_LOADED, payload: data.orders, key: 'orders' })
      return Promise.resolve(data)
    })
```

### Web Version (using Supabase)

**New:** `ilab-web/src/lib/orders.ts` (Web)
```typescript
import { supabase } from './supabase';

export async function getOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createOrder(order: any) {
  const { data, error } = await supabase
    .from('orders')
    .insert([order])
    .select();

  if (error) throw error;
  return data;
}
```

### Use in Component

```typescript
// ilab-web/src/app/orders/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { getOrders } from '@/lib/orders';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getOrders();
        setOrders(data);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Orders</h1>
      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">Order ID</th>
            <th className="p-2">Client</th>
            <th className="p-2">Date</th>
            <th className="p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-t">
              <td className="p-2">{order.id}</td>
              <td className="p-2">{order.client_id}</td>
              <td className="p-2">{new Date(order.created_at).toLocaleDateString()}</td>
              <td className="p-2">{order.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## Step 5: Setup Supabase Client

**File:** `ilab-web/src/lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

**File:** `ilab-web/.env.local`

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## Step 6: Convert Styling

### Mobile Styling (StyleSheet)

```javascript
// Mobile
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold' },
  button: { backgroundColor: '#007AFF', padding: 12 },
});
```

### Web Styling (Tailwind)

```typescript
// Web
<div className="flex-1 p-4">
  <h1 className="text-2xl font-bold">Title</h1>
  <button className="bg-blue-500 p-3 rounded">Button</button>
</div>
```

**Quick Conversion Map:**
| React Native | Tailwind CSS |
|---|---|
| `flex: 1` | `flex-1` |
| `padding: 16` | `p-4` |
| `fontSize: 24` | `text-2xl` |
| `fontWeight: 'bold'` | `font-bold` |
| `backgroundColor: '#007AFF'` | `bg-blue-500` |
| `borderRadius: 8` | `rounded-lg` |

---

## Step 7: Convert Redux (Optional)

If using Redux on mobile, you can:

**Option A: Keep Redux** (same state management)
```bash
npm install redux react-redux redux-thunk @reduxjs/toolkit
```

**Option B: Use React State** (simpler for web)
```typescript
const [orders, setOrders] = useState([]);
const [loading, setLoading] = useState(false);
```

For a web app starting fresh, **React State is simpler**.

---

## Step 8: Handle Authentication

### Web Login Page

**File:** `ilab-web/src/app/login/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Button from '@/components/Button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">iLab Manager - Login</h1>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border p-2 rounded"
            />
          </div>

          {error && <div className="bg-red-100 text-red-700 p-2 rounded">{error}</div>}

          <Button title="Login" onClick={() => {}} className="w-full" />
        </form>
      </div>
    </div>
  );
}
```

---

## Step 9: Full Conversion Checklist

```
COMPONENTS
[ ] Button.tsx
[ ] TextInput.tsx
[ ] ModalDialog.tsx
[ ] Checkbox.tsx
[ ] Card.tsx
[ ] Navigation.tsx

PAGES
[ ] Home page
[ ] Login/Signup
[ ] Dashboard
[ ] Orders list & details
[ ] Clients list & details
[ ] Inventory
[ ] Cashier
[ ] Analytics
[ ] Settings

DATA INTEGRATION
[ ] Setup Supabase client
[ ] Convert API calls to Supabase
[ ] Setup authentication
[ ] Connect to database

STYLING
[ ] Configure Tailwind CSS
[ ] Convert all StyleSheet to Tailwind
[ ] Mobile-responsive design
[ ] Dark mode (optional)

TESTING
[ ] Test all pages load
[ ] Test login/logout
[ ] Test data fetching
[ ] Test forms
[ ] Test on mobile browser

DEPLOYMENT
[ ] Deploy to Vercel
[ ] Setup environment variables
[ ] Configure custom domain (optional)
[ ] Monitor performance
```

---

## Step 10: Deploy to Vercel

```bash
# 1. Initialize git
cd ilab-web
git init
git add .
git commit -m "Initial web version"

# 2. Push to GitHub
git remote add origin https://github.com/shoam321/ilab-web.git
git push -u origin main

# 3. Go to Vercel
# https://vercel.com/dashboard

# 4. Click "Add New Project"
# 5. Import GitHub repo (ilab-web)
# 6. Add environment variables:
#    NEXT_PUBLIC_SUPABASE_URL
#    NEXT_PUBLIC_SUPABASE_ANON_KEY
# 7. Click Deploy
```

Your web app will be live at: `https://ilab-web.vercel.app`

---

## Quick Reference: Component Conversion

### Text Display
```
React Native          →  Web
<Text>...</Text>      →  <p>...</p> or <span>...</span>
<TextInput/>          →  <input type="text" />
<Picker/>            →  <select><option>...</option></select>
<Image/>             →  <img />
<ScrollView/>        →  <div className="overflow-auto">
<FlatList/>          →  Map over array + render JSX
```

### Navigation
```
React Native Router   →  Next.js
<Scene key="login"/>  →  /login/page.tsx
<Scene key="orders"/> →  /orders/page.tsx
Actions.push()        →  router.push()
```

### Styling
```
React Native          →  Tailwind
flex: 1               →  flex-1
padding: 16           →  p-4
backgroundColor       →  bg-{color}-{shade}
borderRadius: 8       →  rounded-lg
```

---

## Timeline

```
Day 1:   Setup Next.js project + Supabase
Day 2-3: Build core pages (login, dashboard, orders)
Day 4-5: Build remaining pages (clients, inventory, etc.)
Day 6:   Testing + bug fixes
Day 7:   Deploy to Vercel
```

You can start **TODAY!** The web app will be ready in ~1 week.

Ready to begin? Start with **Step 1** above! 🚀
