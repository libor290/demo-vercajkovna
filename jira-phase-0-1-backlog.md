# Jira backlog pro marketplace na půjčování zařízení

Tento dokument převádí backlog z Linearu do Jira struktury postavené na `Epic + tasks`.
Struktura, názvy sekcí i tón odpovídají metodice v [jira-task-standard.md](/Users/liborfeher/Developer_chatgpt/jira-task-standard.md).

## Product Summary

Webová aplikace funguje jako marketplace pro půjčování zařízení mezi lidmi.
Uživatel může vystupovat jako `majitel` i `nájemce`.
MVP řeší propojení nabídky a poptávky, rezervační žádost, schválení majitelem a předání kontaktních a platebních instrukcí mimo platformu.

## Epic 1

### Summary

`Fáze 0 - Prerekvizice`

### Epic Name

`INSTRUMENTO-F0`

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

### Recommended Jira tasks

* `Design sitemap and primary user flows`
* `Define core domain model for listings and booking requests`
* `Create wireframes for MVP key screens`
* `Define frontend application structure and route map`
* `Decide MVP backend architecture and integration boundaries`
* `Establish MVP design foundations`
* `Create Jira MVP backlog structure and implementation slices`

## Epic 2

### Summary

`Fáze 1 - MVP`

### Epic Name

`INSTRUMENTO-F1`

### Description

```md
## Goal

Doručit funkční MVP marketplace pro půjčování zařízení mezi lidmi. Cílem je propojit majitele a nájemce, umožnit vytvoření nabídky, odeslání žádosti o půjčení, její schválení a následné předání kontaktních a platebních instrukcí mimo platformu.

## In scope

* auth a účet
* katalog a objevování nabídek
* detail nabídky a dostupnost
* vytvoření a správa nabídky
* žádost o půjčení
* schválení žádosti a handoff
* dashboardy uživatele

## Out of scope

* chat
* platba kartou
* escrow
* wishlist

## Definition of Done

- [ ] Uživatel se může registrovat, přihlásit a obnovit heslo
- [ ] Majitel může vytvořit a spravovat nabídku zařízení
- [ ] Nájemce může procházet nabídky a odeslat žádost o půjčení na termín od-do
- [ ] Majitel může žádost schválit, zamítnout nebo zrušit
- [ ] Po schválení jsou dostupné zveřejněné kontaktní údaje a platební instrukce
- [ ] Uživatel má přehled o svých nabídkách a žádostech

## Issue groups

* Auth and account
* Listing management
* Search and discovery
* Listing detail and availability
* Booking request flow
* Owner request management
* Contact reveal and payment instructions
* User dashboards
* MVP release readiness
```

### Recommended Jira tasks

* `Implement registration and login flow`
* `Implement listing catalog and search`
* `Implement listing detail and availability`
* `Implement create and edit listing flow`
* `Implement booking request submission`
* `Implement owner approval and rejection flow`
* `Implement contact reveal and payment instructions handoff`
* `Implement my listings dashboard`
* `Implement my requests dashboard`
* `Create listings API`
* `Create booking request API`
* `Design approval states and handoff screens`

## Jira workflow guidance

* Každý task patří přesně do jednoho epiku.
* FE, BE a DSN se rozlišují přes hlavní `Label`, ne přes typ issue.
* Sdílené komponenty nebo cross-screen práce patří do samostatného tasku a propojují se issue linky.
* `Fáze 0` musí být dokončená před plným rozpadem a realizací `Fáze 1`.
* Pokud během `Fáze 0` vyjde najevo změna produktu, upraví se nejdřív epic a teprve potom navázané tasky.
* Platby kartou, escrow a chat zůstávají mimo MVP a nesmí se promítat do scope `Fáze 1`.
