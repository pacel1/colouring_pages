# COMMIT CONVENTION - Konwencja Commitów

> **Data utworzenia:** 2026-02-20  
> **Wersja:** 0.1  
> **Powiązane:** docs/GITHUB_FLOW.md

---

## 1. Wprowadzenie

Ten dokument opisuje konwencję nazewnictwa commitów. Stosujemy uproszczoną wersję [Conventional Commits](https://www.conventionalcommits.org/).

---

## 2. Format Commita

```
<prefix>: <krótki opis>

[opcjonalnie: dłuższy opis]

[opcjonalnie: stopka z breaking changes]
```

### Przykłady

```bash
# ✅ POPRAWNIE
git commit -m "feat: add user authentication"
git commit -m "fix: resolve login redirect issue"
git commit -m "docs: update API documentation"
git commit -m "refactor: simplify database schema"

# ❌ BŁĄD
git commit -m "added stuff"
git commit -m "fix bug"
git commit -m "WIP"
```

---

## 3. Prefixy

| Prefix | Kiedy używać | Przykład |
|--------|--------------|----------|
| `feat:` | Nowa funkcja | `feat: add user registration` |
| `fix:` | Naprawa błędu | `fix: resolve login timeout` |
| `docs:` | Dokumentacja | `docs: update README` |
| `style:` | Formatowanie (bez zmian logiki) | `style: format code` |
| `refactor:` | Refaktoryzacja (bez zmian funkcjonalności) | `refactor: simplify utils` |
| `test:` | Testy | `test: add unit tests` |
| `chore:` | Zadania porządkowe | `chore: update dependencies` |
| `perf:` | Optymalizacja wydajności | `perf: improve query speed` |
| `ci:` | Zmiany w CI/CD | `ci: add GitHub Actions workflow` |

---

## 4. Nazewnictwo Branchy

Patrz: `docs/GITHUB_FLOW.md` - sekcja 2.

| Typ Branchu | Przykład |
|-------------|----------|
| Feature | `feature/add-user-auth` |
| Fix | `fix/login-redirect` |
| Docs | `docs/update-api` |
| Refactor | `refactor/db-schema` |

---

## 5. Zasady

### 5.1 Tytuł commita

- Max 72 znaki
- Używaj trybu rozkazującego (add, not "added")
- Pierwsza litera mała

### 5.2 Ciało commita

- Oddziel tytuł od ciała pustą linią
- Linie max 72 znaki
- Wyjaśnij "co" i "dlaczego", nie "jak"

### 5.3 Stopka (Breaking Changes)

```
BREAKING CHANGE: zmieniono API z /v1 na /v2
```

---

## 6. Przykładowe Commity

### Nowa funkcja
```
feat: add user registration form

- Add registration form with email validation
- Store user in database with hashed password
- Send welcome email after registration
```

### Naprawa błędu
```
fix: resolve login timeout issue

The login was timing out after 30 seconds on slow connections.
Increased timeout to 60 seconds and added retry logic.
```

### Breaking Change
```
feat: migrate to new auth system

- Replace JWT with session-based auth
- Add rate limiting

BREAKING CHANGE: auth endpoint changed from /api/auth to /api/session
```

---

## 7. Narzędzia (Opcjonalne)

### commitlint

Jeśli chcesz automatycznej walidacji commitów:

```bash
pnpm add -D @commitlint/cli @commitlint/config-conventional
```

**Zalety:** Automatyczna walidacja w CI  
**Wady:** Wymaga dodatkowej konfiguracji, może być zbyt restrykcyjne

**Rekomendacja:** Pomijamy na etapie MVP - ręczna kontrola wystarczy.

---

## 8. Historia Zmian

| Data | Wersja | Opis |
|------|--------|------|
| 2026-02-20 | 0.1 | Utworzenie dokumentu |
