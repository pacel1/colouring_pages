# GITHUB FLOW - Konfiguracja Repozytorium i CI/CD

> **Data utworzenia:** 2026-02-20  
> **Wersja:** 0.1  
> **Status:** Aktywny  
> **Powiązane:** docs/SECRETS_POLICY.md, docs/DEFINITION_OF_DONE.md

---

## 1. Wprowadzenie

Ten dokument opisuje jak pracować z repozytorium GitHub, jak tworzyć PR, jakie checks są wymagane i jak trzymać sekrety w bezpiecznym miejscu.

---

## 2. Strategia Branchy

### 2.1 Główne Branchy

| Branch | Rola | Pochodzi z | Merguje do |
|--------|------|------------|------------|
| `main` | Produkcyjny | - | - |
| `develop` | Staging | main | main |

### 2.2 Feature Branchy

| Prefix | Przykład | Cel |
|--------|----------|-----|
| `feature/` | `feature/add-sitemap` | Nowe funkcje |
| `fix/` | `fix/api-error` | Naprawy błędów |
| `docs/` | `docs/readme-update` | Dokumentacja |
| `refactor/` | `refactor/db-schema` | Refaktoryzacja |

### 2.3 Zasady Nazewnictwa

```bash
# ✅ POPRAWNIE
feature/add-user-authentication
fix/login-redirect-error
docs/update-api-docs

# ❌ BŁĄD
My-Feature
fix_bug
new_feature
```

---

## 3. Pull Request Flow

### 3.1 Typowy Cykl Pracy

```
1. main ──────────────────────────────────────► main
          ▲
          │
2.        ├──► feature/xxx ─► PR ─► merge
          │
3.        ├──► fix/xxx ─► PR ─► merge
```

### 3.2 Kroki Tworzenia PR

#### Krok 1: Utwórz Branch

```bash
# Pobierz najnowsze zmiany
git checkout main
git pull origin main

# Utwórz nowy branch
git checkout -b feature/my-new-feature
```

#### Krok 2: Pracuj na Branchu

```bash
# Commituj zmiany
git add .
git commit -m "feat: add new feature"

# Pushuj do zdalnego repo
git push origin feature/my-new-feature
```

#### Krok 3: Otwórz PR

1. Idź do GitHub → repozytorium
2. Kliknij "Compare & pull request"
3. Wypełnij tytuł i opis
4. Dodaj reviewerów
5. Kliknij "Create pull request"

#### Krok 4: Review

1. Reviewerzy przeglądają kod
2. Zostawiają komentarze
3. Autor wprowadza zmiany (jeśli potrzeba)
4. Po akceptacji: PR może być merged

#### Krok 5: Merge

1. Po approved: kliknij "Squash and merge"
2. Usuń branch (opcjonalnie)
3. Branch jest gotowy do deploy

---

## 4. Branch Protection (main)

### 4.1 Jak Skonfigurować

1. Idź do: **Repository → Settings → Branches**
2. Kliknij **Add rule**
3. Wpisz: `main`
4. Włącz poniższe opcje:

### 4.2 Wymagane Ustawienia

| Ustawienie | Wartość | Opis |
|------------|---------|------|
| **Require pull request reviews before merging** | ✅ Tak | Wymagany min 1 reviewer |
| **Require status checks to pass before merging** | ✅ Tak | CI musi przejść |
| **Require branches to be up to date** | ✅ Tak | Branch musi być aktualny |
| **Require conversation resolution** | ❌ Nie | Opcjonalne |
| **Require signed commits** | ❌ Nie | Dla prostoty |
| **Include administrators** | ❌ Nie | Admin też musi przez PR |

### 4.3 Status Checks (Wymagane)

| Check | Opis |
|-------|------|
| `CI` | GitHub Actions - wszystkie testy |
| `lint` | Sprawdzenie stylu kodu |
| `build` | Kompilacja projektu |

---

## 5. Definition of Done dla PR

### 5.1 Checklist Przed Merge

- [ ] Wszystkie testy przechodzą (`npm test` ✅)
- [ ] Lint nie zgłasza błędów (`npm run lint` ✅)
- [ ] Build się udaje (`npm run build` ✅)
- [ ] Code review approved (min 1 osoba)
- [ ] Brak sekretów w kodzie (sprawdź `.env`)
- [ ] Dokumentacja aktualna (jeśli dotyczy)
- [ ] Brak konfliktów z main

### 5.2 Co Robi Reviewer

- [ ] Kod działa zgodnie z wymaganiami
- [ ] Brak sekretów w kodzie
- [ ] Testy są wystarczające
- [ ] Logowanie obecne
- [ ] Obsługa błędów
- [ ] Clean code (bez duplikacji)

---

## 6. Gdzie Trzymać Sekrety

### 6.1 Bezpieczne Miejsca

| Miejsce | Co trzymamy | Przykłady |
|---------|-------------|-----------|
| **GitHub Secrets** | Tokeny dla CI/CD | Vercel token, Docker token |
| **Vercel Env** | Zmienne produkcyjne | DATABASE_URL, API keys |
| **Worker Env** |Zmienne workera | Redis, R2, AI |
| **.env.local** | Lokalne dev | Tylko na Twoim komputerze |

### 6.2 NIGDY Nie Trzymaj w Repo

| Co | Gdzie | Dlaczego |
|----|-------|----------|
| `.env` | Repo | ❌ Zawiera sekrety! |
| API keys | Kod | ❌ Wyciek! |
| Hasła | Commit | ❌ Historia git! |
| Tokeny | Workflow logs | ❌ Widoczne! |

---

## 7. GitHub Actions - Bezpieczeństwo

### 7.1 Jak Używać Sekretów w Workflow

```yaml
# ✅ POPRAWNIE - użyj secrets
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

# ❌ BŁĄD - NIGDY tak!
jobs:
  deploy:
    steps:
      - run: echo "KEY=sk-xxx"  # WYCIEK!
```

### 7.2 Ostrzeżenia ⚠️

| Nie Rób | Dlaczego |
|----------|----------|
| Nie loguj `secrets.*` w workflow | Widoczne w logach! |
| Nie używaj zewnętrznych akcji bez weryfikacji | Ryzyko supply chain |
| Nie commituj plików z sekretami | Wyciek! |

### 7.3 Bezpieczne Logowanie

```typescript
// ✅ POPRAWNIE - loguj bez sekretów
logger.info('Processing job', { 
  jobId: job.id, 
  type: job.type 
});

// ❌ BŁĄD - może zawierać sekrety!
logger.info('Job data', job.data);
```

---

## 8. GitHub Actions - Podstawowy Workflow

### 8.1 Przykładowy .github/workflows/ci.yml

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Lint
        run: pnpm lint
        
      - name: Build
        run: pnpm build
        
      - name: Test
        run: pnpm test
```

### 8.2 Wymagane Secrets w Repo

| Secret | Do czego | Gdzie wziąć |
|--------|----------|-------------|
| `VERCEL_TOKEN` | Deploy do Vercel | Vercel → Settings → Tokens |
| `VERCEL_ORG_ID` | Organizacja Vercel | Vercel → Settings |
| `VERCEL_PROJECT_ID` | Projekt Vercel | Vercel → Settings |

---

## 9. Dodawanie Secrets do GitHub

### 9.1 Kroki

1. Idź do: **Repository → Settings → Secrets and variables → Actions**
2. Kliknij **New repository secret**
3. Wpisz nazwę i wartość
4. Kliknij **Add secret**

### 9.2 Lista Secrets do Dodania

| Secret | Wymagany? | Opis |
|--------|-----------|------|
| `VERCEL_TOKEN` | Tak (dla deploy) | Token Vercel |
| `VERCEL_ORG_ID` | Tak (dla deploy) | ID organizacji |
| `VERCEL_PROJECT_ID` | Tak (dla deploy) | ID projektu |

---

## 10. Checklist Przed Pierwszym Deploy

- [ ] Utworzono konto GitHub
- [ ] Utworzono repozytorium
- [ ] Skonfigurowano branch protection na main
- [ ] Dodano secrets do GitHub
- [ ] Workflow działa (testy przechodzą)
- [ ] Zweryfikowano że PR wymaga review

---

## 11. Historia Zmian

| Data | Wersja | Opis |
|------|--------|------|
| 2026-02-20 | 0.1 | Utworzenie dokumentu |

---

## 12. Następne Kroki

1. Skonfigurować branch protection w GitHub
2. Dodać secrets do repozytorium
3. Zweryfikować workflow
4. Pierwszy deploy!
