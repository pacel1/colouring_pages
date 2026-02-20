# LOCAL SETUP - Instrukcja Lokalnego Uruchomienia Projektu

> **Data utworzenia:** 2026-02-20  
> **Wersja:** 0.1  
> **Status:** Planowanie  
> **Powiązane:** PROJECT_BRIEF.md, docs/SETUP_PORTALS.md

---

## 1. Wprowadzenie

Ten dokument zawiera instrukcję lokalnego uruchomienia projektu `colouring-Pages` na różnych systemach operacyjnych.

---

## 2. Minimalne Wersje Narzędzi

| Narzędzie | Minimalna wersja | Uwagi |
|-----------|------------------|-------|
| **Node.js** | 20.9 LTS | Zgodny z Next.js 14+ |
| **pnpm** | 8.0+ | Szybszy od npm/yarn |
| **Git** | 2.40+ | Wspiera git hooks |
| **Docker** | 24.0+ | Opcjonalny (dla dev container) |

**Uwaga:** Jeśli używasz innej wersji Node, sprawdź kompatybilność w `package.json` w polu `engines`.

---

## 3. Sprawdzenie Zainstalowanych Wersji

Przed rozpoczęciem instalacji sprawdź, które narzędzia masz już zainstalowane:

```bash
# Sprawdź wszystkie narzędzia naraz
node -v
pnpm -v
git --version
docker --version
docker-compose --version
```

**Oczekiwane wyniki:**
- `node -v` → v20.9.x lub wyższa
- `pnpm -v` → 8.x lub wyższa
- `git --version` → git version 2.40.x lub wyższa
- `docker --version` → Docker version 24.0.x lub wyższa

---

## 4. Instrukcja Instalacji

### 4.1 Windows

#### Node.js
**Opcja A: Oficjalny instalator (zalecana)**
1. Pobierz installer z: https://nodejs.org/
2. Uruchom `node-v20.x.x-x64.msi`
3. Postępuj zgodnie z instrukcją instalatora
4. Zaznacz "Add to PATH"

**Opcja B: Winget**
```powershell
winget install OpenJS.NodeJS.LTS
```

#### pnpm
```powershell
npm install -g pnpm
```

#### Git
1. Pobierz installer z: https://git-scm.com/download/win
2. Uruchom installer
3. Postępuj zgodnie z instrukcją (zalecane: użyj Git Bash)

#### Docker (opcjonalny)
1. Pobierz Docker Desktop: https://www.docker.com/products/docker-desktop/
2. Uruchom instalator
3. Uruchom Docker Desktop

---

### 4.2 macOS

#### Node.js
**Opcja A: Homebrew (zalecana)**
```bash
brew install node@20
```

**Opcja B: Oficjalny installer**
1. Pobierz installer z: https://nodejs.org/
2. Uruchom `node-v20.x.x.pkg`

#### pnpm
```bash
brew install pnpm
```

#### Git
```bash
# Jeśli masz Xcode CLI:
xcode-select --install

# Lub nowsza wersja:
brew install git
```

#### Docker (opcjonalny)
```bash
brew install --cask docker
```

---

### 4.3 Linux (Ubuntu/Debian)

#### Node.js (NodeSource)
```bash
# Dodaj repozytorium NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Zainstaluj Node.js
sudo apt-get install -y nodejs
```

#### pnpm
```bash
npm install -g pnpm
```

#### Git
```bash
sudo apt update
sudo apt install git
```

#### Docker
```bash
# Oficjalna instrukcja: https://docs.docker.com/engine/install/ubuntu/
sudo apt-get install docker.io docker-compose
sudo usermod -aG docker $USER
```

---

### 4.4 Linux (Fedora/RHEL)

#### Node.js
```bash
# Dodaj repozytorium NodeSource
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -

# Zainstaluj Node.js
sudo dnf install -y nodejs
```

#### pnpm
```bash
npm install -g pnpm
```

#### Git
```bash
sudo dnf install git
```

---

## 5. Jeśli Nie Masz Uprawnień Administratora

### 5.1 Opcja A: WSL2 (Windows)

Jeśli pracujesz na Windows bez uprawnień admina:

1. **Włącz WSL2** (wymaga Windows 10/11):
   ```powershell
   wsl --install
   ```

2. **Użyj Ubuntu z WSL:**
   - Zainstaluj Ubuntu z Microsoft Store
   - Postępuj zgodnie z instrukcją dla Linux

3. **Zalety:**
   - Pełne środowisko Linux
   - Łatwy dostęp do narzędzi CLI

### 5.2 Opcja B: Portable Node.js (Windows)

Jeśli potrzebujesz tylko Node.js bez admina:

1. Pobierz **portable version** z: https://nodejs.org/dist/v20.9.0/
2. Wybierz plik `win-x64.zip` (nie installer!)
3. Rozpakuj do folderu, np. `C:\Tools\node`
4. Dodaj do PATH:
   ```powershell
   $env:PATH += ";C:\Tools\node"
   ```

### 5.3 Opcja C: Pomiń Docker

Jeśli Docker nie jest dostępny:

1. **Użyj SQLite lokalnie** - projekt wspiera SQLite dla dev
2. **Nie uruchamiaj kontenerów** - większość funkcji działa bez Dockera
3. **Ograniczenia:**
   - Nie możesz uruchomić pełnego stacku (Redis, itp.)
   - Możesz użyć in-memory queue dla dev

---

## 6. Konfiguracja Projektu

### 6.1 Pobierz Kod

```bash
# Sklonuj repozytorium
git clone https://github.com/TWOJE_REPO/colouring-Pages.git

# Przejdź do folderu
cd colouring-Pages
```

### 6.2 Zainstaluj Zależności

```bash
# Zainstaluj wszystkie zależności
pnpm install
```

### 6.3 Skonfiguruj Zmienne Środowiskowe

```bash
# Skopiuj przykładowy plik .env
cp .env.example .env
```

Edytuj plik `.env` i ustaw wymagane zmienne:

```bash
# Minimalna konfiguracja dla dev
DATABASE_URL=file:./dev.db
GENERATION_ENABLED=true
NODE_ENV=development
```

### 6.4 Uruchom Projekt

```bash
# Development mode
pnpm dev

# Lub z buildem
pnpm build
pnpm start
```

---

## 7. Weryfikacja - Checklista

### 7.1 Czy Wszystko Działa?

| Sprawdzenie | Komenda | Oczekiwany wynik |
|-------------|---------|------------------|
| Node.js działa | `node -v` | v20.9.x |
| pnpm działa | `pnpm -v` | 8.x |
| Git działa | `git --version` | 2.40.x |
| Docker działa (opcjonalne) | `docker --version` | 24.0.x |
| Zależności zainstalowane | `pnpm install` | bez błędów |
| Projekt się buduje | `pnpm build` | bez błędów |
| Tests przechodzą | `pnpm test` | PASS |
| Dev server startuje | `pnpm dev` | localhost:3000 |

### 7.2 Status: Gotowe / Niegotowe

Po wykonaniu wszystkich kroków, zaznacz co masz:

- [ ] Node.js v20.9+ zainstalowany
- [ ] pnpm 8.0+ zainstalowany
- [ ] Git 2.40+ zainstalowany
- [ ] Docker 24.0+ zainstalowany (opcjonalne)
- [ ] Projekt sklonowany
- [ ] Zależności zainstalowane (`pnpm install`)
- [ ] Plik .env skonfigurowany
- [ ] Build przechodzi (`pnpm build`)
- [ ] Tests przechodzą (`pnpm test`)
- [ ] Dev server działa (`pnpm dev`)

**Jeśli wszystko zaznaczone → JESTEŚ GOTOWY! ✅**

---

## 8. Rozwiązywanie Problemów

### 8.1 Common Issues

| Problem | Rozwiązanie |
|---------|-------------|
| `pnpm: command not found` | Uruchom ponownie terminal lub sourcing |
| `EACCES: permission denied` | Napraw uprawnienia npm: `sudo chown -R $(whoami) ~/.npm` |
| Docker not starting | Sprawdź czy Hyper-V jest włączony (Windows) |
| Node version mismatch | Użyj `nvm` do zarządzania wersjami |

### 8.2 Instalacja nvm (Node Version Manager)

Jeśli potrzebujesz zarządzać wieloma wersjami Node:

**Windows:**
```powershell
# Pobierz nvm-windows
# https://github.com/coreybutler/nvm-windows/releases
```

**macOS/Linux:**
```bash
# Zainstaluj nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Użyj nvm
nvm install 20
nvm use 20
```

---

## 9. Bezpieczeństwo - Zasady

### 9.1 Instalacja

⚠️ **Zawsze instaluj z oficjalnych źródeł:**

| Narzędzie | Oficjalne źródło |
|-----------|------------------|
| Node.js | https://nodejs.org/ |
| pnpm | https://pnpm.io/ |
| Git | https://git-scm.com/ |
| Docker | https://docker.com/ |

### 9.2 Nie Instaluj

- ❌ Node.js z nieoficjalnych stron
- ❌ Pakiety npm z nieznanych źródeł
- ❌ "Gotowe" konfiguracje z forów

---

## 10. Następne Kroki

Po udanym local setup:

1. ✅ Skonfiguruj konta portalowe (docs/SETUP_PORTALS.md)
2. ✅ Skonfiguruj zmienne środowiskowe
3. ✅ Uruchom Epik A (Infra Setup) z docs/BACKLOG.md

---

## 11. Historia Zmian

| Data | Wersja | Opis |
|------|--------|------|
| 2026-02-20 | 0.1 | Utworzenie dokumentu |
