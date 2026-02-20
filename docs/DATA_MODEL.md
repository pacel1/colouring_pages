# DATA MODEL - Model Danych dla colouring-Pages

> **Data utworzenia:** 2026-02-20  
> **Wersja:** 0.1  
> **Status:** Planowanie  
> **Powiązane:** PROJECT_BRIEF.md, docs/ARCHITECTURE.md, docs/SCOPE_MVP.md

---

## 1. Słownik Pojęć

| Pojęcie | Definicja | Przykład |
|---------|-----------|----------|
| **Category** | Kategoria tematyczna kolorowanek | "Zwierzęta", "Pojazdy", "Postacie z bajek" |
| **Item** | Pojedyncza kolorowanka (template) | "Kot siedzący", "Samochód wyścigowy" |
| **Variant** | Wariant itemu dla konkretnego języka/formatu | item_id=1, locale='pl', format='svg' |
| **Asset** | Fizyczny plik (obraz) wariantu | plik SVG/PNG na S3/R2 |
| **Job** | Zadanie do wykonania w kolejce | "wygeneruj kolorowankę #123" |
| **Batch** | Grupa jobów do wykonania w jednym cyklu dziennym | batch_id=uuid, 300 jobów |
| **Slug** | URL-friendly identyfikator (unikalny w skali systemu) | "kot-siedziacy-dla-dzieci" |
| **Checksum** | Hash pliku dla idempotencji (SHA-256) | "a1b2c3d4..." |
| **Locale** | Język wariantu | 'pl' = polski, 'en' = angielski |
| **Format** | Format pliku graficznego | 'svg', 'png', 'html' |

---

## 2. Proponowane Tabele

### 2.1 Tabela: `categories`

Kategorie tematyczne kolorowanek (np. Zwierzęta, Pojazdy).

| Pole | Typ | Ograniczenia | Opis |
|------|-----|--------------|------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unikalny ID |
| slug | VARCHAR(100) | NOT NULL, UNIQUE | URL-kompatybilny identyfikator |
| name_pl | VARCHAR(255) | NOT NULL | Nazwa polska |
| name_en | VARCHAR(255) | NOT NULL | Nazwa angielska |
| description_pl | TEXT | NULL | Opis SEO polski |
| description_en | TEXT | NULL | Opis SEO angielski |
| parent_id | UUID | NULL, REFERENCES categories(id) | Kategoria nadrzędna (dla podkategorii) |
| display_order | INTEGER | DEFAULT 0 | Kolejność sortowania |
| is_active | BOOLEAN | DEFAULT true | Czy kategoria jest widoczna |
| created_at | TIMESTAMP | DEFAULT NOW() | Data utworzenia |
| updated_at | TIMESTAMP | DEFAULT NOW() | Data modyfikacji |

**Indeksy:**
- `idx_categories_slug` - UNIQUE na slug
- `idx_categories_parent_id` - dla zapytań podkategorii
- `idx_categories_is_active` - dla filtrowania aktywnych

---

### 2.2 Tabela: `items`

Pojedyncze kolorowanki (template'y do wariantów).

| Pole | Typ | Ograniczenia | Opis |
|------|-----|--------------|------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unikalny ID |
| slug | VARCHAR(255) | NOT NULL, UNIQUE | URL-kompatybilny identyfikator |
| title_pl | VARCHAR(255) | NOT NULL | Tytuł polski |
| title_en | VARCHAR(255) | NOT NULL | Tytuł angielski |
| category_id | UUID | NOT NULL, REFERENCES categories(id) | Kategoria nadrzędna |
| prompt | TEXT | NULL | Prompt do AI (dla przyszłych generacji) |
| keywords | TEXT[] | NULL | Tablica słów kluczowych (tagi) |
| age_min | INTEGER | DEFAULT 3 | Minimalny wiek dziecka |
| age_max | INTEGER | DEFAULT 10 | Maksymalny wiek dziecka |
| difficulty | INTEGER | DEFAULT 1, CHECK (1-3) | Poziom trudności: 1=łatwe, 2=średnie, 3=trudne |
| is_published | BOOLEAN | DEFAULT false | Czy opublikowana |
| published_at | TIMESTAMP | NULL | Data publikacji (NULL = nieopublikowana) |
| created_at | TIMESTAMP | DEFAULT NOW() | Data utworzenia |
| updated_at | TIMESTAMP | DEFAULT NOW() | Data modyfikacji |

**Indeksy:**
- `idx_items_slug` - UNIQUE na slug
- `idx_items_category_id` - dla zapytań po kategorii
- `idx_items_is_published` - dla filtrowania opublikowanych
- `idx_items_published_at` - dla sortowania po dacie
- `idx_items_keywords` - GIN INDEX dla keywords (jeśli PostgreSQL)

---

### 2.3 Tabela: `variants`

Warianty językowe i formatowe itemów (każdy item może mieć wariant PL-SVG, PL-PNG, EN-SVG, EN-PNG).

| Pole | Typ | Ograniczenia | Opis |
|------|-----|--------------|------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unikalny ID |
| item_id | UUID | NOT NULL, REFERENCES items(id) | Item nadrzędny |
| locale | VARCHAR(2) | NOT NULL, CHECK (locale IN ('pl','en')) | Język wariantu |
| format | VARCHAR(10) | NOT NULL, CHECK (format IN ('svg','png','html')) | Format pliku |
| title | VARCHAR(255) | NOT NULL | Tytuł wariantu |
| description | TEXT | NULL | Opis SEO |
| canonical_url | VARCHAR(500) | NOT NULL | Kanoniczny URL strony |
| meta_title | VARCHAR(70) | NULL | Meta title (max 70 znaków dla SEO) |
| meta_description | VARCHAR(160) | NULL | Meta description (max 160 znaków) |
| og_image | VARCHAR(500) | NULL | OpenGraph image URL |
| created_at | TIMESTAMP | DEFAULT NOW() | Data utworzenia |

**Indeksy:**
- `idx_variants_item_id` - dla zapytań po item
- `idx_variants_locale_format` - dla wyszukiwania po języku i formacie
- `idx_variants_canonical_url` - UNIQUE dla kanonicznych URL

**Unikalność:**
- UNIQUE(item_id, locale, format) - jeden wariant per język/format

---

### 2.4 Tabela: `assets`

Fizyczne pliki graficzne (obrazy kolorowanek).

| Pole | Typ | Ograniczenia | Opis |
|------|-----|--------------|------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unikalny ID |
| variant_id | UUID | NOT NULL, REFERENCES variants(id) | Wariant nadrzędny |
| storage_key | VARCHAR(500) | NOT NULL | Ścieżka w storage (np. "coloring/2026/02/variant-uuid.svg") |
| storage_url | VARCHAR(500) | NOT NULL | Publiczny URL do pliku |
| mime_type | VARCHAR(50) | NOT NULL | Typ MIME (image/svg+xml, image/png) |
| file_size | INTEGER | NULL | Rozmiar pliku w bajtach |
| width | INTEGER | NULL | Szerokość w pikselach |
| height | INTEGER | NULL | Wysokość w pikselach |
| checksum | VARCHAR(64) | NOT NULL | SHA-256 hash pliku (dla idempotencji) |
| created_at | TIMESTAMP | DEFAULT NOW() | Data utworzenia |

**Indeksy:**
- `idx_assets_variant_id` - dla zapytań po wariancie
- `idx_assets_storage_key` - dla wyszukiwania w storage
- `idx_assets_checksum` - UNIQUE dla idempotencji (nie zapisuj duplikatów!)

---

### 2.5 Tabela: `jobs`

Zadania w kolejce do wykonania (generowanie, publikacja, sitemap).

| Pole | Typ | Ograniczenia | Opis |
|------|-----|--------------|------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unikalny ID |
| batch_id | UUID | NOT NULL | ID batcha dziennego (do grupowania) |
| job_type | VARCHAR(50) | NOT NULL, CHECK (job_type IN ('generate','publish','sitemap','regenerate')) | Typ zadania |
| item_id | UUID | NULL, REFERENCES items(id) | Powiązany item (nullable) |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'pending', CHECK (status IN ('pending','processing','completed','failed')) | Status zadania |
| priority | INTEGER | DEFAULT 100 | Priorytet (0=najwyższy, 100=najniższy) |
| attempts | INTEGER | DEFAULT 0 | Liczba wykonanych prób |
| max_attempts | INTEGER | DEFAULT 3 | Maksymalna liczba prób |
| last_error | TEXT | NULL | Ostatni błąd (dla debugowania) |
| backoff_seconds | INTEGER | DEFAULT 1 | Aktualny backoff (1, 2, 4, 8...) |
| started_at | TIMESTAMP | NULL | Data rozpoczęcia wykonywania |
| completed_at | TIMESTAMP | NULL | Data zakończenia |
| scheduled_at | TIMESTAMP | DEFAULT NOW() | Kiedy zadanie ma być wykonane |
| created_at | TIMESTAMP | DEFAULT NOW() | Data utworzenia zadania |

**Indeksy:**
- `idx_jobs_status_scheduled` - dla pick'owania pending jobs
- `idx_jobs_batch_id` - dla zapytań po batchu
- `idx_jobs_item_id` - dla zapytań po item
- `idx_jobs_priority` - dla sortowania priorytetów

**Unikalność:**
- UNIQUE(batch_id, job_type, item_id) - idempotencja batcha

---

### 2.6 Tabela: `logs`

Logi operacji systemu (bez PII, bez sekretów!).

| Pole | Typ | Ograniczenia | Opis |
|------|-----|--------------|------|
| id | BIGSERIAL | PK | Unikalny ID |
| level | VARCHAR(10) | NOT NULL, CHECK (level IN ('debug','info','warn','error')) | Poziom logowania |
| source | VARCHAR(100) | NOT NULL | Źródło (worker, web, cron, queue) |
| job_id | UUID | NULL, REFERENCES jobs(id) | Powiązany job (opcjonalne) |
| message | TEXT | NOT NULL | Wiadomość logu |
| context | JSONB | NULL | Dodatkowy kontekst (bez sekretów!) |
| created_at | TIMESTAMP | DEFAULT NOW() | Data logowania |

**Indeksy:**
- `idx_logs_level` - dla filtrowania po poziomie
- `idx_logs_source` - dla filtrowania po źródle
- `idx_logs_created_at` - dla zapytań czasowych
- `idx_logs_job_id` - dla zapytań po job

**Zasady bezpieczeństwa:**
- NIE logować haseł, tokenów, kluczy API
- NIE logować danych osobowych (PII)
- Filtry: replace wartości env przed logowaniem

---

## 3. Zasady Idempotencji

### 3.1 Unikalny Slug

```sql
-- Kategorie i items muszą mieć unikalny slug w skali całego systemu
ALTER TABLE categories ADD CONSTRAINT uq_categories_slug UNIQUE (slug);
ALTER TABLE items ADD CONSTRAINT uq_items_slug UNIQUE (slug);
```

### 3.2 Unikalny Batch ID

```sql
-- Job nie może być dublowany w tym samym batchu
ALTER TABLE jobs ADD CONSTRAINT uq_jobs_batch UNIQUE (batch_id, job_type, item_id);
```

### 3.3 Idempotentne Assety (Checksum)

```sql
-- Nie zapisuj tego samego pliku dwa razy
ALTER TABLE assets ADD CONSTRAINT uq_assets_checksum UNIQUE (checksum);
```

Przed wstawieniem asset:
1. Oblicz SHA-256 pliku
2. Sprawdź czy checksum istnieje w DB
3. Jeśli istnieje → użyj istniejącego asset (zwróć istniejący URL)
4. Jeśli nie → wstaw nowy asset

### 3.4 UPSERT dla Jobów

```sql
-- Wstaw lub zaktualizuj job (idempotencja)
INSERT INTO jobs (batch_id, job_type, item_id, status, scheduled_at)
VALUES ($batch_id, $job_type, $item_id, 'pending', NOW())
ON CONFLICT (batch_id, job_type, item_id) DO NOTHING
RETURNING id;
```

---

## 4. Jobs i Retry

### 4.1 Statusy Jobu

| Status | Opis | Następny krok |
|--------|------|---------------|
| pending | Czeka w kolejce | Przejdź do processing |
| processing | Aktualnie wykonywany | Oczekuj na completion lub failed |
| completed | Zakończony sukcesem | KONIEC |
| failed | Zakończony błędem (przekroczono próby) | Do analizy / ręcznej interwencji |

### 4.2 Strategia Retry

```
Retry z exponential backoff:
├── Próba 1: natychmiast
├── Próba 2: po 1 sekundzie
├── Próba 3: po 2 sekundach
├── Próba 4: po 4 sekundach
└── Próba 5: po 8 sekundach (max)
```

**Implementacja:**
```javascript
const backoffSeconds = Math.min(1 * Math.pow(2, job.attempts), 30);
// Maksymalny backoff: 30 sekund
```

### 4.3 Obsługa Błędów

1. **Błąd krytyczny (np. AI API down):**
   - Zapisz last_error
   - Zwiększ attempts
   - Jeśli attempts < max_attempts → zaplanuj retry z backoff
   - Jeśli attempts >= max_attempts → status = 'failed'

2. **Błąd niekrytyczny (np. timeout upload):**
   - Loguj z level='warn'
   - Retry natychmiast (bez backoff)
   - Max 3 próby bez backoff

3. **Dead Letter:**
   - Po 3 failed jobs z rzędu → alert (email/slack)
   - Tabela `failed_jobs` do ręcznej analizy

### 4.4 Pick Job Algorithm

```sql
-- Pobierz następny job do wykonania
SELECT * FROM jobs
WHERE status = 'pending'
AND scheduled_at <= NOW()
ORDER BY priority ASC, scheduled_at ASC
LIMIT 1
FOR UPDATE SKIP LOCKED;
```

---

## 5. Warianty ORM

### 5.1 Porównanie

| Kryterium | Drizzle | Prisma | Raw SQL |
|-----------|---------|--------|---------|
| **Rozmiar bundle** | ~15 KB | ~50 MB | 0 |
| **Performance** | Bardzo szybki | Wolniejszy | Najszybszy |
| **TypeScript** | Natywny | Generowany | Manualny |
| **Learning curve** | Średni (SQL-like) | Niski | Wysoki |
| **Migracje** | Drizzle Kit | Prisma Migrate | Ręczne |
| **Społeczność** | Rosnąca | Duża | - |
| **SQLite** | ✅ | ✅ | ✅ |
| **PostgreSQL** | ✅ | ✅ | ✅ |

### 5.2 Rekomendacja: Drizzle

**Dlaczego Drizzle:**

1. **Lekki** - minimalny narzut runtime, szybki cold start
2. **TypeScript-first** - pełne typy bez generowania
3. **SQL-like** - łatwo zrozumieć co się dzieje w zapytaniu
4. **Migracje** - wbudowany Drizzle Kit
5. **Multi-database** - SQLite → PostgreSQL bez zmian kodu (prawie)
6. **Idealny dla MVP** - szybki start, niskie koszty

**Alternatywa:**
- Jeśli wolisz łatwiejsze modelowanie i GUI → **Prisma**
- Jeśli potrzebujesz pełnej kontroli i znasz SQL → **Raw SQL**

---

## 6. Schemat Drizzle (Przykład)

```typescript
// db/schema.ts
import { pgTable, uuid, varchar, text, boolean, timestamp, integer, jsonb, serial, check } from 'drizzle-orm/pg-core';

export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  namePl: varchar('name_pl', { length: 255 }).notNull(),
  nameEn: varchar('name_en', { length: 255 }).notNull(),
  descriptionPl: text('description_pl'),
  descriptionEn: text('description_en'),
  parentId: uuid('parent_id').references(() => categories.id),
  displayOrder: integer('display_order').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const items = pgTable('items', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  titlePl: varchar('title_pl', { length: 255 }).notNull(),
  titleEn: varchar('title_en', { length: 255 }).notNull(),
  categoryId: uuid('category_id').notNull().references(() => categories.id),
  prompt: text('prompt'),
  keywords: text('keywords').array(),
  ageMin: integer('age_min').default(3),
  ageMax: integer('age_max').default(10),
  difficulty: integer('difficulty').default(1),
  isPublished: boolean('is_published').default(false),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const jobs = pgTable('jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  batchId: uuid('batch_id').notNull(),
  jobType: varchar('job_type', { length: 50 }).notNull(),
  itemId: uuid('item_id').references(() => items.id),
  status: varchar('status', { length: 20 }).default('pending'),
  priority: integer('priority').default(100),
  attempts: integer('attempts').default(0),
  maxAttempts: integer('max_attempts').default(3),
  lastError: text('last_error'),
  backoffSeconds: integer('backoff_seconds').default(1),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  scheduledAt: timestamp('scheduled_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
});

// ... (variants, assets, logs)
```

---

## 7. Przykładowe Zapytania

### 7.1 Pobierz kolorowanki do wyświetlenia

```sql
SELECT 
  i.*,
  v.title as title,
  v.description as description,
  v.canonical_url,
  v.meta_title,
  v.meta_description,
  a.storage_url as image_url,
  c.slug as category_slug
FROM items i
JOIN variants v ON v.item_id = i.id
JOIN assets a ON a.variant_id = v.id
JOIN categories c ON c.id = i.category_id
WHERE i.is_published = true
AND v.locale = 'pl'
AND v.format = 'svg'
ORDER BY i.published_at DESC
LIMIT 20;
```

### 7.2 Pobierz job do wykonania

```sql
SELECT * FROM jobs
WHERE status = 'pending'
AND scheduled_at <= NOW()
ORDER BY priority ASC, scheduled_at ASC
LIMIT 1
FOR UPDATE SKIP LOCKED;
```

---

## 8. Historia Zmian

| Data | Wersja | Opis |
|------|--------|------|
| 2026-02-20 | 0.1 | Utworzenie dokumentu |

---

## 9. TODO Po Akceptacji

- [ ] Utworzenie schematu Drizzle w `db/schema.ts`
- [ ] Utworzenie pliku migracji
- [ ] Skonfigurowanie połączenia do bazy
- [ ] Testowe zapytania (seed data)
