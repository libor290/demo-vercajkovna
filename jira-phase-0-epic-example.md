# Jira ukázka pro Fázi 0

Tento dokument obsahuje jeden konkrétní Jira epic pro `Fáze 0 - Prerekvizice` a tři ukázkové tasky, po jednom pro `DSN`, `BE` a `FE`.
Struktura odpovídá metodice v [jira-task-standard.md](/Users/liborfeher/Developer_chatgpt/jira-task-standard.md).

## Epic

### Summary

`Fáze 0 - Prerekvizice`

### Issue Type

`Epic`

### Epic Name

`INSTRUMENTO-F0`

### Priority

`High`

### Description

```md
## Goal

Připravit produktové, designové a technické základy pro marketplace na půjčování zařízení. Cílem je uzamknout MVP scope, role, doménový model, hlavní user flows a architektonická rozhodnutí tak, aby navazující implementace MVP proběhla bez zásadních změn směru.

## In scope

* vymezení MVP a mimo MVP
* role, permissions a základní business flow
* informační architektura a klíčové obrazovky
* wireframy a design foundations
* datový model a technická architektura
* založení backlog struktury pro MVP v Jiře

## Out of scope

* implementace produkčních funkcí
* integrace plateb kartou
* interní chat
* escrow a trust workflow

## Definition of Done

- [ ] MVP scope a hlavní workflow jsou schválené
- [ ] Je definovaný doménový model a odpovědnosti hlavních entit
- [ ] Jsou připravené wireframy klíčových obrazovek pro MVP
- [ ] Je rozhodnutý technický stack a hlavní architektura
- [ ] MVP backlog je rozpadnutý do FE, BE a DSN tasků

## Issue groups

* Product definition
* Roles and permissions
* Information architecture
* Core domain model
* Design foundations
* Technical architecture
* MVP backlog setup
```

## Task 1

### Summary

`Design sitemap and primary user flows`

### Issue Type

`Task`

### Epic Link

`INSTRUMENTO-F0`

### Label

`DSN`

### Priority

`High`

### Description

```md
## Context / Goal

Navrhnout základní informační architekturu produktu a hlavní user flows pro majitele i nájemce. Výstup má sjednotit navigaci, hlavní vstupy do aplikace a pořadí klíčových kroků před návrhem wireframů.

## Scope

**In scope:**

* sitemap pro guest, přihlášeného uživatele a hlavní dashboardy
* flow registrace a přihlášení
* flow vytvoření nabídky
* flow odeslání a schválení žádosti o půjčení

## Out of scope

**Out of scope:**

* detailní UI komponenty
* hi-fi design

## Requirements

* Musí být pokryté role guest, majitel a nájemce v rámci jednoho účtu
* Flow musí ukázat přechod od katalogu přes detail nabídky až po booking request
* Musí být jasné, kdy se odemyká kontakt a platební instrukce
* Navigace musí oddělit veřejnou část, správu mých nabídek a správu mých rezervací

## Edge cases

* Uživatel je zároveň majitel i nájemce - navigace musí podporovat oba pohledy bez přepínání účtů
* Nepřihlášený uživatel chce odeslat žádost - flow ho musí přesměrovat do autentizace

## Dependencies / References

* Navazující DSN task: wireframy klíčových obrazovek
* Vstup: produktový popis marketplace na půjčování zařízení

## Acceptance criteria

- [ ] Existuje sitemap hlavních sekcí aplikace
- [ ] Jsou popsané hlavní user flows pro majitele i nájemce
- [ ] Flow jednoznačně určuje okamžik odemknutí kontaktu po schválení

## Output

* Figma sitemap a flow diagram hlavních scénářů
* Breakpointy nebo varianty jen tam, kde ovlivňují navigaci nebo tok
```

## Task 2

### Summary

`Define core domain model for listings and booking requests`

### Issue Type

`Task`

### Epic Link

`INSTRUMENTO-F0`

### Label

`BE`

### Priority

`High`

### Description

```md
## Context / Goal

Definovat základní doménový model pro marketplace tak, aby pokryl uživatele, nabídky zařízení, dostupnost, booking request a schválené propojení stran. Cílem je uzamknout entity a jejich odpovědnosti před implementací API.

## Scope

**In scope:**

* návrh hlavních entit a vztahů
* návrh stavového modelu booking requestu
* definice minimálních polí pro MVP

## Out of scope

**Out of scope:**

* finální implementace databáze
* model pro escrow a karetní platby

## Requirements

* Model musí pokrýt entity User, Listing, ListingImage, AvailabilitySlot, BookingRequest a PaymentInstruction
* BookingRequest musí mít jasné stavy minimálně pending, approved, rejected a cancelled
* Musí být rozlišeno, co je veřejně viditelné před schválením a co až po schválení
* Listing musí pokrýt cenu, kauci, podmínky půjčení a technické parametry

## Edge cases

* Jeden uživatel může mít vlastní nabídky a zároveň posílat booking requests na cizí nabídky
* Majitel odstraní nebo deaktivuje nabídku s existující pending žádostí - model musí umět určit další očekávané chování

## Dependencies / References

* Navazující BE tasky: auth, listings API, booking request API
* Navazující FE task: katalog a detail nabídky

## Acceptance criteria

- [ ] Jsou definované hlavní entity a jejich vztahy
- [ ] Booking request má jasně popsaný stavový model
- [ ] Je určeno, která data jsou neveřejná do schválení žádosti
```

## Task 3

### Summary

`Define frontend application structure and route map`

### Issue Type

`Task`

### Epic Link

`INSTRUMENTO-F0`

### Label

`FE`

### Priority

`Medium`

### Description

```md
## Context / Goal

Připravit návrh frontendové struktury aplikace, routingu a hlavních layoutů pro veřejnou část i přihlášenou sekci. Cílem je snížit chaos při implementaci MVP a uzamknout základní skelet aplikace.

## Scope

**In scope:**

* návrh route mapy
* rozdělení veřejných a privátních layoutů
* definice hlavních stránek a dashboard sekcí

## Out of scope

**Out of scope:**

* implementace obrazovek
* vývoj design system komponent

## Requirements

* Musí být oddělené routy pro veřejný katalog a přihlášené dashboardy
* Route mapa musí pokrýt listing detail, create listing, my listings, my requests a request detail
* Musí být určeno, kde se vyžaduje autentizace
* Návrh musí respektovat jeden účet pro role majitel i nájemce

## Edge cases

* Nepřihlášený uživatel otevře chráněnou stránku - musí být definovaný redirect pattern
* Uživatel bez vlastních nabídek otevře sekci my listings - route i layout musí počítat s empty state

## Dependencies / References

* Vstup: sitemap a wireframy
* Navazující FE tasky: implementace auth a dashboardů

## Acceptance criteria

- [ ] Existuje přehled hlavních rout a layoutů pro MVP
- [ ] Je definované oddělení veřejné a privátní části
- [ ] Je určený přístupový pattern pro chráněné routy
```
