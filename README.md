# BoundaryLive

A mobile-first cricket live page: one active YouTube stream, separated ad placements, a simple match poll, and a private admin page.

## Features
- Responsive 16:9 YouTube player with mobile-friendly sizing
- One active stream controlled from `/admin`
- Match poll with server-side vote uniqueness per browser token and aggregated results
- Language selector: English, Tamil, Hindi, Telugu, Bengali, Spanish, French, Arabic, Indonesian; browser-language detection and RTL support
- Supabase Auth for admin sign-in; database row-level security
- Ad placeholders are deliberately separated from player controls

## Setup
1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL editor.
3. Add an admin user in Supabase Authentication, then insert that user's UUID into `public.admin_users` using the SQL editor.
4. Copy `.env.example` to `.env.local` and set the Supabase project URL and publishable/anon key.
5. Run `npm install`, then `npm run dev`.
6. Deploy to Vercel and set the same environment variables.

The website only embeds a YouTube stream. Only publish and monetize streams and surrounding content that you own or are authorized to distribute and monetize. Ad-network approval is not guaranteed; add real About, Contact and Privacy content and review each provider's policies before applying.
