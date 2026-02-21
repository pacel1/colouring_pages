# Konfiguracja AdSense

## Krok 1: Załóż konto AdSense

1. Wejdź na https://www.google.com/adsense/start/
2. Zaloguj się na konto Google
3. Wypełnij formularz aplikacyjny
4. Poczekaj na akceptację (1-7 dni)

## Krok 2: Utwórz jednostki reklamowe

Po akceptacji zaloguj się do AdSense i utwórz następujące jednostki:

### 1. Banner (poziomy)
- **Nazwa:** Header Banner
- **Rozmiar:** Responsywny (zalecany)
- **Kod:** np. `1234567890`

### 2. In-Feed (między wynikami)
- **Nazwa:** In-Feed Ad
- **Rozmiar:** Responsywny
- **Kod:** np. `1234567891`

### 3. Rectangle (prostokąt)
- **Nazwa:** Rectangle Ad
- **Rozmiar:** 300x250
- **Kod:** np. `1234567892`

### 4. Sticky (mobile)
- **Nazwa:** Sticky Mobile
- **Rozmiar:** Responsywny
- **Kod:** np. `1234567893`

## Krok 3: Dodaj zmienne środowiskowe

Edytuj plik `.env`:

```env
# AdSense - zastąp XXX swoimi danymi
NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXXX
NEXT_PUBLIC_ADSENSE_SLOT_BANNER=XXXXXXXXXX
NEXT_PUBLIC_ADSENSE_SLOT_INFEED=XXXXXXXXXX
NEXT_PUBLIC_ADSENSE_SLOT_RECTANGLE=XXXXXXXXXX
NEXT_PUBLIC_ADSENSE_SLOT_STICKY=XXXXXXXXXX
```

## Krok 4: Aktualizuj kod

Po uzyskaniu kodów reklamowych, zaktualizuj:

1. `apps/web/src/components/AdSense.tsx` - podmień domyślne slot IDs
2. lub użyj zmiennych środowiskowych

## Rozmiary reklam

| Typ | Rekomendowany rozmiar | Użycie |
|-----|---------------------|--------|
| Banner | 728x90, 970x250, responsywny | Nagłówek strony |
| In-Feed | Responsywny | Między kartami |
| Rectangle | 300x250 | Sidebar |
| Sticky | 320x100 (mobile) | Dół ekranu mobile |

## Typy reklam AdSense

- **Display** - standardowe reklamy graficzne
- **In-feed** - reklamy w liście/gridzie
- **Article** - reklamy w artykułach
- **Multiplex** - reklamy z wieloma kartami

## WAŻNE - Polityka AdSense

1. **Nie klikaj we własne reklamy**
2. **Nie umieszczaj reklam blisko przycisków**
3. **Zachowaj odstępy od treści**
4. **Strona musi mieć treść**
5. **Brak naruszeń polityki Google**

## Testowanie

1. Dodaj swoje dane do `.env`
2. Uruchom `pnpm dev`
3. Sprawdź czy reklamy się wyświetlają
4. Włącz rozszerzenie "Google Publisher Console" w Chrome aby debugować

## Problemy?

- **Reklamy się nie wyświetlają:** Sprawdź kod w Publisher Console
- **Pusty prostokąt:** Zwykle oznacza brak dopasowanych reklam (testuj z reklamami testowymi)
- **Błąd "No ad unit ID":** Podaj prawidłowy adSlot
