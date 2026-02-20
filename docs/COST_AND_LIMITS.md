# COST AND LIMITS - Koszty i Limity dla colouring-Pages

> **Data utworzenia:** 2026-02-20  
> **Wersja:** 0.1  
> **Status:** Planowanie  
> **Powiązane:** PROJECT_BRIEF.md, docs/ARCHITECTURE.md, docs/SCOPE_MVP.md

---

## 1. Lista Kosztogennych Elementów

Poniższa lista identyfikuje wszystkie elementy systemu, które mogą generować koszty:

| Element | Kategoria kosztu | Opis | Priorytet kosztu |
|---------|-----------------|------|------------------|
| **AI Generation** | Per-request | Generowanie obrazów (Midjourney/Stable Diffusion/OpenAI DALL-E) | 🔴 Wysoki |
| **Database** | Monthly | PostgreSQL (np. Vercel Postgres, Supabase) | 🟡 Średni |
| **Storage** | Per GB | Przechowywanie obrazów (S3/R2/Blob) | 🟡 Średni |
| **Queue/Redis** | Monthly | Kolejka zadań (Upstash, Railway Redis) | 🟢 Niski |
| **Worker/Server** | Monthly | VPS lub serverless functions | 🟡 Średni |
| **CDN** | Per GB | Dystrybucja obrazów | 🟢 Niski |
| **Domain** | Yearly | Koszt domeny | 🟢 Niski |

---

## 2. Limity Aplikacyjne

Te limity są **hardcoded** w aplikacji jako zabezpieczenie przed niekontrolowanymi kosztami:

| Limit | Wartość domyślna | Zmienna env | Opis |
|-------|------------------|-------------|------|
| Max stron/dzień | 300 | `MAX_PAGES_PER_DAY` | Limit generowania w jednym batchu |
| Max retry/job | 3 | `MAX_JOB_RETRIES` | Liczba prób przed marked as failed |
| Max równoległych workerów | 5 | `MAX_CONCURRENT_WORKERS` | Paralelizacja przetwarzania |
| Max rozmiar pliku | 10 MB | `MAX_ASSET_SIZE_BYTES` | Upload limit dla assetów |
| Max queue size | 1000 | `MAX_QUEUE_SIZE` | Max jobów w kolejce |
| Rate limit API | 100/min | `API_RATE_LIMIT` | Per IP |
| Job timeout | 30s | `JOB_TIMEOUT_SECONDS` | Max czas na wykonanie joba |
| Batch size | 300 | `BATCH_SIZE` | Liczba jobów per batch |

### 2.1 Konfiguracja Limtów

```typescript
// config/limits.ts
export const limits = {
  maxPagesPerDay: parseInt(process.env.MAX_PAGES_PER_DAY || '300', 10),
  maxJobRetries: parseInt(process.env.MAX_JOB_RETRIES || '3', 10),
  maxConcurrentWorkers: parseInt(process.env.MAX_CONCURRENT_WORKERS || '5', 10),
  maxAssetSizeBytes: parseInt(process.env.MAX_ASSET_SIZE_BYTES || '10485760', 10), // 10MB
  maxQueueSize: parseInt(process.env.MAX_QUEUE_SIZE || '1000', 10),
  apiRateLimit: parseInt(process.env.API_RATE_LIMIT || '100', 10),
  jobTimeoutSeconds: parseInt(process.env.JOB_TIMEOUT_SECONDS || '30', 10),
  batchSize: parseInt(process.env.BATCH_SIZE || '300', 10),
};
```

---

## 3. Kill Switch - Wstrzymanie Generacji

Kill switch to mechanizm pozwalający natychmiast wstrzymać generację nowych stron bez redeploy aplikacji.

### 3.1 Konfiguracja

| Element | Wartość |
|---------|---------|
| **Zmienna env** | `GENERATION_ENABLED` |
| **Wartość domyślna** | `true` |
| **Typ** | Boolean (true/false) |

### 3.2 Zachowanie

| Scenariusz | Zachowanie |
|------------|------------|
| `GENERATION_ENABLED=true` | Normalna praca - cron tworzy batche, workery przetwarzają |
| `GENERATION_ENABLED=false` | Cron nie tworzy nowych batchy, nowe joby nie są queue'owane |
| Istniejące joby | Kontynuują do ukończenia (graceful shutdown) |
| API GET | Działa bez zmian (odczyt z DB) |
| /health | Zwraca status z informacją o GENERATION_ENABLED |

### 3.3 Implementacja

```typescript
// lib/generation-control.ts
export function isGenerationEnabled(): boolean {
  const enabled = process.env.GENERATION_ENABLED;
  
  // Domyślnie włączone (dla bezpieczeństwa przy braku zmiennej)
  if (enabled === undefined || enabled === null) {
    return true;
  }
  
  return enabled.toLowerCase() === 'true';
}

// W cron job:
export async function runDailyBatch() {
  if (!isGenerationEnabled()) {
    logger.info('Generation disabled via GENERATION_ENABLED env, skipping batch');
    return;
  }
  
  // ... normal batch logic
}

// W worker:
export async function processJob(job: Job) {
  if (!isGenerationEnabled()) {
    logger.info('Generation disabled, stopping worker');
    await worker.close();
    process.exit(0);
  }
  
  // ... normal job processing
}
```

### 3.4 Sprawdzenie Statusu

```typescript
// GET /health
{
  "status": "ok",
  "generation": {
    "enabled": true,  // z process.env.GENERATION_ENABLED
    "message": "Generation is running normally"
  }
}
```

---

## 4. Tabela: Darmowe vs Płatne Opcje

### 4.1 Storage (Przechowywanie obrazów)

| Provider | Darmowe | Płatne | Wymaga budżetu? | Uwagi |
|----------|---------|--------|------------------|-------|
| Cloudflare R2 | 1 GB/mc | $0.015/GB/mc | Tak (po przekroczeniu 1GB) | S3-compatible, brak opłat za egress |
| Vercel Blob | 100 GB/mc | $0.15/GB/mc | Tak (po 100GB) | Prosta integracja z Vercel |
| AWS S3 | 5 GB/rok | $0.023/GB/mc | Tak | Standardowy S3 |
| B2 (Backblaze) | 10 GB | $0.006/GB/mc | Tak | Bardzo tani |
| LocalFS | ✅ | $0 | Nie | Tylko dev/local |

### 4.2 Database (Baza danych)

| Provider | Darmowe | Płatne | Wymaga budżetu? | Uwagi |
|----------|---------|--------|------------------|-------|
| SQLite (local) | ✅ | $0 | Nie | Tylko dev, brak skalowania |
| Vercel Postgres | 1 GB | $0.015/GB/mc | Tak | Serverless, pay-per-query |
| Supabase | 500 MB | $25/mc | Tak | Rozbudowany, auth built-in |
| Railway PostgreSQL | - | $5/mc | Tak | Min $5/mc |
| Neon | 0.5 GB | $5/mc | Tak | Serverless PostgreSQL |

### 4.3 Queue/Redis (Kolejka zadań)

| Provider | Darmowe | Płatne | Wymaga budżetu? | Uwagi |
|----------|---------|--------|------------------|-------|
| Upstash | 10K commands/mc | $0.25/100K | Tak | Serverless Redis |
| Redis on Railway | - | $5/mc | Tak | Dedicated Redis |
| In-memory | ✅ | $0 | Nie | Tylko dev, nie dla produkcji |

### 4.4 AI Generation (Generowanie obrazów)

| Provider | Darmowe | Płatne | Wymaga budżetu? | Uwagi |
|----------|---------|--------|------------------|-------|
| Brak (placeholder) | ✅ | $0 | Nie | MVP bez AI - placeholder SVG |
| OpenAI DALL-E 3 | - | $0.04/obraz | Tak | Wysoka jakość |
| OpenAI DALL-E 2 | - | $0.02/obraz | Tak | Średnia jakość |
| Stable Diffusion API | Zmienny | Zmienny | Tak | Różni providerzy |
| Midjourney API | - | $0.03/obraz | Tak | Wysoka jakość |
| Lokalny SD (GPU) | $0 | ~$50/mc (GPU) | Tak | Wymaga własnego GPU |

### 4.5 Hosting/Compute

| Provider | Darmowe | Płatne | Wymaga budżetu? | Uwagi |
|----------|---------|--------|------------------|-------|
| Vercel | ✅ (Hobby) | $20/mc (Pro) | Tak | Prosty deploy |
| Cloudflare Pages | ✅ | $0 | Nie | Wystarczające dla MVP |
| Railway | ✅ (Hobby) | $5/mc | Tak | Flex plans |
| Render | ✅ (Free) | $7/mc (Starter) | Tak | Sleep po 15 min |
| Fly.io | ✅ | $5/mc | Tak | Global edge |

### 4.6 CDN (Opcjonalne)

| Provider | Darmowe | Płatne | Wymaga budżetu? | Uwagi |
|----------|---------|--------|------------------|-------|
| Cloudflare | ✅ | $0 | Nie | Wystarczające |
| Vercel | ✅ | Wliczone | Nie | Z hostingiem |
| AWS CloudFront | 1 GB | $0.085/GB | Tak | Drogi dla małego ruchu |

---

## 5. Rekomendowane Połączenia dla Budżetów

### Opcja A: $0/mc (Całkowicie darmowe)

| Element | Wybór | Koszt |
|---------|-------|-------|
| Hosting | Cloudflare Pages | $0 |
| DB | SQLite (local) lub Neon (free tier) | $0 |
| Storage | Cloudflare R2 (wolumen free) | $0 |
| Queue | In-memory | $0 |
| AI | Brak (placeholder) | $0 |
| **Razem** | | **$0** |

### Opcja B: $5-15/mc (Minimalny koszt)

| Element | Wybór | Koszt |
|---------|-------|-------|
| Hosting | Railway | $5 |
| DB | Railway PostgreSQL | $5 |
| Storage | Cloudflare R2 | $0-5 |
| Queue | Upstash | $0-5 |
| AI | Brak | $0 |
| **Razem** | | **$10-20/mc** |

### Opcja C: $20-50/mc (Pełne rozwiązanie)

| Element | Wybór | Koszt |
|---------|-------|-------|
| Hosting | Vercel Pro | $20 |
| DB | Vercel Postgres | $10 |
| Storage | Vercel Blob | $5 |
| Queue | Upstash | $5 |
| AI | Opcjonalne | $0-20 |
| **Razem** | | **$40-60/mc** |

---

## 6. Bezpieczniki w Aplikacji

### 6.1 Budget Guard

```typescript
// Sprawdź przychód/przed batchem
async function checkBudgetBeforeBatch(): Promise<boolean> {
  const todayCost = await calculateTodayCost();
  const dailyBudget = parseFloat(process.env.DAILY_BUDGET_USD || '10');
  
  if (todayCost >= dailyBudget) {
    logger.warn(`Daily budget exceeded: $${todayCost} >= $${dailyBudget}`);
    return false;
  }
  
  return true;
}
```

### 6.2 Rate Limiter

```typescript
// Backpressure na API
const rateLimit = {
  windowMs: 60 * 1000, // 1 minuta
  max: parseInt(process.env.API_RATE_LIMIT || '100', 10),
};
```

### 6.3 Circuit Breaker

```typescript
// Przy błędach zewnętrznych (AI, Storage)
class CircuitBreaker {
  private failures = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      throw new Error('Circuit breaker open');
    }
    
    try {
      const result = await fn();
      this.failures = 0;
      return result;
    } catch (error) {
      this.failures++;
      if (this.failures >= 5) {
        this.state = 'open';
      }
      throw error;
    }
  }
}
```

### 6.4 Graceful Degradation

| Scenariusz | Zachowanie |
|------------|------------|
| AI unavailable | Użyj placeholder SVG |
| Storage unavailable | Zwraca error z cache'owaniem |
| DB unavailable | Zwraca 503 Service Unavailable |

---

## 7. Zmienne Środowiskowe - Podsumowanie

| Zmienna | Domyślna | Opis |
|---------|----------|------|
| `GENERATION_ENABLED` | `true` | Kill switch |
| `MAX_PAGES_PER_DAY` | `300` | Max stron/dzień |
| `MAX_JOB_RETRIES` | `3` | Max retry |
| `MAX_CONCURRENT_WORKERS` | `5` | Max workerów |
| `MAX_ASSET_SIZE_BYTES` | `10485760` | 10MB |
| `MAX_QUEUE_SIZE` | `1000` | Max w kolejce |
| `API_RATE_LIMIT` | `100` | Per minuta |
| `JOB_TIMEOUT_SECONDS` | `30` | Timeout joba |
| `BATCH_SIZE` | `300` | Rozmiar batcha |
| `DAILY_BUDGET_USD` | `10` | Budżet/dzień |

---

## 8. Historia Zmian

| Data | Wersja | Opis |
|------|--------|------|
| 2026-02-20 | 0.1 | Utworzenie dokumentu |

---

## 9. Następne Kroki

- [ ] Zdecydować o połączeniu opcji (A, B, lub C)
- [ ] Skonfigurować limity w config/
- [ ] Dodać health check z GENERATION_ENABLED
- [ ] Testować kill switch przed deploy
