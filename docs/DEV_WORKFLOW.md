# DEV WORKFLOW - Instrukcja Uruchomienia Development

> **Data utworzenia:** 2026-02-20  
> **Wersja:** 0.1  
> **Status:** Aktywny  
> **Powiązane:** docs/LOCAL_SETUP.md, docker-compose.yml

---

## 1. Wprowadzenie

Ten dokument opisuje jak uruchomić projekt lokalnie w trybie development. Obsługujemy dwie opcje:
- **Z Docker** (zalecana) - PostgreSQL + Redis
- **Bez Dockera** - SQLite lokalnie

---

## 2. Wymagania

### 2.1 Opcja A: Z Dockerem

| Narzędzie | Wersja | Instalacja |
|-----------|--------|------------|
| Docker | 24.0+ | [docker.com](https://docker.com) |
| Docker Compose | 2.0+ | W zestawie z Docker |

### 2.2 Opcja B: Bez Dockera

| Narzędzie | Wersja | Instalacja |
|-----------|--------|------------|
| Node.js | 20.9+ | [nodejs.org](https://nodejs.org) |
| pnpm | 8.0+ | `npm install -g pnpm` |

---

## 3. Opcja A: Z Docker (Zalecana)

### 3.1 Krok po kroku

#### 1. Sklonuj repozytorium

```bash
git clone https://github.com/TWOJE_REPO/colouring-Pages.git
cd colouring-Pages
```

#### 2. Zainstaluj zależności

```bash
pnpm install
```

#### 3. Uruchom infrastrukturę (Docker)

```bash
# Uruchom PostgreSQL + Redis + Adminer
pnpm dev:infra

# Lub alternatywnie:
docker-compose up -d
```

#### 4. Poczekaj aż usługi będą gotowe

```bash
# Sprawdź status
docker-compose ps

# Oczekiwany wynik:
# colouring-pages-postgres   running (healthy)
# colouring-pages-redis     running (healthy)
# colouring-pages-adminer   running
```

#### 5onfiguruj zm. Skienne środowiskowe

```bash
# Skopiuj przykładowy plik
cp .env.example .env

# Edytuj .env i ustaw:
DATABASE_URL=postgresql://devuser:devpassword@localhost:5432/colouring_dev
UPSTASH_REDIS_REST_URL=http://localhost:6379
GENERATION_ENABLED=true
NODE_ENV=development
```

#### 6. Zweryfikuj środowisko

```bash
pnpm check:env
```

#### 7. Uruchom web + worker

```bash
# Wszystko (infra + web + worker)
pnpm dev

# Lub osobno:
pnpm dev:infra   # Tylko Docker
pnpm dev:web     # Tylko web
pnpm dev:worker  # Tylko worker
```

### 3.2 Dostępne Usługi

| Usługa | URL | Dane logowania |
|--------|-----|----------------|
| **Web** | http://localhost:3000 | - |
| **Adminer** (DB UI) | http://localhost:8080 | user: `devuser`, pass: `devpassword`, db: `colouring_dev` |
| **PostgreSQL** | localhost:5432 | user: `devuser`, pass: `devpassword`, db: `colouring_dev` |
| **Redis** | localhost:6379 | bez hasła |

---

## 4. Opcja B: Bez Dockera

### 4.1 Krok po kroku

#### 1. Sklonuj repozytorium

```bash
git clone https://github.com/TWOJE_REPO/colouring-Pages.git
cd colouring-Pages
```

#### 2. Zainstaluj zależności

```bash
pnpm install
```

#### 3. Skonfiguruj zmienne środowiskowe

```bash
# Skopiuj przykładowy plik
cp .env.example .env

# Edytuj .env i ustaw:
# Opcja 1: SQLite lokalnie (najprostsze)
DATABASE_URL=file:./dev.db

# Lub Opcja 2: Neon cloud (jeśli masz konto)
# DATABASE_URL=postgresql://...

GENERATION_ENABLED=true
NODE_ENV=development
```

#### 4. Zweryfikuj środowisko

```bash
pnpm check:env
```

#### 5. Uruchom web

```bash
# Tylko web (bez Redis/Queue)
pnpm dev:web
```

**Uwaga:** Bez Dockera nie uruchomisz Redis (kolejka). Worker będzie działał w trybie uproszczonym (in-memory queue).

---

## 5. Komendy package.json

### 5.1 Główne Komendy

| Komenda | Opis |
|---------|------|
| `pnpm dev` | Uruchom wszystko (infra + web + worker) |
| `pnpm dev:infra` | Uruchom tylko Docker (PostgreSQL + Redis) |
| `pnpm dev:web` | Uruchom tylko web |
| `pnpm dev:worker` | Uruchom tylko worker |

### 5.2 Pomocnicze Komendy

| Komenda | Opis |
|---------|------|
| `pnpm check:env` | Sprawdź zmienne środowiskowe |
| `pnpm lint` | Sprawdź styl kodu |
| `pnpm test` | Uruchom testy |
| `pnpm build` | Build projektu |

### 5.3 Docker Komendy

| Komenda | Opis |
|---------|------|
| `docker-compose up -d` | Uruchom usługi |
| `docker-compose down` | Zatrzymaj usługi |
| `docker-compose ps` | Sprawdź status |
| `docker-compose logs -f` | Zobacz logi |
| `docker-compose restart` | Restart usług |

---

## 6. Najczęstsze Problemy

### 6.1 Docker

| Problem | Rozwiązanie |
|---------|-------------|
| Port 5432 zajęty | Zmień port w docker-compose.yml lub zatrzymaj inny proces |
| Docker nie startuje | Uruchom Docker Desktop |
| PostgreSQL nie działa | Sprawdź logi: `docker-compose logs postgres` |

### 6.2 Node/pnpm

| Problem | Rozwiązanie |
|---------|-------------|
| `pnpm: command not found` | Uruchom terminal ponownie |
| Błąd przy install | Wyczyść cache: `pnpm store prune` |
| Wersja Node za stara | Zainstaluj nvm i użyj Node 20 |

### 6.3 Bazy Danych

| Problem | Rozwiązanie |
|---------|-------------|
| Cannot connect to DB | Sprawdź czy Docker działa i PORT jest wolny |
| Błąd "relation does not exist" | Uruchom migracje: `pnpm db:migrate` |

---

## 7. Bezpieczeństwo (DEV ONLY)

⚠️ **UWAGA:** Hasła w tym dokumencie są tylko dla lokalnego development!

| Element | Wartość DEV | Produkcja |
|---------|--------------|-----------|
| PostgreSQL | `devpassword` | Silne, unikalne hasło |
| Redis | bez hasła | Hasło lub brak (prywatna sieć) |
| Porty | localhost | Tylko wewnętrzna sieć |

**Nigdy nie używaj tych haseł w produkcji!**

---

## 8. Workflow - Podsumowanie

### Z Dockerem (zalecane):

```bash
# 1. Klonuj
git clone https://github.com/TWOJE_REPO/colouring-Pages.git
cd colouring-Pages

# 2. Zainstaluj
pnpm install

# 3. Uruchom infra
pnpm dev:infra

# 4. Skonfiguruj .env
cp .env.example .env
# Edytuj .env

# 5. Uruchom wszystko
pnpm dev
```

### Bez Dockera:

```bash
# 1. Klonuj
git clone https://github.com/TWOJE_REPO/colouring-Pages.git
cd colouring-Pages

# 2. Zainstaluj
pnpm install

# 3. Skonfiguruj .env (SQLite)
cp .env.example .env
# Edytuj .env - użyj DATABASE_URL=file:./dev.db

# 4. Uruchom web
pnpm dev:web
```

---

## 9. Historia Zmian

| Data | Wersja | Opis |
|------|--------|------|
| 2026-02-20 | 0.1 | Utworzenie dokumentu |

---

## 10. Następne Kroki

1. ✅ Skonfigurować Docker Compose
2. ✅ Skonfigurować skrypty package.json
3. ✅ Uruchomić projekt lokalnie
4. ✅ Zweryfikować że wszystko działa
