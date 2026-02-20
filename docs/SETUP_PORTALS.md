# SETUP PORTALS - Konfiguracja Kont i Zmiennych Środowiskowych

> **Data utworzenia:** 2026-02-20  
> **Wersja:** 0.1  
> **Status:** Planowanie  
> **Powiązane:** PROJECT_BRIEF.md, docs/ARCHITECTURE.md, docs/COST_AND_LIMITS.md

---

## 1. Wprowadzenie

Ten dokument zawiera instrukcję zakładania kont w wymaganych portalach oraz konfiguracji zmiennych środowiskowych. Dokument zakłada wybór określonych technologii - do podstawowej konfiguracji MVP.

---

## 2. Lista Portali

| Portal | Co to daje | Wymagane? | Uwagi |
|--------|-----------|-----------|-------|
| **GitHub** | Kod źródłowy, CI/CD | ✅ Tak | Już posiadasz |
| **Vercel** | Hosting web, deployment, Blob | ✅ Tak | Główny hosting |
| **Neon** | PostgreSQL database | ✅ Tak | Serverless DB |
| **Upstash** | Redis/Kafka (kolejka) | ✅ Tak (produkcja) | Serverless Redis |
| **Cloudflare** | DNS, CDN, R2 Storage | 🟡 Opcjonalne | Dla R2 storage |
| **OpenAI** | AI generation | 🟡 Opcjonalne | Tylko jeśli dodajesz AI |

---

## 3. Tabela: Portal → Co to daje → Zmienne env

| Portal | Co to daje | Zmienne env | Gdzie wkleić |
|--------|-----------|-------------|--------------|
| **GitHub** | CI/CD pipeline, Codespaces | Brak (token w repo settings) | - |
| **Vercel** | Hosting web, Functions, Blob Storage | `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` | Vercel Dashboard |
| **Neon** | PostgreSQL database | `DATABASE_URL` | Vercel Env Vars / Worker env |
| **Upstash** | Redis/Kafka (Queue) | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Worker / Vercel |
| **Cloudflare** | R2 Storage | `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_ACCOUNT_ID` | Worker / Vercel |
| **OpenAI** | AI generation | `OPENAI_API_KEY` | **Tylko Worker** (nigdy frontend!) |

---

## 4. Szczegółowa Instrukcja

### 4.1 GitHub

**Konto:** github.com

**Akcje:**
1. Załóż konto na github.com (jeśli nie masz)
2. Utwórz nowe repozytorium: `colouring-Pages`
3. Dodaj `.github/workflows/` dla CI/CD

**Uwagi:**
- Tokeny GitHub są konfigurowane w Settings → Developer settings → Personal access tokens
- Dla Vercel najczęściej nie potrzebujesz osobnego tokena (Vercel integruje się bezpośrednio)

---

### 4.2 Vercel (Hosting Web)

**Konto:** vercel.com

**Krok po kroku:**

1. **Zarejestruj się:**
   - Wejdź na vercel.com
   - Kliknij "Sign Up" → wybierz GitHub

2. **Utwórz projekt:**
   - Kliknij "Add New..." → "Project"
   - Wybierz repo `colouring-Pages`
   - Kliknij "Deploy"

3. **Konfiguracja zmiennych (po deploy):**
   - Projekt → Settings → Environment Variables
   - Dodaj zmienne (patrz sekcja 5)

**Wymagane zmienne env (Vercel automatycznie):**
- Brak - Vercel pobiera z GitHub

**Opcjonalne zmienne env:**
- `DATABASE_URL` - z Neon
- `GENERATION_ENABLED=true`

---

### 4.3 Neon (PostgreSQL)

**Konto:** console.neon.tech

**Krok po kroku:**

1. **Zarejestruj się:**
   - Wejdź na console.neon.tech
   - Wybierz "Sign Up" z GitHub

2. **Utwórz projekt:**
   - Kliknij "Create a project"
   - Nazwa: `colouring-pages-db`
   - Wybierz region: najbliższą (np. `EU (Frankfurt)`)
   - Kliknij "Create project"

3. **Pobierz connection string:**
   - W dashboard → "Connection Details"
   - Wybierz "Pooled connection" (dla serverless)
   - Skopiuj `DATABASE_URL`
   - Format: `postgresql://user:password@host.neon.tech/dbname?sslmode=require`

**Zmienne env:**

| Zmienna | Przykładowa wartość | Gdzie wkleić |
|---------|---------------------|--------------|
| `DATABASE_URL` | `postgresql://user:pass@host.neon.tech/db?sslmode=require` | Vercel / Worker .env |

---

### 4.4 Upstash (Redis/Queue)

**Konto:** console.upstash.com

**Krok po kroku:**

1. **Zarejestruj się:**
   - Wejdź na console.upstash.com
   - Wybierz "Sign Up" z GitHub

2. **Utwórz Redis:**
   - Kliknij "Create Database"
   - Nazwa: `colouring-pages-queue`
   - Wybierz region: `eu-west-1` (lub najbliższą)
   - Kliknij "Create"

3. **Pobierz credentials:**
   - W dashboard → zakładka "REST API"
   - Skopiuj `UPSTASH_REDIS_REST_URL`
   - Skopiuj `UPSTASH_REDIS_REST_TOKEN`

**Zmienne env:**

| Zmienna | Gdzie wkleić |
|---------|--------------|
| `UPSTASH_REDIS_REST_URL` | Vercel / Worker .env |
| `UPSTASH_REDIS_REST_TOKEN` | Vercel / Worker .env |

---

### 4.5 Cloudflare R2 (Opcjonalne - Storage)

**Konto:** dash.cloudflare.com

**Krok po kroku:**

1. **Zarejestruj się:**
   - Wejdź na dash.cloudflare.com
   - Wybierz "Sign Up"

2. **Utwórz R2 bucket:**
   - W dashboard → R2 → "Create bucket"
   - Nazwa: `colouring-pages-assets`
   - Kliknij "Create bucket"

3. **Utwórz API token:**
   - R2 → Manage API Tokens → "Create API Token"
   - Nazwa: `colouring-pages-upload`
   - Permissions: "Edit" (write + read)
   - TTL: "Never" (lub 1 rok)
   - Skopiuj `Access Key ID` i `Secret Access Key`

4. **Pobierz Account ID:**
   - W dashboard → Overview
   - Skopiuj `Account ID` (prawa strona)

**Zmienne env:**

| Zmienna | Gdzie wkleić |
|---------|--------------|
| `R2_ACCESS_KEY_ID` | Worker / Vercel |
| `R2_SECRET_ACCESS_KEY` | Worker / Vercel |
| `R2_BUCKET_NAME` | Worker / Vercel |
| `R2_ACCOUNT_ID` | Worker / Vercel |
| `R2_PUBLIC_URL` | Opcjonalne (jeśli public bucket) |

---

### 4.6 OpenAI (Opcjonalne - AI Generation)

**Konto:** platform.openai.com

**Krok po kroku:**

1. **Zarejestruj się:**
   - Wejdź na platform.openai.com
   - Wybierz "Sign Up"

2. **Dodaj metodę płatności (jeśli potrzebujesz):**
   - Settings → Billing → Payment methods

3. **Utwórz API key:**
   - API keys → "Create new secret key"
   - Nazwa: `colouring-pages`
   - **WAŻNE:** Skopiuj od razu! Po zamknięciu nie zobaczysz ponownie.

**⚠️ OSTRZEŻENIE - BEZPIECZEŃSTWO:**
- **NIGDY nie wklejaj OPENAI_API_KEY w front-end!**
- **Tylko w Worker / Server-side!**
- Używaj zmiennej tylko w backendzie

**Zmienne env:**

| Zmienna | Gdzie wkleić |
|---------|--------------|
| `OPENAI_API_KEY` | **Tylko Worker** (nigdy frontend!) |

---

## 5. Zmienne Środowiskowe - Podsumowanie

### 5.1 Wymagane

| Zmienna | Wartość | Opis |
|---------|---------|------|
| `DATABASE_URL` | z Neon | PostgreSQL connection string |
| `GENERATION_ENABLED` | `true` | Kill switch (domyślnie włączone) |

### 5.2 Opcjonalne - Queue

| Zmienna | Wartość | Opis |
|---------|---------|------|
| `UPSTASH_REDIS_REST_URL` | z Upstash | Redis URL |
| `UPSTASH_REDIS_REST_TOKEN` | z Upstash | Redis token |

### 5.3 Opcjonalne - Storage

| Zmienna | Wartość | Opis |
|---------|---------|------|
| `R2_ACCESS_KEY_ID` | z Cloudflare | R2 access key |
| `R2_SECRET_ACCESS_KEY` | z Cloudflare | R2 secret |
| `R2_BUCKET_NAME` | z Cloudflare | Nazwa bucketu |
| `R2_ACCOUNT_ID` | z Cloudflare | Account ID |

### 5.4 Opcjonalne - AI

| Zmienna | Wartość | Opis |
|---------|---------|------|
| `OPENAI_API_KEY` | z OpenAI | AI API key (tylko backend!) |

---

## 6. Gdzie Wkleić Zmienne

### 6.1 Vercel Dashboard

```
Project → Settings → Environment Variables
```

Dodaj każdą zmienną jako osobny wpis:
- Name: `DATABASE_URL`
- Value: (wklej wartość)
- Environment: Production, Preview, Development (zaznacz wszystkie)

### 6.2 Lokalnie (.env)

Utwórz plik `.env` w root projektu:

```bash
# Database
DATABASE_URL=postgresql://...

# Queue (opcjonalne)
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...

# Storage (opcjonalne)
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=...
R2_ACCOUNT_ID=...

# AI (opcjonalne)
OPENAI_API_KEY=...

# App config
GENERATION_ENABLED=true
MAX_PAGES_PER_DAY=300
```

**WAŻNE:** Dodaj `.env` do `.gitignore`!

```bash
# .gitignore
.env
.env.local
.env.*.local
```

---

## 7. Bezpieczeństwo

### 7.1 Zasady Kluczowe

⚠️ **Nigdy nie wklejaj kluczy API w front-end!**

- **Klucze tylko w backend/worker** - nigdy w przeglądarce
- **Least privilege** - każdy token ma minimalne uprawnienia
- **Rotacja kluczy** - co 90 dni
- **Brak w commitach** - pliki .env w .gitignore

### 7.2 Niebezpieczne Praktyki ❌

```javascript
// NIGDY NIE RÓB TAK!
// ❌ Wklejanie klucza w kod
const apiKey = "sk-1234567890";

// ❌ Wklejanie klucza w front-end
fetch("https://api.example.com", {
  headers: { "Authorization": "Bearer " + apiKey }
});

// ✅ Rób tak:
const apiKey = process.env.OPENAI_API_KEY; // Worker only!
```

### 7.3 Bezpieczne Praktyki ✅

```bash
# ✅ Tylko zmienne środowiskowe
export OPENAI_API_KEY="sk-..."

# ✅ Weryfikuj czy zmienna istnieje
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}
```

### 7.4 Uprawnienia Tokenów

| Token | Minimalne uprawnienia |
|-------|----------------------|
| Vercel Token | Deploy, Read |
| Neon | Read/Write (tylko do jednego DB) |
| Upstash Redis | Read/Write (do jednego instance) |
| R2 | Write/Read (do jednego bucket) |
| OpenAI | Only "Create" (do generowania) |

---

## 8. NIEOKREŚLONE (Do Wyboru)

| Element | Opcje | Status |
|---------|-------|--------|
| **Hosting** | Vercel / Cloudflare Pages / Railway | 🔴 NIEOKREŚLONE |
| **Storage** | Cloudflare R2 / Vercel Blob / LocalFS | 🔴 NIEOKREŚLONE |

---

## 9. Checklist Po Konfiguracji

- [ ] Utworzono konto GitHub
- [ ] Utworzono projekt Vercel i połączono z GitHub
- [ ] Utworzono bazę Neon i pobrano DATABASE_URL
- [ ] Dodano DATABASE_URL do Vercel
- [ ] (Opcjonalne) Utworzono konto Upstash i dodano zmienne
- [ ] (Opcjonalne) Utworzono R2 bucket i dodano zmienne
- [ ] (Opcjonalne) Utworzono konto OpenAI i dodano zmienne (tylko worker!)
- [ ] Plik .env dodany do .gitignore
- [ ] Zweryfikowano że /health endpoint działa

---

## 10. Historia Zmian

| Data | Wersja | Opis |
|------|--------|------|
| 2026-02-20 | 0.1 | Utworzenie dokumentu |

---

## 11. Następne Kroki

1. Założyć konta w portalu (Vercel, Neon, Upstash)
2. Skonfigurować zmienne środowiskowe
3. Zweryfikować połączenie przez /health endpoint
4. Rozpocząć implementację Epiku A (Infra Setup)
