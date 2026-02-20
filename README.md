# colouring-Pages

Programmatic SEO portal z kolorowankami dla dzieci.

## 🎯 Cel Projektu

Generowanie stron z kolorowankami dla dzieci (300 stron/dzień) w modelu programmatic SEO.

## 🚀 Szybki Start

```bash
# Zainstaluj zależności
pnpm install

# Uruchom infrastrukturę (Docker: PostgreSQL + Redis)
pnpm dev:infra

# Skonfiguruj zmienne środowiskowe
cp .env.example .env

# Uruchom web
pnpm dev:web
```

Zobacz [docs/DEV_WORKFLOW.md](docs/DEV_WORKFLOW.md) dla pełnej instrukcji.

## 📁 Struktura Projektu

```
colouring-Pages/
├── apps/
│   ├── web/           # Frontend (HTML/JS lub Next.js)
│   └── worker/        # Worker (BullMQ consumer)
├── packages/
│   └── shared/        # Współdzielone: config, types, utils
├── docs/              # Dokumentacja projektu
├── scripts/           # Utility scripts
└── docker-compose.yml # Dev infra (PostgreSQL + Redis)
```

## 📚 Dokumentacja

| Dokument | Opis |
|----------|------|
| [docs/DEV_WORKFLOW.md](docs/DEV_WORKFLOW.md) | Jak uruchomić lokalnie |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Architektura systemu |
| [docs/BACKLOG.md](docs/BACKLOG.md) | Lista zadań do wykonania |
| [docs/SECRETS_POLICY.md](docs/SECRETS_POLICY.md) | Zarządzanie sekretami |
| [docs/GITHUB_FLOW.md](docs/GITHUB_FLOW.md) | Proces PR i CI/CD |

## 🛠️ Wymagania

| Narzędzie | Wersja |
|-----------|--------|
| Node.js | 20.9+ LTS |
| pnpm | 8.0+ |
| Docker | 24.0+ (opcjonalne) |

## 📦 Komendy

```bash
# Development
pnpm dev              # Uruchom wszystko
pnpm dev:infra        # Tylko Docker (DB + Redis)
pnpm dev:web          # Tylko web

# Build & Test
pnpm build            # Build wszystkich pakietów
pnpm test             # Testy

# Checks
pnpm check:env        # Sprawdź zmienne środowiskowe
pnpm lint             # Sprawdź styl kodu

# Docker
pnpm docker:up        # Uruchom kontenery
pnpm docker:down      # Zatrzymaj kontenery
```

## 🔧 Konfiguracja

Zmienne środowiskowe są pobierane z pliku `.env`. Zobacz `.env.example` jako wzór.

```bash
# Skopiuj wzór
cp .env.example .env

# Edytuj .env z własnymi wartościami
```

## 📄 Licencja

MIT License - zobacz [LICENSE](LICENSE) dla szczegółów.

---

**Uwaga:** Ten projekt nie zawiera żadnych sekretów ani kluczy API. Wszystkie dane wrażliwe są przechowywane w zmiennych środowiskowych.
