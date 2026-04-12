# Library Management System – API

REST API do zarządzania biblioteką, zbudowane w oparciu o NestJS, Prisma oraz PostgreSQL.

Aplikacja obsługuje autoryzację użytkowników, zarządzanie katalogiem książek, egzemplarzami, wypożyczeniami, recenzjami oraz automatyczne oznaczanie przeterminowanych wypożyczeń.

---

## Funkcjonalności

- Autoryzacja JWT (access + refresh token)
- Zarządzanie profilem użytkownika
- Role i autoryzacja dostępu
- Zarządzanie książkami, autorami i kategoriami
- Obsługa egzemplarzy książek (inventory)
- Wypożyczanie i zwracanie książek
- Wypożyczanie wielu książek (koszyk)
- Recenzje tylko dla użytkowników, którzy zwrócili książkę
- Automatyczne oznaczanie wypożyczeń jako przeterminowane
- Dokumentacja Swagger
- Endpoint health check

---

## Technologie

- NestJS
- Prisma ORM
- PostgreSQL
- Swagger
- JWT
- Argon2
- Jest

---

## Struktura projektu

```
src/
├── common/
├── config/
├── modules/
│   ├── auth/
│   ├── users/
│   ├── catalog/
│   ├── borrowings/
│   ├── reviews/
│   └── health/
├── prisma/
├── app.module.ts
└── main.ts
```

---

## Główne zasady biznesowe

### Książki

- Książka należy do jednej kategorii i może mieć wielu autorów
- Książka posiada wiele egzemplarzy fizycznych
- Usuwanie książek jest realizowane jako soft delete (`isActive`)
- Nieaktywne książki nie mogą być wypożyczane
- Liczba egzemplarzy może być zwiększana lub zmniejszana
- Wypożyczone egzemplarze nie mogą zostać usunięte
- Usunięte egzemplarze pozostają w systemie (historia)

### Wypożyczenia

- Użytkownik wypożycza książkę po `bookId`, nie po `bookCopyId`
- System automatycznie wybiera pierwszy dostępny egzemplarz
- Możliwe jest wypożyczenie wielu książek (koszyk)
- Operacja koszyka jest atomowa (wszystko albo nic)
- Zwrot książki aktualizuje status wypożyczenia i egzemplarza
- Przeterminowane wypożyczenia są oznaczane automatycznie (cron)

### Recenzje

- Użytkownik może dodać recenzję tylko do książki, którą zwrócił
- Jedna recenzja na użytkownika na książkę
- Lista książek zwraca średnią ocen
- Szczegóły książki zwracają:
  - średnią ocen
  - liczbę recenzji
  - przykładowe recenzje

---

## Dokumentacja API

Swagger dostępny pod adresem:

```
http://localhost:3000/api
```

---

## Endpointy

### Auth

- `POST /auth/register` – rejestracja użytkownika
- `POST /auth/login` – logowanie
- `POST /auth/refresh` – odświeżenie tokenu
- `GET /auth/me` – aktualny użytkownik
- `POST /auth/logout` – wylogowanie
- `POST /auth/logout-all` – wylogowanie ze wszystkich sesji

### Users

- `GET /users/me` – profil użytkownika
- `PATCH /users/me` – aktualizacja profilu
- `PATCH /users/me/password` – zmiana hasła
- `POST /users` – utworzenie użytkownika
- `GET /users` – lista użytkowników
- `PATCH /users/{id}/status` – zmiana statusu użytkownika
- `GET /users/{id}` – szczegóły użytkownika

### Authors

- `GET /authors` – lista autorów
- `POST /authors` – dodanie autora
- `PATCH /authors/{id}` – edycja autora
- `DELETE /authors/{id}` – usunięcie autora

### Categories

- `GET /categories` – lista kategorii
- `POST /categories` – dodanie kategorii
- `PATCH /categories/{id}` – edycja kategorii
- `DELETE /categories/{id}` – usunięcie kategorii

### Books

- `POST /books` – dodanie książki
- `GET /books` – lista książek
- `GET /books/{id}` – szczegóły książki
- `PATCH /books/{id}` – edycja książki
- `DELETE /books/{id}` – usunięcie książki
- `PATCH /books/{id}/copies` – zmiana liczby egzemplarzy

### Borrowings

- `POST /borrowings` – wypożyczenie książki
- `POST /borrowings/cart` – wypożyczenie wielu książek
- `POST /borrowings/{id}/return` – zwrot książki
- `GET /borrowings/me/current` – aktualne wypożyczenia
- `GET /borrowings/me/history` – historia wypożyczeń

### Reviews

- `POST /books/{id}/reviews` – dodanie recenzji

### Health

- `GET /health` – sprawdzenie działania API

---

## Instalacja

```bash
git clone https://github.com/Neyantia/library-management-system.git
cd library-management-system/backend
npm install
```

## Quick Start

```bash
git clone https://github.com/Neyantia/library-management-system.git
cd backend
npm install
npm run db:setup
npm run start:dev
```

---

## Konfiguracja środowiska

Utwórz pliki:

- `.env.development`
- `.env.test`

Przykład:

```
DATABASE_URL=postgresql://user:password@localhost:5432/library_db
JWT_ACCESS_SECRET=secret
JWT_REFRESH_SECRET=secret
PORT=3000
```

---

## Baza danych

### Development

### Szybki start (rekomendowane)

```bash
npm run db:setup
```

---

### Alternatywnie (krok po kroku)

```bash
npm run db:dev:migrate
npm run db:generate
npm run db:dev:seed
```

Opcjonalnie reset bazy:

```bash
npm run db:dev:reset
npm run db:generate
```

---

### Test

```bash
npm run db:test:migrate
npm run db:generate
npm run db:test:seed
```

Opcjonalnie reset:

```bash
npm run db:test:reset
npm run db:generate
```

### Visualization

```bash
npx prisma studio --port 7777
```

Prisma visualization dostępny pod adresem po wcześniejszym uruchomieniu:

```
http://localhost:7777
```

---

## Uruchomienie aplikacji

### Development

```bash
npm run start:dev
```

### Produkcja

```bash
npm run build
npm run start:prod
```

---

## Testy

### Unit

```bash
npm run test
```

### Watch

```bash
npm run test:watch
```

### Integration

```bash
npm run test:int
```

### E2E

```bash
npm run test:e2e
```

---

## Autor

Maciej O.