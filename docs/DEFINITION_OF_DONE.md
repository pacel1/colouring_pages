# DEFINITION_OF_DONE - Kryteria Produkcji

> **Data utworzenia:** 2026-02-20  
> **Wersja:** 0.1  
> **Powiązane:** PROJECT_BRIEF.md, docs/SCOPE_MVP.md

---

## 1. Wprowadzenie

Ten dokument definiuje критерии (kryteria), które muszą być spełnione, aby uznać funkcjonalność za "gotową do produkcji".

---

## 2. Testy Wymagane

### 2.1 Testy Jednostkowe (Unit Tests)

| Poziom | Wymagane? | Minimalne pokrycie |
|--------|-----------|-------------------|
| Generator treści | TAK | 80% |
| Queue/Worker | TAK | 80% |
| Helpers/Utils | TAK | 70% |

**Framework:** Jest / Vitest / Node.js built-in

**Przykładowe testy:**
- Generator tworzy poprawny HTML
- Queue dodaje i pobiera zadania
- Walidacja danych wejściowych

### 2.2 Testy Integracyjne (Integration Tests)

| Test | Wymagane? | Opis |
|------|-----------|------|
| API endpointy | TAK | GET /health, GET /colouring/:id |
| DB operations | TAK | CRUD operations |
| Worker execution | TAK | End-to-end generacja strony |

### 2.3 Testy Smoke

| Test | Wymagane? | Opis |
|------|-----------|------|
| Strona główna ładuje się | TAK | 200 OK |
| Health endpoint | TAK | JSON response |
| Worker uruchamia się | TAK | Bez błędów krytycznych |

---

## 3. Logowanie

### 3.1 Wymagania Podstawowe

| Element | Wymaganie | Implementacja |
|---------|-----------|---------------|
| Format | Strukturalny (JSON) | Winston / Pino |
| Poziomy | debug, info, warn, error | - |
| Timestamp | ISO 8601 | - |
| Stack trace | Przy błędach | - |

### 3.2 Co Logować

| Kiedy | Dane |
|-------|------|
| Start worker | Timestamp, job ID |
| Generowanie strony | Page ID, kategoria, język |
| Błędy | Stack trace, kontekst |
| Zakończenie | Czas trwania, sukces/niepowodzenie |
| Statystyki | Liczba stron, czas średni |

### 3.3 Gdzie Logować

| Środowisko | Miejsce | Rotacja |
|------------|---------|---------|
| Lokalne | Console + file | - |
| Produkcja | File + external | Tak (7 dni) |

> **UWAGA:** Nie logować danych wrażliwych (hasła, tokens, dane użytkowników)

---

## 4. Obsługa Błędów

### 4.1 Zasady Ogólne

| Zasada | Opis |
|--------|------|
| Graceful degradation | Błąd jednej strony = nie blokuje innych |
| Retry | Automatyczny retry przy błędach sieciowych (3 próby) |
| Timeout | Maksymalny czas generowania: 30s |
| Alerting | Email/Slack przy >10 błędów w ciągu 1 godziny |

### 4.2 Klasy Błędów

| Klasa | Reakcja |
|-------|---------|
| Validation error | Log + skip (nie retry) |
| Network error | Retry z backoff (1s, 2s, 4s) |
| DB error | Retry + alert |
| Critical (OOM, crash) | Alert + restart worker |

### 4.3 Error Pages

| Środowisko | Zachowanie |
|------------|------------|
| Dev | Stack trace widoczny |
| Prod | Generic error message, ID do logów |

---

## 5. Code Review

### 5.1 Wymagania

| Element | Wymaganie |
|---------|-----------|
| Reviewer | Minimum 1 osoba |
| Self-merge | ZABRONIONE do main |
| Branch protection | main = require review |
| Approvals | Minimum 1 approval |

### 5.2 Checklist Reviewera

- [ ] Kod działa zgodnie z wymaganiami
- [ ] Brak secrets w kodzie
- [ ] Testy przechodzą
- [ ] Logowanie obecne
- [ ] Obsługa błędów
- [ ] Clean code (bez duplication)

---

## 6. CI Checks

### 6.1 Pipeline

| Etap | Narzędzie | Co sprawdza |
|------|-----------|--------------|
| Lint | ESLint / Prettier | Code style, syntax |
| Test | Jest / Vitest | Unit + integration |
| Build | npm build | Kompilacja |
| Security | npm audit | Vulnerabilities |

### 6.2 Wymagania do Merge

| Check | Wymagany? |
|-------|-----------|
| Lint | TAK |
| Tests | TAK (wszystkie) |
| Build | TAK |
| Security audit | OSTRZEŻENIE (nie blokuje) |

### 6.3 Przykładowy .github/workflows

```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build
```

---

## 7. Deploy

### 7.1 Proces

| Środowisko | Metoda | Approval |
|------------|--------|----------|
| Staging | Auto na branch develop | Nie |
| Produkcja | Auto na main | Wymagany approval / manual trigger |

### 7.2 Rollback

| Scenariusz | Akcja |
|------------|-------|
| Failed deploy | Auto rollback do poprzedniego tagu |
| Critical bug | Manual trigger poprzedniego release |

### 7.3 Health Check Po Deploy

- [ ] Strona główna zwraca 200
- [ ] Health endpoint działa
- [ ] Worker uruchamia się
- [ ] Nowe strony generują się poprawnie

---

## 8. Monitoring Produkcji

### 8.1 Minimalny Monitoring

| Metryka | Narzędzie | Alert |
|---------|-----------|-------|
| Uptime | UptimeRobot / Pingdom | TAK |
| Health endpoint | Custom | TAK |
| Error rate | Log analysis | >5% = alert |

### 8.2 Opcjonalne (Po MVP)

| Metryka | Narzędzie |
|---------|-----------|
| Response time | APM (New Relic) |
| Error tracking | Sentry |
| Metrics | Prometheus + Grafana |

---

## 9. Checklist "Gotowe do Produkcji"

### Przed Merge do Main

- [ ] Wszystkie testy przechodzą
- [ ] Lint nie zgłasza błędów
- [ ] Build się udaje
- [ ] Code review approved
- [ ] Logowanie dodane
- [ ] Error handling dodane
- [ ] Health endpoint istnieje
- [ ] Dokumentacja aktualna

### Przed Deploy

- [ ] Testy na staging przechodzą
- [ ] Health check OK
- [ ] Rollback plan gotowy

---

## 10. Historia Zmian

| Data | Wersja | Opis |
|------|--------|------|
| 2026-02-20 | 0.1 | Utworzenie dokumentu |
