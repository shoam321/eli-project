# iLab Manager Web

Next.js web client for iLab Manager using TypeScript, Tailwind CSS, and Supabase.

## Stack

- Next.js (Pages Router)
- TypeScript
- Tailwind CSS v4
- Supabase JavaScript client

## Project Structure

```text
ilab-web/
	src/
		components/
			dashboard/
			layout/
		lib/
			supabase/
				client.ts
				server.ts
		pages/
			api/
			_app.tsx
			_document.tsx
			index.tsx
		styles/
			globals.css
	.env.local.example
```

## Supabase Configuration

1. Copy `.env.local.example` to `.env.local`.
2. Add values from your Supabase project.

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Utilities

- `src/lib/supabase/client.ts`: browser-safe client using public env vars.
- `src/lib/supabase/server.ts`: server-only client using service role key.

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.
