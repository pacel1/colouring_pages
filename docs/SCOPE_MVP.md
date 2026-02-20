# SCOPE_MVP - Zakres Minimalnego Produktu

> **Data utworzenia:** 2026-02-20  
> **Wersja:** 0.1  
> **Powiązane:** PROJECT_BRIEF.md

---

## 1. MVP - Minimal Viable Product

Minimalny zestaw funkcji wymagany do uruchomienia portalu z kolorowankami.

### 1.1 Core Components

| Component | Opis | Minimalne wymagania |
|-----------|------|---------------------|
| **Web** | Frontend wyświetlający kolorowanki | HTML/CSS/JS, responsywny, SSR |
| **Cron/Scheduler** | Harmonogram generowania stron | Cron job lub scheduler (np. node-cron) |
| **Queue** | Kolejka zadań | In-memory (dla startu) lub Redis |
| **Worker** | Generator treści | Node.js script, przetwarza kolejkę |
| **Database** | Przechowywanie metadanych | SQLite (start) lub PostgreSQL |
| **Storage** | Przechowywanie obrazów | Local filesystem lub S3-compatible |
| **Monitoring** | Sprawdzanie dostępności | Uptime check, basic health endpoint |

### 1.2 Funkcjonalności MVP

- [ ] Generowanie 300 stron/dzień (średnio ~12.5 strony/godzinę)
- [ ] Wyświetlanie kolorowanek na stronie
- [ ] Podstawowa nawigacja/kategorie
- [ ] Podstawowe SEO (meta tags, sitemap)
- [ ] Obsługa wielu języków (PL/EN)
- [ ] Health check endpoint

### 1.3 Stack Technologiczny (MVP)

| Warstwa | Technologia | Uzasadnienie |
|---------|-------------|--------------|
| Frontend | HTML + Vanilla JS | Prosty, szybki, brak framework overhead |
| Backend | Node.js / Express | Jeden język, łatwy worker |
| DB | SQLite | Darmowy, prosty setup |
| Queue | In-memory / Bull | Prosty, integracja z Node.js |
| Storage | Local FS / S3 | Zależny od deployment |
| Hosting | Railway/Render/VPS | Budget: $0-50/mc |

---

## 2. Po MVP (Rozszerzenia po uruchomieniu)

Funkcjonalności do dodania po pomyślnym uruchomieniu MVP.

### 2.1 Monitoring i Observability

| Funkcja | Priorytet | Opis |
|---------|-----------|------|
| Full monitoring | Medium | Prometheus + Grafana |
| Error tracking | Medium | Sentry / LogRocket |
| Performance metrics | Low | Response times, throughput |
| Alerting | Medium | Email/Slack przy błędach |

### 2.2 Optymalizacje

| Funkcja | Priorytet | Opis |
|---------|-----------|------|
| Cache | Medium | Redis / CDN dla obrazów |
| SEO advanced | High | Schema.org, OpenGraph, canonical URLs |
| Sitemap dynamic | High | Automatyczne generowanie sitemap |
| Robots.txt | High | Kontrola crawlowania |

### 2.3 Rozszerzenia Treści

| Funkcja | Priorytet | Opis |
|---------|-----------|------|
| Więcej kategorii | Medium | Docelowo 50+ |
| Więcej języków | Low | DE, FR, ES |
| Tagi/filtrowanie | Medium | Filtry na stronie |
| Search | Low | Wyszukiwarka wewnętrzna |

### 2.4 User Experience

| Funkcja | Priorytet | Opis |
|---------|-----------|------|
| Print-friendly | Medium | Wersja do druku |
| Coloring tools | Low | Podstawowe narzędzia kolorowania |
| Save favorites | Low | Zapisywanie ulubionych |

---

## 3. Nie Robimy Teraz (Out of Scope)

Funkcjonalności celowo wyłączone z MVP.

| Funkcja | Powód |
|---------|-------|
| **Konta użytkowników** | Dodatkowa złożoność, niepotrzebne na start |
| **System płatności** | Monetizacja - po MVP |
| **API publiczne** | Brak zewnętrznych klientów |
| **AI generowanie obrazów** | Koszty, ryzyko jakości - ręczne/ściągane na start |
| **Social features** | Komentarze, oceny - po MVP |
| **Multiplayer** | Zbyt złożone |
| **Mobile app** | Web wystarczy (PWA) |
| **Newsletter** | Po MVP |
| **Blog** | Po MVP (SEO link building) |

---

## 4. Ryzyka

### 4.1 Ryzyka Techniczne

| Ryzyko | Prawdopodobieństwo | Wpływ | Mitygacja |
|--------|-------------------|-------|-----------|
| Limit darmowych tierów (Railway sleep) | Wysokie | Średni | Użyć VPS od $4/mc |
| Rate limiting od Google | Średnie | Wysoki | Zachować crawl budget |
| Duplikacja treści (SEO penalty) | Średnie | Wysoki | Unikalne opisy, canonical URLs |
| Brak indeksowania | Średnie | Wysoki | W sitemap, robots.txt |
| Downtime worker | Niskie | Średni | Monitoring, restarty |

### 4.2 Ryzyka Biznesowe

| Ryzyko | Prawdopodobieństwo | Wpływ | Mitygacja |
|--------|-------------------|-------|-----------|
| DMCA (znaki towarowe) | Średnie | Średni | Brak Disney/Marvel, własne AI |
| Zero ruchu | Średnie | Wysoki | Budget na podstawowe SEO |
| Koszty przekraczają budżet | Niskie | Średni | Monitoring kosztów |

---

## 5. Założenia

### 5.1 Ogólne

| Założenie | Opis |
|-----------|------|
| Budżet | $0-50/miesiąc |
| Czas development | Ograniczony (hobbystyczny projekt) |
| DevOps | Brak dedykowanej osoby |
| Grafiki | Royalty-free lub własne AI (po MVP) |

### 5.2 Techniczne

| Założenie | Opis |
|-----------|------|
| Ruch początkowy | < 1000 odwiedzin/miesiąc |
| Skalowanie | Dopiero przy >10k ruchu |
| SLA | Brak formalnego SLA (hobbystyczny) |

---

## 6. Limit Kosztów

### 6.1 Budżet MVP

| Usługa | Opcja darmowa | Opcja płatna |
|--------|---------------|--------------|
| Hosting web | Railway/Render free | $5-15/mc |
| DB | SQLite (lokalnie) | PostgreSQL $5/mc |
| Storage | Local FS | S3 ~$1/GB |
| Domain | .io free (do kupienia) | ~$10/rok |
| SSL | Let's Encrypt (free) | - |
| Monitoring | Uptime Robot (free) | $5/mc |

### 6.2 Maksymalny budżet miesięczny

**Zalecany:** $0-50/mc  
**Maksymalny:** $100/mc (tylko przy przychodzie)

---

## 7. Definicja "Produkcyjnie Uruchomione"

Patrz: `docs/DEFINITION_OF_DONE.md`

---

## 8. Historia Zmian

| Data | Wersja | Opis |
|------|--------|------|
| 2026-02-20 | 0.1 | Utworzenie dokumentu |
