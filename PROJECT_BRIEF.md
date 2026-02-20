# PROJECT_BRIEF - Portal Programmatic SEO z Kolorowankami

> **Data utworzenia:** 2026-02-20  
> **Wersja:** 0.1  
> **Status:** Planowanie

---

## 1. Informacje Ogólne

| Pole | Wartość |
|------|---------|
| **Nazwa projektu** | colouring-Pages |
| **Typ** | Portal programmatic SEO |
| **Opis** | Generator stron z kolorowankami dla dzieci, działający w trybie programmatic SEO |
| **Języki** | Polski (PL), Angielski (EN) |

---

## 2. Wymagania Funkcjonalne (USTALONE)

| Wymaganie | Wartość | Uwagi |
|-----------|---------|-------|
| Pojemność generowania | 300 stron/dzień | Na start |
| Liczba kategorii | ~50 | Do doprecyzowania |
| Języki treści | PL, EN | Wielojęzyczny portal |
| Typ treści | Kolorowanki | Obrazy do kolorowania |

---

## 3. Stack Technologiczny

> **Status:** DO UZUPEŁNIENIA

| Technologia | Wybór | Uwagi |
|-------------|-------|-------|
| Frontend | TBD | |
| Backend | TBD | |
| Baza danych | TBD | |
| Worker/Generator | TBD | |
| Hosting | TBD | |

---

## 4. NIEOKREŚLONE (Do ustalenia)

Poniższe elementy wymagają decyzji przed rozpoczęciem implementacji.

### 4.1 Domeny

| Opcja | Proponowana |
|-------|-------------|
| A | kolorowanki-dla-dzieci.pl |
| B | colouring-pages.io |
| C | do-ustalenia-w-trakcie |

### 4.2 Cele i KPI

| Metryka | Proponowane wartości |
|---------|----------------------|
| Ruch miesięczny | 10,000 / 50,000 / 100,000 odwiedzin |
| Indeksowane strony | 1,000 / 5,000 / 10,000 |
| CTR z Google | do-ustalenia |
| Konwersje | brak / affiliate / ads |

### 4.3 Zakazane Tematy i Znaki

| Kategoria | Przykłady | Propozycja |
|-----------|-----------|------------|
| Przemoc | walki, broń, krew | ZABRONIONE |
| Treści dorosłe | nagość, erotyka | ZABRONIONE |
| Polityka | partie, politycy | ZABRONIONE |
| Religia | kontrowersyjne tematy | OGRANICZONE |
| Znaki chronione | Disney, Marvel, Pokemon | ZABRONIONE (ryzyko DMCA) |

> **PYTANIE:** Czy są inne tematy/znaki do zakazania?

### 4.4 Budżet

| Scenariusz | Miesięczny koszt |
|------------|------------------|
| A | $0 (dev only, darmowe tiery) |
| B | $50/mc (podstawowy hosting) |
| C | $200/mc (pełne rozwiązanie) |

### 4.5 System Operacyjny Serwera

| Opcja | Opis |
|-------|------|
| Linux (Ubuntu 22.04) | Najpopularniejszy, tani w utrzymaniu |
| Windows Server | Wymagany przy specyficznych technologiach |

### 4.6 Hosting Workera

| Provider | Opcja | Limit darmowy |
|----------|-------|---------------|
| Railway | Hobby | Tak (ograniczony) |
| Render | Free | Tak (sleep po 15 min) |
| Fly.io | Free | Tak |
| VPS (DigitalOcean/Linode) | Podstawowy | Od $4/mc |
| AWS/GCP | Cloud | Pay-as-you-go |

### 4.7 Format Kolorowanek

| Format | Zalety | Wady |
|--------|--------|------|
| SVG | Skalowalne, mały rozmiar, edytowalne CSS | Większy rozmiar przy szczegółach |
| PNG | Łatwe generowanie | Rastrowy, trudniejsze skalowanie |
| HTML5 Canvas | Interaktywne, generowanie po stronie klienta | SEO: wymaga SSR |

### 4.8 CMS / Zarządzanie Treścią

| Opcja | Opis |
|-------|------|
| Brak (JSON + render) | Prosty, szybki, brak backendu |
| Strapi | Headless CMS, REST API |
| Sanity | Headless CMS, GROQ |
| Directus | Headless CMS, SQL |

### 4.9 Źródło Grafik (Kolorowanek)

| Źródło | Koszt | Jakość |
|--------|-------|--------|
| AI (Midjourney/Stable Diffusion) | Czas + ewentualnie $ | Wysoka, wymaga selekcji |
| Royalty-free API (Shutterstock/Unsplash) | Płatny API | Zmienna |
| Własne (grafik) | Czas + $ | Kontrolowana jakość |
| Public Domain | Darmowe | Zmienna |

### 4.10 Monetyzacja

| Model | Opis |
|-------|------|
| Brak | Projekt edukacyjny/hobbystyczny |
| Google AdSense | Reklamy display |
| Affiliate | Linki do produktów (książki, kredki) |
| Premium | Płatne kategorie/formaty |

---

## 5. Bezpieczeństwo

> **UWAGA:** Ten plik NIE zawiera żadnych sekretów.

| Zasada | Implementacja |
|--------|---------------|
| Brak kluczy API | Wszystkie klucze jako zmienne środowiskowe |
| Brak haseł | Tylko zmienne env (np. `DATABASE_URL`) |
| Brak tokenów | OAuth tokens w .env |

---

## 6. Następne Kroki

- [ ] Zatwierdzić domenę
- [ ] Ustalić budżet miesięczny
- [ ] Wybrać stack technologiczny
- [ ] Zdecydować o formatach kolorowanek
- [ ] Zdefiniować pełną listę kategorii

---

## 7. Historia Zmian

| Data | Wersja | Opis |
|------|--------|------|
| 2026-02-20 | 0.1 | Utworzenie dokumentu, wstępne dane |
