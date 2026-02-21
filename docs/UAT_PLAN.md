# UAT Plan - Testy Akceptacyjne

Niniejszy dokument opisuje scenariusze testowe dla nietechnicznych użytkowników.

---

## Środowiska

| Środowisko | URL | Kiedy używać |
|------------|-----|---------------|
| **Dev** | localhost:3000 | Rozwój lokalny |
| **Test** | Preview PR | Przed merge |
| **Staging** | (do uzupełnienia) | Przed prod |
| **Prod** | (do uzupełnienia) | Po release |

---

## Scenariusze testowe

### 1. Home Page

**Kroki:**
1. Otwórz stronę główną
2. Sprawdź czy widoczny jest nagłówek
3. Sprawdź czy są linki do kategorii

**Oczekiwany wynik:**
- Strona ładuje się w < 3 sekundy
- Widoczny nagłówek "Kolorowanki dla dzieci"
- Są linki do kategorii

**✅ PASS** / **❌ FAIL**

---

### 2. Lista kategorii

**Kroki:**
1. Kliknij "Kategorie" lub przejdź do /kategorie
2. Sprawdź czy widoczne są kategorie

**Oczekiwany wynik:**
- Lista kategorii się wyświetla
- Każda kategoria ma nazwę i miniaturę

**✅ PASS** / **❌ FAIL**

---

### 3. Strona kolorowanki

**Kroki:**
1. Wejdź w dowolną kategorię
2. Kliknij w wybraną kolorowankę
3. Sprawdź czy obrazek się wyświetla

**Oczekiwany wynik:**
- Strona kolorowanki się ładuje
- Widoczny obrazek do kolorowania

**✅ PASS** / **❌ FAIL**

---

### 4. Worker - generowanie (tylko Test/Prod)

**Kroki:**
1. Zaloguj się do panelu admin (/admin)
2. Wejdź w Jobs
3. Sprawdź czy są joby w kolejce

**Oczekiwany wynik:**
- Panel admina działa
- Widoczne joby (jeśli są w kolejce)

**✅ PASS** / **❌ FAIL**

---

### 5. Baza danych (tylko Test/Prod)

**Kroki:**
1. Sprawdź czy aplikacja się łączy z DB
2. Zobacz czy są dane (kategorie, kolorowanki)

**Oczekiwany wynik:**
- Brak błędów połączenia
- Dane są widoczne

**✅ PASS** / **❌ FAIL**

---

### 6. Storage - upload (tylko Test/Prod)

**Kroki:**
1. Sprawdź czy obrazy się wyświetlają
2. Sprawdź czy PDF można pobrać

**Oczekiwany wynik:**
- Obrazy ładują się z R2/cloud storage
- Linki do pobierania działają

**✅ PASS** / **❌ FAIL**

---

### 7. Sitemap

**Kroki:**
1. Wejdź na /sitemap.xml
2. Sprawdź czy plik się generuje

**Oczekiwany wynik:**
- Sitemap jest wygenerowany
- Zawiera adresy URL

**✅ PASS** / **❌ FAIL**

---

### 8. SEO - Meta Tagi

**Kroki:**
1. Otwórz stronę kolorowanki
2. Sprawdź źródło strony (View Source)
3. Szukaj `<title>` i `<meta name="description">`

**Oczekiwany wynik:**
- Title zawiera nazwę kolorowanki
- Description jest obecny

**✅ PASS** / **❌ FAIL**

---

## Checklist Go / No-Go

Przed release zaznacz wszystkie:

```
[ ] Scenariusz 1 - Home Page         : ✅ / ❌
[ ] Scenariusz 2 - Kategorie         : ✅ / ❌
[ ] Scenariusz 3 - Kolorowanka       : ✅ / ❌
[ ] Scenariusz 4 - Worker            : ✅ / ❌
[ ] Scenariusz 5 - DB                : ✅ / ❌
[ ] Scenariusz 6 - Storage           : ✅ / ❌
[ ] Scenariusz 7 - Sitemap           : ✅ / ❌
[ ] Scenariusz 8 - SEO               : ✅ / ❌

[ ] Brak krytycznych błędów w logach
[ ] Testy jednostkowe zielone (pnpm test)
[ ] Testy E2E zielone (pnpm test:e2e:playwright)
```

### Decyzja:

**✅ GO** - Wszystkie testy przeszły, można wdrażać!

**❌ NO-GO** - Są błędy, napraw przed wdrożeniem.

---

## Gdy test FAILUJE

| Problem | Co sprawdzić | Kto naprawia |
|---------|--------------|--------------|
| Strona nie ładuje się | Next.js logs, console | Dev |
| Worker nie działa | Redis connection, worker logs | Dev |
| Brak danych w DB | Migracje, seed | Dev |
| Obrazy się nie wyświetlają | R2 config, public URL | Dev |
| Sitemap pusty | Cron job, data in DB | Dev |
| SEO brakuje | Page component | Dev |

### Jak zgłosić błąd:

1. Zrób zrzut ekranu błędu
2. Zapisz URL strony
3. Opisz kroki do reprodukcji
4. Wyślij do dev team

---

## Komendy dla dev

```bash
# Testy jednostkowe
pnpm test

# Testy E2E
pnpm test:e2e:playwright

# Dev server
pnpm dev
```

---

## Kontakt

W razie pytań: zgłoś issue na GitHub lub napisz do dev team.
