# WORKER HOSTING OPTIONS - Opcje Hostingu Workera

> **Data utworzenia:** 2026-02-20  
> **Wersja:** 0.1  
> **Status:** Planowanie  
> **Powiązane:** docs/ARCHITECTURE.md, docs/COST_AND_LIMITS.md

---

## 1. Wprowadzenie

Worker (konsument BullMQ) musi działać 24/7 aby przetwarzać kolejki zadań. Poniżej znajdują się opcje hostingu z ich plusami, minusami i kosztami.

---

## 2. Porównanie Opcji

### 2.1 Render (Background Worker)

| Aspekt | Szczegóły |
|--------|-----------|
| **Koszt** | Od $7/mc |
| **Typ** | Background Worker |
| **Plusy** | ✅ Łatwa konfiguracja<br>✅ Auto-restart przy crash<br>✅ Integracja z GitHub<br>✅ Dedykowany typ worker |
| **Minusy** | ❌ Min $7/mc<br>❌ Sleep po 15 min (darmowy tier) |

### 2.2 Railway

| Aspekt | Szczegóły |
|--------|-----------|
| **Koszt** | Od $5/mc |
| **Typ** | Hobby/Pro |
| **Plusy** | ✅ Prosty deploy (automatyczny z GitHub)<br>✅ Dobre dla Node.js<br>✅ Łatwa konfiguracja zmiennych env<br>✅ Szybki cold start |
| **Minusy** | ❌ Min $5/mc<br>❌ Może spać po 5 min nieaktywności (hobby) |

### 2.3 Fly.io

| Aspekt | Szczegóły |
|--------|-----------|
| **Koszt** | Od $5/mc |
| **Typ** | Containers/VMs |
| **Plusy** | ✅ Global edge (najbliższy użytkownikowi)<br>✅ Docker native<br>✅ Wysoka dostępność |
| **Minusy** | ❌ Bardziej skomplikowana konfiguracja<br>❌ Wymaga Dockerfile<br>❌ Krzywa uczenia |

### 2.4 VM (DigitalOcean / Linode)

| Aspekt | Szczegóły |
|--------|-----------|
| **Koszt** | Od $4/mc |
| **Typ** | VPS |
| **Plusy** | ✅ Pełna kontrola<br>✅ Najtańsza opcja<br>✅ Można uruchomić wszystko |
| **Minusy** | ❌ Wymaga admin sys (SSH, systemd)<br>❌ Samodzielny monitoring<br>❌ Ręczne aktualizacje |

### 2.5 Lokalnie (Development)

| Aspekt | Szczegóły |
|--------|-----------|
| **Koszt** | $0 |
| **Typ** | localhost |
| **Plusy** | ✅ Darmowe<br>✅ Szybkie testowanie<br>✅ Debugowanie |
| **Minusy** | ❌ Tylko dev!<br>❌ Nie działa 24/7<br>❌ Brak zewnętrznego dostępu |

### 2.6 Vercel Functions (Ograniczenia)

| Aspekt | Szczegóły |
|--------|-----------|
| **Koszt** | $0 (free tier) |
| **Typ** | Serverless Functions |
| **Plusy** | ✅ Darmowe<br>✅ Integracja z Vercel |
| **Minusy** | ❌ Max 10s execution time<br>❌ Max 1000请求/dzień (free)<br>❌ Nie nadaje się do długich jobów |

---

## 3. Rekomendacja

### 🏆 Railway

**Dlaczego Railway:**

1. **Najprostszy deploy** - automatyczny z GitHub
2. **Wystarczający dla MVP** - 300 stron/dzień to mało dla Railwaya
3. **Dobry balans cena/jakość** - $5/mc
4. **Łatwa konfiguracja** - zmienne env w dashboardzie
5. **Dedykowany worker** - nie musisz martwić się o sleep

**Alternatywa:** Render ($7/mc) jeśli wolisz dedykowany Background Worker.

---

## 4. Wymagane Zmienne dla Workera

### 4.1 Obowiązkowe

| Zmienna | Opis | Przykład |
|---------|------|----------|
| `NODE_ENV` | Środowisko | `production` |
| `DATABASE_URL` | Połączenie do DB | `postgresql://...` |
| `GENERATION_ENABLED` | Kill switch | `true` |

### 4.2 Opcjonalne (dla Queue)

| Zmienna | Opis | Przykład |
|---------|------|----------|
| `UPSTASH_REDIS_REST_URL` | Redis URL | `https://xxx.upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | Redis token | `AXxxxx` |

### 4.3 Opcjonalne (dla Storage)

| Zmienna | Opis |
|---------|------|
| `R2_ACCESS_KEY_ID` | R2 access key |
| `R2_SECRET_ACCESS_KEY` | R2 secret |
| `R2_BUCKET_NAME` | Nazwa bucketu |

### 4.4 Opcjonalne (dla AI)

| Zmienna | Opis |
|---------|------|
| `OPENAI_API_KEY` | OpenAI API key |

### 4.5 Limity (opcjonalne)

| Zmienna | Default | Opis |
|---------|---------|------|
| `MAX_CONCURRENT_WORKERS` | 5 | Max równoległych workerów |
| `MAX_JOB_RETRIES` | 3 | Max retry na job |
| `JOB_TIMEOUT_SECONDS` | 30 | Timeout joba |

---

## 5. Konfiguracja Deploy - Railway

### 5.1 Krok po kroku

1. **Załóż konto:** railway.app (z GitHub)
2. **Utwórz projekt:**
   - New Project → Empty Project
   - Nazwa: `colouring-pages-worker`

3. **Dodaj zmienne:**
   - Variables → New Variable
   - Dodaj wszystkie wymagane zmienne

4. **Dodaj repozytorium:**
   - GitHub repo → Connect
   - Ustaw command: `node dist/worker.js` (lub odpowiedni)

5. **Ustaw start command:**
   - Settings → Start Command
   - Wpisz: `node dist/worker.js`

### 5.2 Przykładowa konfiguracja

```json
{
  "name": "colouring-pages-worker",
  "version": "1.0.0",
  "scripts": {
    "start": "node dist/worker.js",
    "build": "tsc"
  },
  "dependencies": {
    "bullmq": "^5.0.0",
    "dotenv": "^16.0.0"
  }
}
```

---

## 6. Konfiguracja Deploy - Render

### 6.1 Krok po kroku

1. **Załóż konto:** render.com (z GitHub)
2. **Utwórz Background Worker:**
   - New → Background Worker
   - Nazwa: `colouring-pages-worker`

3. **Konfiguracja:**
   - Build Command: `npm run build`
   - Start Command: `node dist/worker.js`
   - Environment: Node

4. **Dodaj zmienne:**
   - Advanced → Environment Variables
   - Dodaj wszystkie wymagane zmienne

---

## 7. Bezpieczeństwo

### 7.1 Zasady

⚠️ **Least privilege dla tokenów:**

| Token | Uprawnienia |
|-------|------------|
| `DATABASE_URL` | Read/Write tylko do jednej bazy |
| `UPSTASH_REDIS` | Read/Write tylko do jednego instance |
| `R2_ACCESS_KEY` | Write/Read tylko do jednego bucketu |
| `OPENAI_API_KEY` | Tylko `create` |

### 7.2 Logi

⚠️ **Nie loguj sekretów:**

```typescript
// ✅ POPRAWNIE
logger.info('Processing job', { jobId: job.id, type: job.type });

// ❌ BŁĄD
logger.info('Processing job', { job, data: job.data }); // może zawierać sekrety!
```

---

## 8. Monitoring

### 8.1 Co Monitorować

| Metryka | Narzędzie |
|---------|-----------|
| Worker uptime | Railway/Render dashboard |
| Queue length | BullMQ dashboard |
| Error rate | Log analysis |
| Job processing time | Custom metrics |

### 8.2 Alerty

| Zdarzenie | Akcja |
|-----------|-------|
| Worker down | Email/Slack |
| Queue length > 1000 | Slack |
| Error rate > 5% | Email |

---

## 9. Checklist Przed Deploy

- [ ] Utworzono konto Railway/Render
- [ ] Skonfigurowano zmienne środowiskowe
- [ ] Worker buduje się poprawnie (`npm run build`)
- [ ] Testowano lokalnie z `npm run worker`
- [ ] Ustawiono monitoring (opcjonalne)
- [ ] Zweryfikowano że joby są przetwarzane

---

## 10. Historia Zmian

| Data | Wersja | Opis |
|------|--------|------|
| 2026-02-20 | 0.1 | Utworzenie dokumentu |

---

## 11. Następne Kroki

1. Wybrać hosting (Railway / Render / inny)
2. Skonfigurować zmienne środowiskowe
3. Uruchomić deploy
4. Zweryfikować że worker przetwarza joby
