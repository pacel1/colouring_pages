# CONTENT_POLICY - Polityka Treści i Zasady Jakości

> **Data utworzenia:** 2026-02-20  
> **Wersja:** 0.1  
> **Powiązane:** PROJECT_BRIEF.md, docs/SCOPE_MVP.md

---

## 1. Cel i Zakres

### 1.1 Cel Polityki

Celem tej polityki jest zapewnienie, że automatycznie generowane strony z kolorowankami:
- Mają rzeczywistą wartość dla użytkowników
- Nie naruszają praw autorskich ani znaków towarowych
- Nie generują "pustej masówki" (thin content)
- Są bezpieczne dla dzieci

### 1.2 Zakres

Polityka obowiązuje dla:
- Wszystkich generowanych stron
- Opisów i metadanych
- Obrazów (kolorowanek)
- Linków wewnętrznych

---

## 2. Dozwolone Tematy (ALLOWED)

### 2.1 Kategorie Główne

| Kategoria | Przykłady |
|-----------|-----------|
| Zwierzęta | Kot, pies, słoń, lew, żaba, motyl, rybka |
| Pojazdy | Samochód, ciężarówka, samolot, statek, pociąg |
| Bajki | Kopciuszek, Czerwony Kapturek (własna wersja) |
| Natura | Drzewa, kwiaty, owoce, warzywa |
| Postacie | Dzieci, rodzina, zwierzęta anthropomorphic |
| Abecadło | Litery A-Z z obrazkami |
| Cyfry | Liczby 0-9 z obrazkami |
| Kształty | Koło, kwadrat, trójkąt |
| Sporty | Piłka nożna, koszykówka, pływanie |
| Sezonowe | Święta Bożego Narodzenia, Halloween, Wielkanoc |

### 2.2 Motywy Edukacyjne

| Typ | Opis |
|-----|------|
| Nauka pisania | Litery do śledzenia |
| Nauka liczenia | Cyfry z obiektami do liczenia |
| Kolorowanki edukacyjne | Kształty, kolory, przeciwieństwa |

---

## 3. Zakazane Tematy (NIEOKREŚLONE - WYMAGA DECYZJI)

> **UWAGA:** Poniższe kategorie są PROPONOWANE do zakazania. Wymagają Twojej akceptacji.

### 3.1 Kwestie Bezpieczeństwa

| Kategoria | Przykłady | Status |
|-----------|-----------|--------|
| Przemoc | Broń, walki, krew, gore, katastrofy | PROPONOWANY ZAKAZ |
| Treści dorosłe | Nagość, erotyka, sugerujące | PROPONOWANY ZAKAZ |
| Narkotyki | Używki, alkohol, papierosy, leki | PROPONOWANY ZAKAZ |
| Niebezpieczne zachowania | Ogień, wysokość, niebezpieczne zabawki | PROPONOWANY ZAKAZ |

### 3.2 Kwestie Prawne i Etyczne

| Kategoria | Przykłady | Status |
|-----------|-----------|--------|
| Polityka | Partie, politycy, flagi narodowe | PROPONOWANY ZAKAZ |
| Religia | Kontrowersyjne tematy religijne | PROPONOWANY ZAKAZ |
| Rasizm | Diskryminacja, stereotypy | PROPONOWANY ZAKAZ |
| Znaki towarowe | Disney, Marvel, Pokemon, Harry Potter | PROPONOWANY ZAKAZ |
| Postacie z mediów | Bez licencji | PROPONOWANY ZAKAZ |

### 3.3 PYTANIA DO CIEBIE

> **PYTANIE 1:** Czy akceptujesz powyższą listę zakazanych tematów?

> **PYTANIE 2:** Czy chcesz zakazać WSZYSTKICH znaków towarowych (Disney, Marvel, Pokemon, itp.) czy tylko niektórych?

> **PYTANIE 3:** Czy są inne tematy, które Twoim zdaniem powinny być zakazane?

---

## 4. Minimalna Wartość dla Użytkownika

### 4.1 Wymagania dla Każdej Strony

Każda wygenerowana strona **MUST** zawierać:

| Element | Wymaganie | Minimalna wartość |
|---------|-----------|-------------------|
| **Obraz preview** | TAK | Podgląd kolorowanki |
| **Obraz do druku** | TAK | Format PDF lub duży PNG |
| **Opis PL** | TAK | Minimum 50 słów |
| **Opis EN** | TAK | Minimum 50 słów |
| **Linki podobne** | TAK | Minimum 3 linki do podobnych kolorowanek |
| **Meta title** | TAK | Unikalny, max 60 znaków |
| **Meta description** | TAK | Unikalny, max 160 znaków |
| **Struktura h1/h2** | TAK | Poprawna hierarchia |

### 4.2 Wykluczenia (NIE PUBLIKOWAĆ)

Strona NIE zostanie opublikowana jeśli:

| Warunek | Przyczyna |
|---------|-----------|
| Obraz < 800x600px | Zbyt mała jakość |
| Opis < 50 słów | Thin content |
| Duplikat tytułu | Duplikacja |
| Brak obrazu | Niekompletna strona |
| Błąd w obrazie | Uszkodzony plik |

---

## 5. Checklista Jakości Strony

### 5.1 Automatyczna Weryfikacja (Worker)

| Element | Wymagane? | Narzędzie |
|---------|-----------|-----------|
| Unikalny tytuł | TAK | Hash porównanie |
| Unikalny opis (>70% podobieństwa = skip) | TAK | Text similarity |
| Obraz istnieje | TAK | File exists check |
| Obraz > min rozmiaru | TAK | Image dimensions |
| HTML valid | TAK | HTML parser |
| Canonical URL | TAK | Auto-add |
| Sitemap updated | TAK | Auto-update |

### 5.2 Ręczna Weryfikacja (Sampling)

| Parametr | Wartość |
|----------|---------|
| Częstotliwość | 1% stron dziennie (3 strony przy 300/dzień) |
| Metoda | Losowy wybór z logów generowania |
| Osoba | Właściciel projektu |
| Kryteria | Jakość obrazu, poprawność tekstu, użyteczność |

### 5.3 Process Sampling

```
1. Worker loguje wszystkie wygenerowane strony (page_id, kategoria, język)
2. Codziennie o 18:00 skrypt wybiera 1% losowo
3. Generuje raport PDF z wybranymi stronami
4. Wysyła email/Slack z linkiem do przeglądu
5. Przeglądający ocenia: OK / DO POPRAWY / DO USUNIĘCIA
6. Feedback trafia do generatora (jako training data)
```

---

## 6. Anti-Spam Zasady

### 6.1 Zakazane Praktyki

| Praktyka | Konsekwencja |
|----------|--------------|
| Doorway pages | Natychmiastowe usunięcie |
| Keyword stuffing | Strona nie indeksowana |
| Link farms | Google penalty |
| Cloaking | Ban z indeksu |
| Duplikacja treści | Skip przy generowaniu |

### 6.2 Zasady SEO

| Zasada | Opis |
|--------|------|
| Naturalny język | Opisy napisane dla ludzi, nie botów |
| Unikalność | Każda strona = unikalny tytuł + opis + obraz |
| Canonical URLs | Wszystkie strony mają canonical |
| Sitemap | Automatyczne dodawanie nowych stron |
| Robots.txt | Poprawna konfiguracja |

---

## 7. Źródło Grafik

### 7.1 Dozwolone Źródła

| Źródło | Status | Uwagi |
|--------|--------|-------|
| Własne AI (Midjourney/Stable Diffusion) | DOZWOLONE | Po selekcji człowieka |
| Royalty-free (Unsplash, Pexels) | DOZWOLONE | Sprawdzić licencję |
| Public Domain | DOZWOLONE | Brak ograniczeń |
| Własne rysunki | DOZWOLONE | Najbezpieczniejsza opcja |

### 7.2 Zakazane Źródła

| Źródło | Powód |
|--------|-------|
| Google Images (scraped) | Ryzyko DMCA |
| Znaki towarowe | Pozew |
| Strony z watermarks | Nieprofesjonalne |

---

## 8. Monitoring Jakości

### 8.1 Metryki Śledzone

| Metryka | Cel |
|---------|-----|
| % stron z błędami | < 1% |
| Średnia długość opisu | > 100 słów |
| Duplikaty wykryte | 0 (auto-skip) |
| Sampling - złe strony | < 5% |

### 8.2 Alerty

| Zdarzenie | Akcja |
|-----------|-------|
| > 10 błędów/godzinę | Alert email |
| > 5% złych próbek | Przegląd całego batcha |
| Duplikacja wykryta | Usunięcie duplikatów |

---

## 9. Założenia

| Założenie | Opis |
|-----------|------|
| Budżet na grafika | $0 (AI + royalty-free) |
| Czas na weryfikację | 15 min dziennie |
| Poziom automatyzacji | Wysoki (min manual work) |

---

## 10. Historia Zmian

| Data | Wersja | Opis |
|------|--------|------|
| 2026-02-20 | 0.1 | Utworzenie dokumentu |
