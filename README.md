# Library Management System

## Opis projektu
Library Management System to aplikacja webowa służąca do zarządzania wypożyczaniem książek.  
System umożliwia użytkownikom przeglądanie katalogu książek, wyszukiwanie i filtrowanie pozycji, wypożyczanie oraz zwracanie książek, a także podgląd historii wypożyczeń.  
Aplikacja przewiduje również panel administratora do zarządzania książkami, kategoriami, autorami oraz użytkownikami.

## Cel projektu
Celem projektu jest stworzenie prototypu systemu informatycznego wspierającego obsługę wypożyczalni książek z wykorzystaniem narzędzi do zarządzania projektem i kontroli wersji.

## Zakres funkcjonalny
System obejmuje następujące funkcjonalności:

- rejestracja, logowanie, wylogowanie użytkownika
- walidacja poprawności danych logowania
- podgląd i edycja danych konta użytkownika
- zmiana hasła
- przeglądanie katalogu książek
- podgląd szczegółów książki
- wyszukiwanie książek po tytule
- filtrowanie książek po autorze, kategorii i dostępności
- wypożyczanie książek
- zwrot książek
- historia wypożyczeń użytkownika
- dodawanie opinii do przeczytanych książek
- panel administratora do zarządzania książkami
- zarządzanie kategoriami i autorami
- zarządzanie użytkownikami
- obsługa statusów wypożyczeń

## Technologie
### Backend
- NestJS
- PostgreSQL

### Frontend
- HTML
- CSS
- JavaScript

### UI/UX
- Figma

### Zarządzanie projektem i wersjonowanie
- Jira
- GitHub

## Struktura repozytorium
```text
library-management-system/
│
├── backend/     # kod backendu
├── frontend/    # kod frontendu
├── docs/        # dokumentacja projektu
└── README.md
