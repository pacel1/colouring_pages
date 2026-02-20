# BACKLOG - Lista Zadań dla colouring-Pages

> **Data utwor6-02-zenia:** 20220  
> **Wersja:** 0.1  
> **Status:** Planowanie  
> **Powiązane:** PROJECT_BRIEF.md, docs/ARCHITECTURE.md, docs/SCOPE_MVP.md, docs/DEFINITION_OF_DONE.md, docs/DATA_MODEL.md

---

## 1. Struktura Epików (A–L)

| Epik | Nazwa | Opis | Priorytet |
|------|-------|------|-----------|
| **A** | Infra Setup | Node.js, TS, ESLint, Prettier, folder structure | 🔴 Wysoki |
| **B** | Database | SQLite + Drizzle schema, migracje | 🔴 Wysoki |
| **C** | API Core | Express/Fastify, health endpoint, podstawowe routes | 🔴 Wysoki |
| **D** | Web Frontend | HTML/CSS/JS, wyświetlanie kolorowanek | 🔴 Wysoki |
| **E** | Worker/Queue | Kolejka zadań, job processor | 🟡 Średni |
| **F** | Cron/Scheduler | Harmonogram generowania (300 stron/dzień) | 🟡 Średni |
| **G** | Content Generation | Generowanie treści (szablony) | 🟡 Średni |
| **H** | Storage Integration | S3/R2 upload, pobieranie assetów | 🟢 Niski |
| **I** | SEO Setup | Meta tags, sitemap, robots.txt | 🟢 Niski |
| **J** | Multi-language | Obsługa PL/EN | 🟢 Niski |
| **K** | Testing | Unit tests, integration tests, smoke tests | 🔴 Wysoki |
| **L** | Monitoring | Health checks, logging, alerting | 🟢 Niski |

---

## 2. Szczegółowe Zadania

### Epik A: Infra Setup

| ID | Zadanie | Definition of Done | Zależności |
|----|---------|-------------------|------------|
| A1 | Inicjalizacja projektu Node.js + TS | Projekt kompiluje się bez błędów `npm run build` | - |
| A2 | ESLint + Prettier | Brak lint errors `npm run lint` | A1 |
| A3 | Folder structure | Katalogi: src/, tests/, docs/, config/ | A1 |
| A4 | CI Pipeline (GitHub Actions) | Pipeline działa na push | A2 |

---

### Epik B: Database

| ID | Zadanie | Definition of Done | Zależności |
|----|---------|-------------------|------------|
| B1 | Drizzle schema (6 tabel) | Schema kompiluje się `drizzle-kit generate` | A1 |
| B2 | Migracje DB | Tabele utworzone w SQLite | B1 |
| B3 | Seed data (kategorie) | ≥10 kategorii w DB | B2 |
| B4 | DB connection pool | Connection działa, testy przechodzą | B2 |

---

### Epik C: API Core

| ID | Zadanie | Definition of Done | Zależności |
|----|---------|-------------------|------------|
| C1 | Express/Fastify server | Server startuje na porcie 3000 | A1 |
| C2 | Health endpoint /health | Zwraca 200 + JSON {status: "ok"} | C1 |
| C3 | GET /api/categories | Zwraca listę kategorii z DB | B2, C1 |
| C4 | GET /api/items/:slug | Zwraca item z variantami i assetami | B2, C1 |
| C5 | Error handling middleware | Zwraca 404/500 z odpowiednim JSON | C1 |

---

### Epik D: Web Frontend

| ID | Zadanie | Definition of Done | Zależności |
|----|---------|-------------------|------------|
| D1 | Homepage (lista kategorii) | 200 OK, responsywny (mobile/desktop) | C3 |
| D2 | Page kolorowanki /kolorowanka/:slug | Wyświetla obraz + meta tags | C4 |
| D3 | Kategoria page /kategoria/:slug | Lista kolorowanek w kategorii | C3 |
| D4 | 404 error page | Custom error page (nie default browser) | C1 |
| D5 | CSS styling | Estetyczny, responsywny design | D1 |

---

### Epik E: Worker/Queue

| ID | Zadanie | Definition of Done | Zależności |
|----|---------|-------------------|------------|
| E1 | Queue setup (Bull/In-memory) | Queue dodaje i pobiera joby | A1 |
| E2 | Job processor | Przetwarza joby z status pending→processing→completed | E1 |
| E3 | Retry logic | Exponential backoff (1s,2s,4s), max 3 próby | E2 |
| E4 | Job: generate_page | Generuje stronę (item + variant + asset) | E2 |

---

### Epik F: Cron/Scheduler

| ID | Zadanie | Definition of Done | Zależności |
|----|---------|-------------------|------------|
| F1 | Cron job (node-cron) | Uruchamia się codziennie o określonej godzinie | E1 |
| F2 | Batch creator | Tworzy batch z 300 jobów w DB | F1, B2 |
| F3 | Schedule logic | Joby zaplanowane z priorytetami | F2 |
| F4 | Daily stats | Loguje liczbę wygenerowanych stron | F3 |

---

### Epik G: Content Generation

| ID | Zadanie | Definition of Done | Zależności |
|----|---------|-------------------|------------|
| G1 | Template engine (HTML) | Generuje poprawny HTML z meta tags | A1 |
| G2 | Image placeholder | Generuje placeholder SVG (gdy brak obrazu) | G1 |
| G3 | SEO meta generator | Generuje title, description, canonical | G1 |
| G4 | OpenGraph generator | Generuje og:image URL | G3 |

---

### Epik H: Storage Integration

| ID | Zadanie | Definition of Done | Zależności |
|----|---------|-------------------|------------|
| H1 | S3/R2 client setup | Client inicjalizuje się z env vars | A1 |
| H2 | Upload asset | Plik uploaduje się na storage | H1 |
| H3 | Get asset URL | Pobiera publiczny URL assetu | H1 |
| H4 | Delete asset | Usuwa asset z storage | H1 |

---

### Epik I: SEO Setup

| ID | Zadanie | Definition of Done | Zależności |
|----|---------|-------------------|------------|
| I1 | Dynamic sitemap.xml | Sitemap generuje się dla wszystkich stron | G1 |
| I2 | robots.txt | Plik istnieje i jest poprawny | I1 |
| I3 | Canonical URLs | Każda strona ma canonical URL | C4 |
| I4 | Schema.org (Structured Data) | Poprawny JSON-LD dla kolorowanek | G3 |

---

### Epik J: Multi-language

| ID | Zadanie | Definition of Done | Zależności |
|----|---------|-------------------|------------|
| J1 | i18n setup (PL/EN) | Działa switch języków | A1 |
| J2 | Locale middleware | Rozpoznaje locale z URL/header | J1 |
| J3 | Translated routes | /pl/ i /en/ prefix działają | J2 |
| J4 | Translation strings | Kluczowe teksty przetłumaczone | J3 |

---

### Epik K: Testing

| ID | Zadanie | Definition of Done | Zależności |
|----|---------|-------------------|------------|
| K1 | Unit tests setup (Vitest) | Testy uruchamiają się `npm test` | A1 |
| K2 | DB tests | CRUD operacje testowane | K1, B2 |
| K3 | API tests (supertest) | Endpointy zwracają poprawne dane | K1, C4 |
| K4 | Worker tests | Job processing testowany | K1, E2 |
| K5 | Coverage ≥70% | Pokrycie kodu ≥70% | K2-K4 |
| K6 | Smoke tests | /health zwraca 200, strona główna ładuje się | K1 |

---

### Epik L: Monitoring

| ID | Zadanie | Definition of Done | Zależności |
|----|---------|-------------------|------------|
| L1 | Structured logging (Winston/Pino) | JSON logs z timestamp + level + message | A1 |
| L2 | Error tracking | Stack trace w logach przy błędach | L1 |
| L3 | Uptime check | Health endpoint zwraca 200 | C2 |
| L4 | Alerting setup | Alert przy >10 błędów/godzinę (opcjonalne) | L3 |
| L5 | Performance logging | Czas generowania strony w logach | L1 |

---

## 3. Mapa Zależności

```
A (Infra) ─────────────┐
  │                     │
  ├─→ B (Database) ────→ C (API) ────→ D (Frontend)
  │       │                     │
  │       │                     ↓
  │       └────→ E (Queue) ────→ F (Cron) ────→ G (Content)
  │               │                     │
  │               │                     ↓
  │               ↓              ←────── H (Storage)
  │         (standalone)
  │
  └─→ I (SEO) ←────── J (i18n)
        ↑
        │
        └──────────────────────→ K (Testing) → L (Monitoring)
```

---

## 4. Strategia PR (Rekomendowana: Per Epik)

### Opcja A: 1 PR per Epik (Rekomendowana)

| PR # | Epik | Zawiera | DoD |
|------|------|---------|-----|
| #1 | A | Infra setup | Build + lint działa |
| #2 | B | Database | Migracje działają |
| #3 | C | API Core | Health endpoint + CRUD |
| #4 | D | Web Frontend | Strony wyświetlają się |
| #5 | E | Worker/Queue | Joby się przetwarzają |
| #6 | F | Cron/Scheduler | Batche się tworzą |
| #7 | G | Content Generation | Strony się generują |
| #8 | H | Storage | Upload działa |
| #9 | I | SEO | Sitemap + robots.txt |
| #10 | J | i18n | PL/EN działają |
| #11 | K | Testing | Testy przechodzą ≥70% |
| #12 | L | Monitoring | Logging + health |

**Zalety:**
- ✅ Łatwiejszy code review
- ✅ Szybszy feedback
- ✅ Mniejsze ryzyko merge conflicts
- ✅ Każdy PR = gotowy kawałek funkcjonalności

### Opcja B: 1 Duży PR na MVP

| PR # | Zawiera |
|------|---------|
| #1 | Wszystkie epiki (A→L) |

**Zalety:**
- ✅ Szybciej "gotowe"

**Wady:**
- ⚠️ Trudny review (dużo kodu)
- ⚠️ Duże ryzyko conflicts
- ⚠️ Trudniej testować iteracyjnie

---

## 5. Blokery (NIEOKREŚLONE - Do Ustalenia)

| Bloker | Status | Wpływ na Backlog |
|--------|--------|------------------|
| **Hosting provider** | 🔴 NIEOKREŚLONE | Nie można deployować |
| **Storage provider** | 🟡 NIEOKREŚLONE | H1-H4 wymaga wyboru |
| **Domain name** | 🟡 NIEOKREŚLONE | SEO (canonical URLs) |
| **AI generation** | 🟡 Opcjonalne | MVP bez AI (placeholder) |

---

## 6. Checklist Definition of Done (Przed Merge)

Każde zadanie musi spełniać:

- [ ] Kod działa zgodnie z wymaganiami
- [ ] Brak secrets w kodzie (zmienne w .env)
- [ ] Testy przechodzą (jeśli dotyczy epiku K)
- [ ] Lint nie zgłasza błędów
- [ ] Build się udaje
- [ ] Logowanie dodane
- [ ] Error handling dodane
- [ ] Health endpoint działa
- [ ] Dokumentacja aktualna

---

## 7. Przyjęta Strategia: Opcja A (1 PR per Epik)

**Uzasadnienie:**
- Mniejsze, bardziej granularne PR = lepszy code review
- Szybszy feedback loop
- Łatwiejsze rollback w przypadku problemów
- Każdy epik = logiczna całość funkcjonalna

---

## 8. Historia Zmian

| Data | Wersja | Opis |
|------|--------|------|
| 2026-02-20 | 0.1 | Utworzenie backlogu |

---

## 9. Następne Kroki

1. Zaakceptować strategię PR (Opcja A)
2. Rozpocząć implementację od Epiku A (Infra Setup)
3. Utworzyć issue w GitHub dla każdego epiku
