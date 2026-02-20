# SECRETS POLICY - Polityka Zarządzania Sekretami

> **Data utworzenia:** 2026-02-20  
> **Wersja:** 0.1  
> **Status:** Aktywny  
> **Powiązane:** docs/SETUP_PORTALS.md, docs/COST_AND_LIMITS.md

---

## 1. Wprowadzenie

Ten dokument definiuje zasady zarządzania sekretami, kluczami API i innymi wrażliwymi danymi w projekcie `colouring-Pages`.

---

## 2. Definicje

| Termin | Definicja |
|--------|-----------|
| **Sekret** | Wrażliwa informacja, która nie powinna być publiczna |
| **Zmienna środowiskowa** | Konfiguracja przechowywana poza kodem |
| **Token API** | Klucz do autoryzacji w zewnętrznych usługach |

---

## 3. Co Jest Sektretem?

### 3.1 Wrażliwe Dane (NIE wchodzą do repo)

| Typ | Przykłady |
|-----|-----------|
| **Klucze API** | `OPENAI_API_KEY`, `R2_SECRET_ACCESS_KEY` |
| **Hasła** | Hasła do baz danych, kont |
| **Tokeny** | `UPSTASH_REDIS_REST_TOKEN`, JWT secrets |
| **Connection strings** | `DATABASE_URL` z hasłem |
| **Prywatne klucze** | SSH keys, GPG keys |

### 3.2 Publiczne Dane (WCHODZĄ do repo)

| Typ | Przykłady |
|-----|-----------|
| **Konfiguracja bez wartości** | `.env.example` |
| **Kod aplikacji** | Wszystkie pliki źródłowe |
| **Konfiguracja publiczna** | `tsconfig.json`, `package.json` |
| **Dokumentacja** | Pliki w `docs/` |

---

## 4. Zasady Bezpieczeństwa

### 4.1 Zasady Ogólne

| Zasada | Opis |
|--------|------|
| **Zero sekretów w kodzie** | Nigdy nie hardkoduj sekretów |
| **Zero sekretów w README** | Nie wklejaj kluczy w dokumentację |
| **Zero sekretów w issues** | Nie pisz o sekretach w GitHub |
| **Zero sekretów w workflow** | Nie wklejaj kluczy w GitHub Actions |
| **Pliki .env w .gitignore** | Zawsze ignoruj pliki env |

### 4.2 Zasady z GitHub Actions

⚠️ **Nigdy nie wklejaj sekretów bezpośrednio w workflow!**

```yaml
# ❌ NIE RÓB TAK!
jobs:
  deploy:
    steps:
      - run: echo "key=sk-1234567890"  # ZABRONIONE!

# ✅ RÓB TAK:
jobs:
  deploy:
    env:
      OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}  # OK!
    steps:
      - run: echo "Using key from secrets"
```

### 4.3 Zasady z .env

⚠️ **Nigdy nie commituj plików .env!**

```bash
# ✅ POPRAWNIE
.env              # IGNOROWANE przez .gitignore
.env.example      # WCHODZI do repo (bez wartości!)

# ❌ BŁĄD
.env              # Jeśli jest w git → natychmiast zmień klucze!
.env z prawdziwymi wartościami
```

---

## 5. Struktura Plików Env

### 5.1 .env.example (WCHODZI do repo)

Ten plik zawiera **tylko nazwy zmiennych** bez wartości:

```bash
# ✅ POPRAWNIE
DATABASE_URL=postgresql://user:password@host/db  # Przykład bez prawdziwych danych

# ✅ POPRAWNIE (wartości placeholder)
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 5.2 .env (NIE wchodzi do repo)

```bash
# ✅ POPRAWNIE - rzeczywiste wartości
DATABASE_URL=postgresql://jan:mojehaslo123@neon.tech/mojabaza
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 6. Kontrola Kosztów - Budżety Miękkie

⚠️ **OpenAI i podobne usługi mają budżety miękkie!**

### 6.1 Problem

- Budżety mogą być przekroczone automatycznie
- Brak limitów = niekontrolowane koszty
- Potrzebny **kill switch**

### 6.2 Rozwiązanie

| Mechanizm | Zmienna | Opis |
|-----------|---------|------|
| **Kill switch** | `GENERATION_ENABLED` | Wstrzymaj generację |
| **Limit dzienny** | `MAX_PAGES_PER_DAY=300` | Max stron/dzień |
| **Limit retry** | `MAX_JOB_RETRIES=3` | Max prób na job |
| **Budget guard** | `DAILY_BUDGET_USD=10` | Max $ dziennie |

### 6.3 Procedura przy przekroczeniu budżetu

1. **Monitoruj** koszty w dashboardzie dostawcy
2. **Ustaw** `GENERATION_ENABLED=false` (kill switch)
3. **Sprawdź** co zużywa budżet
4. **Zrestartuj** gdy budżet będzie ok

---

## 7. Rotacja Kluczy

### 7.1 Harmonogram

| Typ klucza | Częstotliwość |
|------------|---------------|
| AI (OpenAI) | Co 90 dni |
| Database | Co 6 miesięcy |
| Storage (R2) | Co 90 dni |
| Redis | Co 90 dni |

### 7.2 Procedura Rotacji

1. Wygeneruj nowy klucz w panelu dostawcy
2. Zaktualizuj zmienną w Vercel/.env
3. Zweryfikuj działanie
4. Usuń stary klucz

---

## 8. Kto Ma Dostęp?

### 8.1 Zasada Least Privilege

Każdy token powinien mieć **minimalne uprawnienia**:

| Token | Minimalne uprawnienia |
|-------|----------------------|
| `OPENAI_API_KEY` | Tylko `create` (generowanie) |
| `DATABASE_URL` | Read/Write do jednej bazy |
| `R2_ACCESS_KEY` | Write/Read do jednego bucketu |
| `UPSTASH_REDIS` | Read/Write do jednego instance |

### 8.2 Dostęp

| Rola | Dostęp do sekretów? |
|------|---------------------|
| Developer | .env.local (własny komputer) |
| Vercel | Environment Variables (dashboard) |
| CI/CD | Secrets (GitHub) |
| Public | Brak |

---

## 9. Checklist Przed Commit

Przed każdym `git commit` sprawdź:

- [ ] Nie dodałem sekretów do kodu
- [ ] Nie dodałem pliku .env do git
- [ ] Używam tylko .env.example jako wzoru
- [ ] Nie piszę o sekretach w commit messages
- [ ] Nie piszę o sekretach w issues
- [ ] Kill switch (`GENERATION_ENABLED`) jest skonfigurowany

---

## 10. Procedura Naruszenia

Jeśli sekret wyciekł:

1. **Natychmiast** zmień klucz w panelu dostawcy
2. **Natychmiast** zrotuj wszystkie powiązane klucze
3. **Sprawdź** logi dostępu (czy ktoś użył klucza)
4. **Zresetuj** zmienne środowiskowe wszędzie
5. **Dokumentuj** incydent

---

## 11. Historia Zmian

| Data | Wersja | Opis |
|------|--------|------|
| 2026-02-20 | 0.1 | Utworzenie polityki |
