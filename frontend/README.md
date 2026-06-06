# MoonBook Frontend

Frontend aplikacji **MoonBook** służącej do zarządzania biblioteką i wypożyczeniami książek. Aplikacja umożliwia przeglądanie katalogu książek, wypożyczanie pozycji, wystawianie opinii oraz zarządzanie zasobami biblioteki przez administratora.

## Technologie

* Next.js 16
* React
* TypeScript
* CSS
* TanStack Query (React Query)
* React Hook Form


## Funkcjonalności

### Użytkownik

* Rejestracja i logowanie
* Przeglądanie katalogu książek
* Wyszukiwanie książek po tytule i autorze
* Filtrowanie książek
* Wyświetlanie szczegółów książki
* Wypożyczanie książek
* Historia wypożyczeń
* Aktualne wypożyczenia
* Dodawanie opinii
* Edycja profilu użytkownika

### Administrator

* Zarządzanie książkami
* Zarządzanie autorami
* Zarządzanie kategoriami
* Zarządzanie użytkownikami
* Blokowanie i odblokowywanie użytkowników
* Edycja danych książek
* Zarządzanie liczbą egzemplarzy

## Struktura projektu

```text
src/
├── app/
│   ├── admin/
│   ├── auth/
│   ├── login/
│   ├── register/
│   ├── welcome/
│   └── (app)/
│       ├── book-order-details/
│       ├── book-order-status/
│       ├── books/
│       ├── books/list
│       ├── faq/
│       ├── library/
│       ├── main/
│       ├── profile/
│       ├── question-order/
│       ├── question-return/
│       ├── sucess-order/
│       └── sucess-return/
│
├── components/
│
├── lib/
│   ├── api.ts
│   └── typeTable.ts
│
├── styles/
└── public/
```


## Instalacja

Sklonuj repozytorium:

```bash
git clone https://github.com/Neyantia/library-management-system.git
cd library-management-system/frontend

npm install
```

Uruchom aplikację:

```bash
npm run dev
```

Aplikacja będzie dostępna pod adresem:

```text
http://localhost:3001
```


## Konfiguracja środowiska

Utwórz plik:

```text
.env.local
```

i dodaj:

```env.local
NEXT_PUBLIC_API_URL=http://localhost:3000
```


## React Query i React Hook Form

Projekt wykorzystuje:
- TanStack Query do pobierania, przechowywania i synchronizacji danych z API.
- React Hook Form do tworzenia formularzy oraz walidacji danych wprowadzanych przez użytkownika.

Instalacja:

```bash
npm install @tanstack/react-query
npm install react-hook-form
```


## Autoryzacja

Dostęp do wybranych stron jest zabezpieczony komponentem `ProtectedRoute`.

Niezalogowani użytkownicy są automatycznie przekierowywani na stronę logowania.


## Autor

Julia O.