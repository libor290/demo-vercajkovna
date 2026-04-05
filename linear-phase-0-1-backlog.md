# Linear backlog pro marketplace na půjčování zařízení

Tento dokument převádí produktový záměr do backlogu pro projekty `Fáze 0 - Prerekvizice` a `Fáze 1 - MVP`.
Struktura, názvy i tón odpovídají projektům v Linearu a šabloně v `linear-task-standard.md`.
Používá stejné rozdělení na `Project`, `Parent issue` a leaf issues s prefixy `DSN:`, `FE:` a `BE:`.

## Product Summary

Webová aplikace funguje jako marketplace pro půjčování zařízení mezi lidmi.
Uživatel může vystupovat jako `majitel` i `nájemce`.
MVP řeší propojení nabídky a poptávky, rezervační žádost, schválení majitelem a předání kontaktních a platebních instrukcí mimo platformu.

## Fáze 0 Project

### Title

`Fáze 0 - Prerekvizice`

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
* založení backlog struktury pro MVP v Linearu

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
- [ ] MVP backlog je rozpadnutý do FE, BE a DSN issues

## Issue groups

* Product scope
* Auth and account
* Listings and discovery
* Booking flow
* Design foundations
* Technical architecture
* Linear backlog setup
```

## Fáze 0 Issues

### DSN: Definovat sitemapu a hlavní user flow

**Fields**

* `Project`: Fáze 0 - Prerekvizice
* `Label`: DSN
* `Priority`: High

**Description**

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

## Acceptance criteria

- [ ] Existuje sitemap hlavních sekcí aplikace
- [ ] Jsou popsané hlavní user flows pro majitele i nájemce
- [ ] Flow jednoznačně určuje okamžik odemknutí kontaktu po schválení
```

### BE: Navrhnout core doménový model pro nabídky a booking requests

**Fields**

* `Project`: Fáze 0 - Prerekvizice
* `Label`: BE
* `Priority`: High

**Description**

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

## Acceptance criteria

- [ ] Jsou definované hlavní entity a jejich vztahy
- [ ] Booking request má jasně popsaný stavový model
- [ ] Je určeno, která data jsou neveřejná do schválení žádosti
```

### DSN: Vytvořit wireframy klíčových MVP obrazovek

**Fields**

* `Project`: Fáze 0 - Prerekvizice
* `Label`: DSN
* `Priority`: High

**Description**

```md
## Context / Goal

Navrhnout lo-fi wireframy klíčových MVP obrazovek, které pokryjí základní marketplace flow od procházení nabídky po schválenou žádost o půjčení. Wireframy mají sjednotit obsah obrazovek a připravit podklad pro implementaci.

## Scope

**In scope:**

* katalog nabídek
* detail nabídky zařízení
* vytvoření a editace nabídky
* booking request flow
* owner dashboard a requests inbox

## Out of scope

**Out of scope:**

* hi-fi vizuální design
* design system komponenty mimo potřeby MVP

## Requirements

* Wireframy musí pokrýt registraci, přihlášení, katalog, detail nabídky, vytvoření nabídky, moje rezervace a moje nabídky
* Musí být navržen kalendář dostupnosti a odeslání booking requestu
* Musí být navržena obrazovka nebo modal po schválení žádosti s kontaktem a platebními instrukcemi
* Návrhy musí prioritizovat desktop web a současně pokrýt mobilní breakpoint

## Edge cases

* Nabídka nemá dostupné termíny - wireframe musí zobrazit nedostupnost bez slepé rezervace
* Uživatel nemá žádné nabídky nebo žádné rezervace - musí být navržen empty state

## Acceptance criteria

- [ ] Wireframy pokrývají všechny klíčové MVP obrazovky
- [ ] Je navržen flow booking requestu včetně schválení a reveal kontaktu
- [ ] Každá hlavní sekce má definovaný empty state

## Output

* Figma soubor s lo-fi wireframy klíčových MVP obrazovek
* Breakpointy: Mobil 375px, Desktop 1280px
```

### FE: Navrhnout frontendovou strukturu aplikace a route mapu

**Fields**

* `Project`: Fáze 0 - Prerekvizice
* `Label`: FE
* `Priority`: Medium

**Description**

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


## Acceptance criteria

- [ ] Existuje přehled hlavních rout a layoutů pro MVP
- [ ] Je definované oddělení veřejné a privátní části
- [ ] Je určený přístupový pattern pro chráněné routy
```

### BE: Rozhodnout MVP backend architekturu a integrační hranice

**Fields**

* `Project`: Fáze 0 - Prerekvizice
* `Label`: BE
* `Priority`: Medium

**Description**

```md
## Context / Goal

Rozhodnout backendovou architekturu pro MVP, integrační hranice a minimální infrastrukturní potřeby. Cílem je uzamknout směr před implementací auth, listings a booking API.

## Scope

**In scope:**

* styl API a hranice backendových modulů
* auth strategie pro MVP
* práce s obrázky a ukládáním dat

## Out of scope

**Out of scope:**

* produkční DevOps automatizace
* architektura pro escrow a platební gateway

## Requirements

* Musí být rozhodnuto, jak budou oddělené moduly auth, listings, availability a booking requests
* Musí být určena strategie ukládání obrázků zařízení
* Musí být určen zdroj pravdy pro dostupnost a booking request status
* Architektura musí počítat s pozdějším rozšířením o chat a platby bez přepsání core flow

## Edge cases

* Současné žádosti o stejný termín - architektura musí připustit konzistentní rozhodnutí o dostupnosti
* Výpadek externí služby pro ukládání obrázků - musí být zřejmé, jaký dopad to má na vytvoření nabídky


## Acceptance criteria

- [ ] Je popsaná cílová backendová architektura pro MVP
- [ ] Jsou určené integrační hranice klíčových modulů
- [ ] Je definovaný směr pro práci s auth, obrázky a dostupností
```

### DSN: Nastavit design foundations pro MVP

**Fields**

* `Project`: Fáze 0 - Prerekvizice
* `Label`: DSN
* `Priority`: Medium

**Description**

```md
## Context / Goal

Připravit základní design foundations pro MVP tak, aby následné návrhy a implementace měly jednotný směr. Cílem není budovat plný design system, ale uzamknout základní principy vizuálního stylu, formulářů a základních komponent.

## Scope

**In scope:**

* základní typografie a barvy
* primární a sekundární tlačítka
* formulářové prvky pro MVP
* karty nabídek a badge stavy

## Out of scope

**Out of scope:**

* plný enterprise design system
* pokročilé motion guidelines

## Requirements

* Foundations musí pokrýt katalog, listing detail, formuláře a request statusy
* Musí existovat základní pravidla pro badge stavy pending, approved a rejected
* Komponenty musí být dostatečné pro MVP bez duplicity ve wireframech a FE implementaci

## Edge cases

* Jeden pattern se používá v katalogu i dashboardu - foundations musí zabránit zbytečně odlišným řešením
* Stav schválení a zamítnutí musí být vizuálně jednoznačný i bez doprovodného textu


## Acceptance criteria

- [ ] Jsou definované základní vizuální foundations pro MVP
- [ ] Existují pravidla pro formuláře, listing card a status badge
- [ ] Foundations lze přímo použít při návrhu a implementaci MVP obrazovek

## Output

* Figma foundations pro MVP
* Základní sada stylů pro formuláře, tlačítka, listing card a status badge
```

### FE: Založit MVP backlog strukturu v Linearu

**Fields**

* `Project`: Fáze 0 - Prerekvizice
* `Label`: FE
* `Priority`: Medium

**Description**

```md
## Context / Goal

Rozpadnout MVP do implementačních slices připravených pro zakládání issues v Linearu. Cílem je převést produktové a designové rozhodnutí do backlogu, který půjde plánovat a realizovat bez improvizace.

## Scope

**In scope:**

* rozdělení MVP do issue groups
* vazby mezi FE, BE a DSN tasks
* identifikace shared komponent

## Out of scope

**Out of scope:**

* samotná implementace funkcí
* release plán po MVP

## Requirements

* Backlog musí mít jasné issue groups pro auth, listings, discovery, booking flow a dashboardy
* Musí být odlišené shared komponenty od screen-specific práce
* Každý větší user flow musí mít FE, BE a případně DSN návaznost

## Edge cases

* Jedna komponenta je potřebná na více obrazovkách - musí být vytažena do samostatného shared issue
* Jedna business funkce se láme přes více rolí - backlog musí zachovat jednoznačné vlastnictví issue

## Acceptance criteria

- [ ] MVP backlog je rozpadnutý do realizovatelných issue groups
- [ ] Shared práce je oddělená od screen-specific tasků
- [ ] Závislosti mezi FE, BE a DSN issues jsou explicitní
```

## Fáze 1 Project

### Title

`Fáze 1 - MVP`

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

* Auth a účet
* Market sekce a detail nabídky
* Správa nabídky
* Žádost o půjčení
* Navigace aplikace
* FE sdílené komponenty
* Profil uživatele
```

## Fáze 1 Issues

### Aktuální struktura v Linearu (Fáze 1 - MVP)

Níže je rychlá reference aktuální struktury parent/child issues v Linearu (jen názvy a INS ID).

```md
- INS-158 [Fáze 1] Auth a účet
  - INS-161 BE: Implementovat registraci, přihlášení a session
  - INS-162 FE: Implementovat registraci a přihlášení
  - INS-159 DSN: Navrhnout obrazovky registrace a přihlášení (archived)
  - INS-160 Navrhnout flow zapomenutého hesla (archived)

- INS-166 [Fáze 1] MVP flow
  - INS-167 Přihlášení a registrace (guest → auth → návrat do původní akce)
  - INS-168 Flow žádosti o půjčení (odeslání → schválení/zamítnutí → handoff)
  - INS-169 Správa nabídky (vytvoření / editace / dostupnost)
  - INS-172 Dashboardy (obě strany)
  - INS-173 Zapomenuté heslo
  - INS-170 Schválení / zamítnutí / zrušení žádosti (majitel) (canceled)
  - INS-171 Handoff po schválení (obě strany) — kontakt + platební instrukce (canceled)

- INS-174 [Fáze 1] Katalog nabídek
  - INS-178 BE: Implementovat katalog nabídek
  - INS-179 FE: Implementovat Market sekci (katalog nabídek)
  - INS-180 BE: Implementovat detail nabídky
  - INS-181 FE: Implementovat detail nabídky

- INS-176 [Fáze 1] Správa nabídky
  - INS-188 BE: Implementovat vytvoření/editaci nabídky
  - INS-189 FE: Implementovat vytvoření/editaci nabídky
  - INS-190 BE: Implementovat dostupnost nabídky
  - INS-191 FE: Implementovat dostupnost nabídky

- INS-177 [Fáze 1] Žádost o půjčení
  - INS-182 BE: Implementovat žádost o půjčení
  - INS-183 FE: Implementovat žádost o půjčení
  - INS-184 BE: Implementovat schválení/zamítnutí/zrušení žádosti
  - INS-185 FE: Implementovat schválení/zamítnutí/zrušení žádosti
  - INS-186 BE: Implementovat handoff (kontakt + platební instrukce)
  - INS-187 FE: Implementovat handoff (kontakt + platební instrukce)

- INS-175 [Fáze 1] Dashboardy
  - INS-192 BE: Implementovat data pro dashboardy
  - INS-193 FE: Implementovat dashboardy

- INS-204 [Fáze 1] Profil uživatele
  - INS-205 BE: Implementovat profil uživatele
  - INS-206 FE: Implementovat profil uživatele

- INS-194 [Fáze 1] FE sdílené komponenty
  - INS-195 FE: Toast notifikace (success/error)
  - INS-196 FE: Fulltextové vyhledávání (UI + debounce + bez výsledků)
  - INS-197 FE: Filtrovační panel (aplikovat/reset)
  - INS-198 FE: Karta nabídky (listing card)
  - INS-199 FE: Prázdné a chybové stavy (pattern)
  - INS-200 FE: Loading stavy (spinner/skeleton)
  - INS-201 FE: Modaly a dialogy (confirm/info)
  - INS-202 FE: Výběr termínu (date range / kalendář)
  - INS-203 FE: Přesměrování na přihlášení + návratový cíl

- INS-207 [Fáze 1] Navigace aplikace
  - INS-208 FE: Spodní navigace (tab bar)
```

### FE - Implement registration and login flow

**Fields**

* `Project`: Fáze 1 - MVP
* `Label`: FE
* `Priority`: High

**Description**

```md
## Context / Goal

Implementovat registraci a přihlášení do aplikace jako vstup do marketplace flow. Uživatel po přihlášení získá přístup ke svému účtu, nabídkám a rezervacím.

## Scope

**In scope:**

* registrační formulář
* přihlašovací formulář
* základní validace a chybové stavy

## Out of scope

**Out of scope:**

* sociální přihlášení
* vícefaktorové ověření

## Requirements

* Registrace musí sbírat minimálně jméno, E-mail a heslo
* Přihlášení musí podporovat běžný E-mail a heslo flow
* Formuláře musí pokrýt loading a chybové stavy
* Po úspěšném přihlášení musí dojít k redirectu do aplikace

## Edge cases

* Uživatel zadá už použitý E-mail - formulář zobrazí srozumitelnou chybu
* Uživatel otevře chráněnou stránku bez session - je přesměrován na login


## Acceptance criteria

- [ ] Uživatel může založit účet
- [ ] Uživatel se může přihlásit a odhlásit
- [ ] Chybné vstupy zobrazují validní chybový stav
```

### BE - Implement auth API and session handling

**Fields**

* `Project`: Fáze 1 - MVP
* `Label`: BE
* `Priority`: High

**Description**

```md
## Context / Goal

Implementovat backendové API pro registraci, přihlášení a správu session. Cílem je zajistit bezpečný vstup do aplikace pro další marketplace flow.

## Scope

**In scope:**

* registrace uživatele
* přihlášení a odhlášení
* načtení aktuálního uživatele

## Out of scope

**Out of scope:**

* sociální identity providery
* reset hesla

## Requirements

* API musí umět vytvořit nový účet a ověřit unikátnost E-mailu
* API musí vracet session nebo access pattern potřebný pro frontend
* Musí existovat endpoint pro načtení aktuálně přihlášeného uživatele
* Chybové odpovědi musí být použitelné pro FE validaci

## Edge cases

* Přihlášení s neplatnými údaji - API vrací bezpečnou chybovou odpověď bez úniku detailů
* Session expirovala - protected endpoint vrací jednoznačný auth error


## Acceptance criteria

- [ ] API podporuje registraci a přihlášení
- [ ] Frontend může načíst aktuálního uživatele
- [ ] Chybové a auth stavy jsou konzistentní
```

### FE - Implement listing catalog with search and filters

**Fields**

* `Project`: Fáze 1 - MVP
* `Label`: FE
* `Priority`: High

**Description**

```md
## Context / Goal

Implementovat katalog nabídek jako hlavní vstupní bod pro nájemce. Uživatel musí být schopný procházet nabídky zařízení a filtrovat je podle relevantních parametrů.

## Scope

**In scope:**

* listing grid nebo list
* search input
* základní filtry
* empty a loading stavy

## Out of scope

**Out of scope:**

* personalizované doporučování
* mapové zobrazení

## Requirements

* Katalog musí zobrazovat název zařízení, cenu, lokaci a hlavní vizuál
* Musí existovat minimálně textové hledání a filtry podle kategorie, lokace a ceny
* Uživatel musí být schopný přejít z karty do detailu nabídky
* Seznam musí mít loading a empty state

## Edge cases

* Filtry vrátí nulový výsledek - zobrazí se empty state s možností resetu filtrů
* Nabídka nemá obrázek - karta musí použít fallback vizuál


## Acceptance criteria

- [ ] Uživatel vidí seznam dostupných nabídek
- [ ] Search a filtry mění výsledky katalogu
- [ ] Karta nabídky vede do detailu nabídky
```

### BE - Implement listings browse API

**Fields**

* `Project`: Fáze 1 - MVP
* `Label`: BE
* `Priority`: High

**Description**

```md
## Context / Goal

Implementovat API pro procházení veřejných nabídek zařízení. Endpoint musí vracet data potřebná pro katalog a podporovat základní filtrování.

## Scope

**In scope:**

* seznam veřejných aktivních nabídek
* filtrování a hledání
* základní stránkování

## Out of scope

**Out of scope:**

* doporučovací logika
* pokročilé řazení podle relevance

## Requirements

* API musí vracet název, cenu, lokaci, hlavní obrázek a stručné metadata nabídky
* Musí podporovat filtraci podle kategorie, lokace a ceny
* Musí podporovat textové hledání
* Výsledek musí být stránkovaný

## Edge cases

* Filtry jsou mimo podporovaný rozsah - API vrátí validní 4xx chybu
* Nabídka není aktivní - nesmí se objevit ve veřejném katalogu


## Acceptance criteria

- [ ] API vrací seznam veřejných aktivních nabídek
- [ ] Endpoint podporuje definované filtry a hledání
- [ ] Response poskytuje data potřebná pro katalog
```

### FE - Implement listing detail and availability calendar

**Fields**

* `Project`: Fáze 1 - MVP
* `Label`: FE
* `Priority`: High

**Description**

```md
## Context / Goal

Implementovat detail nabídky zařízení, kde si nájemce prohlédne podrobnosti, podmínky půjčení a dostupnost termínů. Detail je klíčový krok před odesláním booking requestu.

## Scope

**In scope:**

* galerie nebo hlavní vizuál
* detailní informace o zařízení
* podmínky půjčení a kauce
* kalendář dostupnosti

## Out of scope

**Out of scope:**

* hodnocení a recenze
* interní chat s majitelem

## Requirements

* Detail musí zobrazit název, cenu, lokaci, technické informace, podmínky a kauci
* Musí být zobrazen dostupný a nedostupný termín v kalendáři
* Uživatel musí mít jasný vstup do booking request flow
* Obrazovka musí podporovat loading a not found stav

## Edge cases

* Nabídka již není aktivní - detail zobrazí nedostupnost nebo not found podle business pravidla
* Kalendář nemá volný termín - uživatel nesmí být uveden do falešného dojmu, že může rezervovat


## Acceptance criteria

- [ ] Detail zobrazuje všechny klíčové informace o nabídce
- [ ] Kalendář jednoznačně rozlišuje dostupné a nedostupné termíny
- [ ] Uživatel může přejít do booking request flow
```

### BE - Implement listing detail and availability API

**Fields**

* `Project`: Fáze 1 - MVP
* `Label`: BE
* `Priority`: High

**Description**

```md
## Context / Goal

Implementovat API pro detail nabídky a její dostupnost. Endpoint musí dodat data potřebná pro rozhodnutí nájemce před odesláním booking requestu.

## Scope

**In scope:**

* detail jedné nabídky
* data o dostupnosti termínů
* veřejné podmínky půjčení

## Out of scope

**Out of scope:**

* interní owner-only metadata
* pricing logika mimo základní cenu a kauci

## Requirements

* Endpoint musí vracet veřejný detail aktivní nabídky
* Response musí obsahovat technické parametry, cenu, kauci, podmínky a obrázky
* Dostupnost musí být vrácena v podobě použitelně renderovatelné pro FE kalendář
* Neaktivní nebo neexistující nabídka musí vracet správný stav

## Edge cases

* Nabídka existuje, ale není veřejná - API nesmí vrátit neveřejná data
* Dostupnost se změnila mezi načtením detailu a další akcí - endpoint musí vracet aktuální zdroj pravdy


## Acceptance criteria

- [ ] API vrací veřejný detail nabídky
- [ ] Response obsahuje data potřebná pro kalendář dostupnosti
- [ ] Neplatný nebo neveřejný listing vrací správnou chybu
```

### FE - Implement create and edit listing flow

**Fields**

* `Project`: Fáze 1 - MVP
* `Label`: FE
* `Priority`: High

**Description**

```md
## Context / Goal

Implementovat formulář pro vytvoření a editaci nabídky zařízení. Majitel musí být schopný zveřejnit zařízení včetně parametrů, ceny, kauce, podmínek a dostupnosti.

## Scope

**In scope:**

* create listing formulář
* edit listing formulář
* upload obrázků
* nastavení základní dostupnosti

## Out of scope

**Out of scope:**

* bulk import nabídek
* pokročilý pricing engine

## Requirements

* Formulář musí pokrýt název, popis, kategorii, cenu, kauci, lokaci a technické parametry
* Musí být možné zadat podmínky půjčení
* Musí být možné nahrát základní sadu obrázků
* Musí být možné nastavit dostupnost potřebnou pro booking request flow

## Edge cases

* Uživatel odešle nekompletní formulář - zobrazí se validace bez ztráty vyplněných dat
* Nahrání obrázku selže - formulář musí zobrazit chybu a zachovat ostatní data


## Acceptance criteria

- [ ] Majitel může vytvořit novou nabídku
- [ ] Majitel může upravit existující nabídku
- [ ] Formulář podporuje validaci, obrázky a základní dostupnost
```

### BE - Implement owner listing management API

**Fields**

* `Project`: Fáze 1 - MVP
* `Label`: BE
* `Priority`: High

**Description**

```md
## Context / Goal

Implementovat API pro vytvoření, editaci a správu vlastních nabídek majitele. API musí sloužit jako backend pro owner dashboard a listing form flow.

## Scope

**In scope:**

* create listing
* update listing
* list owner listings
* upload metadata pro obrázky

## Out of scope

**Out of scope:**

* moderace obsahu
* archivace a restore workflow nad rámec MVP

## Requirements

* API musí podporovat vytvoření a editaci nabídky pouze pro přihlášeného vlastníka
* Listing musí mít stav potřebný pro veřejné zobrazení nebo skrytí
* API musí vracet data potřebná pro owner dashboard
* Ukládání obrázků musí být integrováno s rozhodnutou storage strategií

## Edge cases

* Uživatel upravuje cizí nabídku - API vrátí authorizační chybu
* Listing je nekompletní pro publikaci - API musí umožnit buď draft stav, nebo validně zablokovat publikaci podle zvoleného pravidla


## Acceptance criteria

- [ ] API umožňuje vytvořit a upravit vlastní nabídku
- [ ] Listing nelze upravovat bez oprávnění
- [ ] Owner dashboard může načíst seznam vlastních nabídek
```

### FE - Implement booking request flow

**Fields**

* `Project`: Fáze 1 - MVP
* `Label`: FE
* `Priority`: High

**Description**

```md
## Context / Goal

Implementovat flow odeslání booking requestu z detailu nabídky. Nájemce musí být schopný vybrat termín a odeslat žádost majiteli.

## Scope

**In scope:**

* výběr termínu
* request formulář
* potvrzení odeslání

## Out of scope

**Out of scope:**

* okamžitá rezervace bez schválení
* interní messaging

## Requirements

* Uživatel musí být schopný vybrat dostupný termín
* Flow musí vyžadovat přihlášení
* Musí být možné přidat základní zprávu nebo poznámku k žádosti, pokud se to potvrdí jako součást MVP
* Po odeslání musí být zřejmé, že žádost čeká na schválení majitelem

## Edge cases

* Uživatel zvolí nedostupný termín - UI nesmí dovolit odeslání requestu
* Dostupnost se změní těsně před odesláním - UI musí zpracovat backendovou chybu bez falešného potvrzení


## Acceptance criteria

- [ ] Přihlášený uživatel může odeslat booking request
- [ ] Request lze odeslat pouze na dostupný termín
- [ ] Po odeslání uživatel vidí stav pending
```

### BE - Implement booking request API

**Fields**

* `Project`: Fáze 1 - MVP
* `Label`: BE
* `Priority`: High

**Description**

```md
## Context / Goal

Implementovat API pro vytváření booking requestů a správu jejich stavů. Tento endpoint tvoří základ mezi nájemcem a majitelem v MVP marketplace flow.

## Scope

**In scope:**

* create booking request
* list booking requests pro nájemce a majitele
* update status na approved nebo rejected

## Out of scope

**Out of scope:**

* okamžitá platba
* escrow logika

## Requirements

* API musí ověřit, že booking request vzniká na dostupný termín
* API musí vytvářet request ve stavu pending
* Pouze vlastník nabídky může request schválit nebo zamítnout
* Po schválení musí existovat reprezentace pro reveal kontaktu a platebních instrukcí

## Edge cases

* Současně vzniknou dvě žádosti na stejný termín - backend musí udržet konzistenci podle zvoleného pravidla
* Majitel schválí request na již nedostupný termín - API musí vrátit jednoznačnou chybu


## Acceptance criteria

- [ ] API vytvoří booking request pouze na validní termín
- [ ] Request má stavový model pending, approved, rejected a cancelled
- [ ] Schválení a zamítnutí je omezené na vlastníka nabídky
```

### FE - Implement owner request management dashboard

**Fields**

* `Project`: Fáze 1 - MVP
* `Label`: FE
* `Priority`: High

**Description**

```md
## Context / Goal

Implementovat dashboard, kde majitel spravuje příchozí booking requests ke svým nabídkám. Dashboard je klíčový pro schválení nebo zamítnutí požadavků.

## Scope

**In scope:**

* seznam příchozích requests
* detail requestu
* akce approve a reject

## Out of scope

**Out of scope:**

* interní chat s nájemcem
* pokročilá analytika majitele

## Requirements

* Dashboard musí zobrazit seznam pending i vyřízených requests
* U každého requestu musí být vidět zařízení, termín a základní informace o nájemci
* Majitel musí mít dostupnou akci approve a reject
* Po změně stavu se musí UI okamžitě propsat do seznamu i detailu

## Edge cases

* Request už byl vyřízen na jiném zařízení nebo v jiné session - UI musí zpracovat konflikt
* Majitel nemá žádné příchozí requests - zobrazí se empty state


## Acceptance criteria

- [ ] Majitel vidí příchozí requests ke svým nabídkám
- [ ] Může request schválit nebo zamítnout
- [ ] UI korektně odráží aktuální stav requestu
```

### FE - Implement contact and payment instructions reveal

**Fields**

* `Project`: Fáze 1 - MVP
* `Label`: FE
* `Priority`: High

**Description**

```md
## Context / Goal

Implementovat obrazovku nebo modal, který se nájemci odemkne po schválení booking requestu. Cílem je předat kontakt na majitele a instrukce k domluvě a platbě mimo platformu.

## Scope

**In scope:**

* reveal kontaktu po schválení
* zobrazení platebních instrukcí
* stavové zobrazení pro schválený request

## Out of scope

**Out of scope:**

* interní chat
* zpracování platby kartou

## Requirements

* Obrazovka musí být dostupná pouze pro approved request
* Musí umět zobrazit alespoň telefon, E-mail a instrukci k platbě, pokud je dostupná
* Pokud majitel poskytl číslo účtu nebo QR kód, UI je musí zobrazit čitelně
* Musí být zřejmé, že další domluva probíhá mimo platformu

## Edge cases

* Request je později zrušen nebo zamítnut - reveal nesmí zůstat dostupný
* Majitel nevyplnil všechny kontaktní nebo platební údaje - UI musí zobrazit jen dostupná data bez rozbití obrazovky


## Acceptance criteria

- [ ] Approved request zobrazí kontaktní údaje majitele
- [ ] UI zobrazí dostupné platební instrukce mimo platformu
- [ ] Reveal není dostupný pro neapproved request
```

### BE - Implement approved booking detail API

**Fields**

* `Project`: Fáze 1 - MVP
* `Label`: BE
* `Priority`: High

**Description**

```md
## Context / Goal

Implementovat endpoint pro detail schváleného booking requestu, který vrátí kontaktní a platební instrukce dostupné až po schválení. Endpoint uzavírá MVP matching flow mezi majitelem a nájemcem.

## Scope

**In scope:**

* detail approved requestu
* reveal kontaktu a payment instrukcí

## Out of scope

**Out of scope:**

* platební transakce
* escrow nebo držení peněz

## Requirements

* Endpoint musí být dostupný jen účastníkům konkrétního booking requestu
* Kontakt a platební instrukce se vrací pouze pro approved stav
* Response musí rozlišit, která data jsou povinná a která volitelná
* Endpoint musí respektovat změnu stavu requestu v čase

## Edge cases

* Request byl po schválení stornován - endpoint už nesmí reveal vracet
* Chybí část payment instrukcí - response musí být stále validní a bezpečná pro FE render


## Acceptance criteria

- [ ] Endpoint vrací reveal data jen pro approved request
- [ ] Reveal data jsou dostupná jen autorizovaným účastníkům
- [ ] Response je použitelná pro FE obrazovku schválené žádosti
```

### FE - Implement my listings and my requests dashboards

**Fields**

* `Project`: Fáze 1 - MVP
* `Label`: FE
* `Priority`: Medium

**Description**

```md
## Context / Goal

Implementovat přehledové dashboardy pro správu vlastních nabídek a vlastních booking requestů. Uživatel musí mít rychlý přístup ke svým aktivitám v obou rolích.

## Scope

**In scope:**

* dashboard my listings
* dashboard my requests
* základní stavové filtry

## Out of scope

**Out of scope:**

* pokročilé statistiky
* notifikační centrum

## Requirements

* My listings musí zobrazit seznam vlastních nabídek a jejich stav
* My requests musí zobrazit odeslané booking requests a jejich status
* Uživatel musí být schopný přejít do detailu nabídky nebo detailu requestu
* Každá sekce musí mít empty, loading a error state

## Edge cases

* Uživatel má pouze nabídky nebo pouze requests - navigace i dashboard musí fungovat bez druhé role
* Stav requestu se změní mezi načtením a interakcí - UI musí reflektovat aktuální data po refreshi nebo refetchi


## Acceptance criteria

- [ ] Uživatel vidí přehled vlastních nabídek
- [ ] Uživatel vidí přehled vlastních booking requestů
- [ ] Dashboardy podporují základní stavy a navigaci do detailů
```

### DSN - Design status and handoff states for booking lifecycle

**Fields**

* `Project`: Fáze 1 - MVP
* `Label`: DSN
* `Priority`: Medium

**Description**

```md
## Context / Goal

Navrhnout vizuální a obsahové zpracování stavů booking lifecycle pro MVP marketplace. Cílem je sjednotit, jak se napříč aplikací zobrazuje pending, approved, rejected a reveal po schválení.

## Scope

**In scope:**

* status badge a status messaging
* empty a confirmation stavy booking flow
* schválený handoff stav s kontaktem a payment instrukcí

## Out of scope

**Out of scope:**

* interní chat
* notifikace mimo aplikaci

## Requirements

* Návrh musí pokrýt stavy pending, approved, rejected a cancelled
* Musí být jasně navržen approved handoff stav po schválení requestu
* Status pattern musí být použitelný v my requests, owner requests i detailu requestu

## Edge cases

* Stav je změněn po předchozím schválení - návrh musí myslet i na přechod zpět do neaktivního stavu
* User nemá kompletní payment instrukce - handoff obrazovka musí být stále použitelná


## Acceptance criteria

- [ ] Existuje jednotný návrh booking lifecycle stavů
- [ ] Approved handoff stav pokrývá kontakt i payment instrukce
- [ ] Návrh lze použít napříč všemi request-related obrazovkami

## Output

* Figma návrh status badge, confirmation stavů a approved handoff obrazovky
```

## Shared Component Candidates

Tyto položky mají být samostatné issues, pokud se skutečně použijí na 2 a více obrazovkách:

* listing card
* availability calendar
* listing form sections
* request status badge
* empty state pattern

## Delivery Notes

* `Fáze 0` musí být dokončená před plným rozpadem a realizací `Fáze 1`.
* Pokud během `Fáze 0` vyjde najevo změna produktu, upraví se nejdřív `Project` a teprve potom implementační issues.
* Platby kartou, escrow a chat zůstávají mimo MVP a nesmí se promítat do scope Fáze 1.

## Poznámky na příště

* MVP design je ve `Fáze 0` (ta je hotová).
* Ve `Fáze 1` řešíme konkrétní pohledy a doplnění chybějících MVP pohledů.
* Sepsat lehký obsah pro flow.
* Technologie: `Nuxt` + `Supabase` (včetně `Supabase Auth`) — počítat s tím v BE tasku.
* Zkontrolovat obsah a popis v epicu `Auth a účet`.
