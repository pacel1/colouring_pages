# Jak uruchomić web

> **Ostatnia aktualizacja:** 2026-02-20

---

## Wymagania

| Narzędzie | Wersja | Jak sprawdzić |
|-----------|--------|----------------|
| Node.js | 20+ | `node --version` |
| pnpm | 8+ | `pnpm --version` |
| Docker | - | `docker --version` |

---

## Krok po kroku

### 1. Zainstaluj zależności

```bash
pnpm install
```

### 2. Skopiuj plik środowiskowy (opcjonalne)

```bash
cp .env.example .env
```

### 3. Uruchom Docker (opcjonalne - dla bazy danych)

```bash
docker-compose up -d
```

To uruchomi:
- **PostgreSQL** na porcie 5432
- **Redis** na porcie 6379
- **Adminer** (opcjonalnie) na porcie 8080

### 4. Uruchom aplikację web

```bash
pnpm --filter web dev
```

### 5. Otwórz w przeglądarce

```
http://localhost:3000
```

Jeśli port 3000 jest zajęty, Next.js wybierze następny wolny (np. 3001).

---

## Co powinno się pojawić

### W terminalu

```
▲ Next.js 14.2.5
- Local: http://localhost:3000

 ✓ Ready in 1853ms
```

### W przeglądarce

- Strona główna z napisem "colouring-Pages - Kolorowanki dla dzieci"
- Menu nawigacyjne (Strona główna, Kategorie)
- Footer z informacją o prawach autorskich

---

## Logi

### Gdzie patrzeć

Logi aplikacji pojawiają się w terminalu, w którym uruchomiłeś `pnpm --filter web dev`.

### Poziomy logowania

| Poziom | Kiedy używać | Kolor w konsoli |
|--------|---------------|-----------------|
| `info` | Normalne operacje | Biały/szary |
| `warn` | Ostrzeżenia | Żółty |
| `error` | Błędy | Czerwony |
| `debug` | Szczegóły deweloperskie | Szary |

### Przykładowe logi

```
GET / 200 in 2107ms          # Strona główna
GET /kategorie 200 in 418ms  # Lista kategorii
GET /kolorowanki/kotek 200   # Strona kolorowanki
```

---

## Najczęstsze problemy

### Problem: Port 3000 jest zajęty

**Rozwiązanie:**
```bash
# Znajdź proces na porcie 3000
netstat -ano | findstr :3000

# Lub po prostu uruchom - Next.js wybierze inny port
pnpm --filter web dev
```

### Problem: Brak node_modules

**Rozwiązanie:**
```bash
pnpm install
```

### Problem: Błąd połączenia z bazą danych

**Rozwiązanie:**
```bash
# Uruchom Docker
docker-compose up -d

# Sprawdź status kontenerów
docker ps

# Sprawdź logi
docker-compose logs postgres
```

### Problem: Build error

**Rozwiązanie:**
```bash
# Wyczyść cache i zbuduj od nowa
rm -rf apps/web/.next
pnpm --filter web build
```

### Problem: Błąd "Cannot find module"

**Rozwiązanie:**
```bash
# Usuń node_modules i zainstaluj ponownie
rm -rf node_modules
pnpm install
```

### Problem: ESLint / TypeScript błędy

**Rozwiązanie:**
```bash
# Sprawdź lint
pnpm lint

# Sprawdź typy
pnpm typecheck
```

---

## Przydatne komendy

```bash
# Rozwój
pnpm --filter web dev          # Uruchom dev server

# Build
pnpm --filter web build       # Build produkcyjny

# Lint i typecheck
pnpm lint                     # Sprawdź lint
pnpm typecheck               # Sprawdź typy

# Docker
docker-compose up -d          # Uruchom
docker-compose down          # Zatrzymaj
docker-compose logs -f       # Logi
```

---

## Wsparcie

Jeśli napotkasz inny problem:

1. Sprawdź logi w terminalu
2. Sprawdź dokumentację w `docs/`
3. Sprawdź Issues na GitHubie
