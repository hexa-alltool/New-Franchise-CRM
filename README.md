# Vedic Maths Franchise CRM

Full-stack CRM — React + Supabase + Vercel (100% free)

## Quick Start

### 1. Install
```bash
npm install
```

### 2. Setup Supabase
1. Create project at supabase.com (free)
2. SQL Editor mein run karo:
   - supabase/01_schema.sql
   - supabase/02_rls.sql
   - supabase/03_seed.sql (instructions inside)
3. Storage > New bucket: `crm-resources` (public ON)
4. Settings > API > copy URL + anon key

### 3. Environment
```bash
cp .env.example .env
# Fill VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
```

### 4. Run
```bash
npm run dev
```

### 5. Deploy
- Push to GitHub
- Import on vercel.com
- Add env vars
- Deploy!

## Roles
- **Super Admin** — full system
- **Admin** — zone management  
- **Franchise** — own CRM
