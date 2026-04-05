# Šablona pro Linear projekty a issues

Tento dokument popisuje šablonu pro `Linear Project + issues` podle struktury používané v teamu `Instrumento`.
Vychází z projektů `Fáze 0 - Prerekvizice` a `Fáze 1 - MVP`, takže zachovává jejich formátování, obsahovou disciplínu i tón.
Je určený pro ruční psaní ticketů i pro AI generování a má být přenositelný i do jiných projektů.

## 1. Základní principy

- `Project` je hlavní kontejner iniciativy a nahrazuje klasický epic.
- `Issue` slouží pro FE, DSN a BE práci; typ práce se rozlišuje hlavním labelem i prefixem v názvu.
- Do `description` patří jen informace, které mají být čitelné i bez znalosti metadat.
- Struktura je stručná, rozhodovací a bez výplňového textu.
- Jazyk popisu je čeština; názvy sekcí `Goal`, `In scope`, `Out of scope`, `Definition of Done`, `Issue groups`, `Context / Goal`, `Scope`, `Requirements`, `Edge cases` a `Acceptance criteria` zůstávají v angličtině.
- Sekce mimo tento standard se nepřidávají.
- Závislosti, návaznosti a blokace se řeší přes Linear relations (`blocks`, `blocked by`, `related`), ne přes textovou sekci v popisu.
- Checkbox formát je vždy `- [ ]`.
- `E-mail` piš vždy s pomlčkou.

## 2. Tón a styl

- Piš věcně, stručně a produktově-technicky.
- `Goal` má vysvětlit cíl a rozhodovací rámec ve 2 krátkých odstavcích nebo 2 větách.
- `In scope` a `Out of scope` mají být krátké seznamy konkrétních oblastí, ne dlouhé věty.
- `Definition of Done` a `Acceptance criteria` musí být měřitelné a ověřitelné.
- Nepoužívej marketingové formulace, obecné fráze ani interní procesní omáčku.

## 3. Linear Field Standard

### Povinná pole pro issue

- `Title` - stručný, výstupově orientovaný název
- `Project` - povinný pro vše, co patří do produktu nebo iniciativy
- `Label` - právě jeden hlavní typ: `FE`, `DSN`, `BE`, případně `Test`
- `Priority` - povinná podle dopadu a pořadí dodání

### Volitelná pole podle situace

- `Parent issue` - použít pro větší celky, shared komponenty nebo rozpad delivery
- `Assignee` - až ve chvíli, kdy je task připravený k realizaci
- Doplňkové `Labels` - použít jen pokud zvyšují orientaci v backlogu, např. `shared-component`, `blocked`, `api`, `design`

### Pravidla pro použití polí

- `Project` nesmí být duplikován v popisu issue.
- Hlavní `Label` určuje, jaké části šablony jsou povinné.
- `Priority` se nepíše do textu ticketu.
- Pokud se jedna funkcionalita používá na 2 a více obrazovkách, vzniká samostatný issue a původní issues se propojí přes dependency link.

## 4. Naming Convention

### Pravidla pro title

- Začínat slovesem popisujícím výsledek práce.
- Pojmenovat konkrétní obrazovku, komponentu, tok nebo endpoint.
- Nepoužívat vágní formulace typu `řešení pro`, `zapracování`, `dodělat`, `úpravy`.
- U leaf tasků používat prefix podle typu práce:
  - `DSN:`
  - `FE:`
  - `BE:`
- Produktový nebo analytický task bez explicitního delivery prefixu může zůstat bez prefixu.
- `[Fáze X]` patří do názvu umbrella / parent issue, ne do názvu leaf tasku.

### Doporučené vzory

- `[Fáze 1] Auth a účet`
- `FE: Implementovat registraci a přihlášení`
- `DSN: Navrhnout obrazovky registrace a přihlášení`
- `BE: Implementovat registraci, přihlášení a session`
- `FE: Implementovat Market sekci (katalog nabídek)`

## 5. Project Template

`Project` má být stručný, rozhodovací a snadno přenositelný mezi iniciativami. Struktura níže odpovídá reálným projektům v Linearu.

### Project title

- Název iniciativy nebo produktu

### Project description template

```md
## Goal

[Popis cíle projektu. První věta říká, co se má doručit nebo připravit. Druhá věta vysvětluje proč a jaké rozhodnutí nebo výsledek se má uzamknout.]

## In scope

- [konkrétní oblast 1]
- [konkrétní oblast 2]
- [konkrétní oblast 3]

## Out of scope

- [co do projektu nepatří]
- [co se řeší později]

## Definition of Done

- [ ] [měřitelná podmínka 1]
- [ ] [měřitelná podmínka 2]
- [ ] [měřitelná podmínka 3]

## Issue groups

- [skupina issue 1]
- [skupina issue 2]
- [skupina issue 3]
```

### Pozorovaný vzor z Instrumento

Projektové popisy v `Instrumento` drží tento pattern:

- `Goal` říká, co se má připravit nebo doručit, a hned doplňuje proč je to důležité pro navazující fázi.
- `In scope` kombinuje produktové, designové i technické oblasti v jednom seznamu.
- `Out of scope` explicitně odřezává věci, které by jinak sváděly k rozšíření scope.
- `Definition of Done` používá checklist výsledků, ne checklist aktivit.
- `Issue groups` se používají tam, kde projekt potřebuje dopředu rozdělit backlog do tematických celků.

## 6. Univerzální Linear Issue Template

Tahle šablona je zjednodušená, ale v praxi preferuj šablony níže podle typu práce (DSN/FE/BE). Hlavní rozdíl: do popisu nepiš `Dependencies / References` a místo toho propoj issues přes Linear relations.

```md
## Context / Goal

[Co je cílem tasku a proč vzniká. Typicky 2 krátké věty.]

## Scope

**In scope:**

- [ ] [Co je součástí tasku]
- [ ] [Co je součástí tasku]

## Out of scope

**Out of scope:**

- [ ] [Co není součástí tasku]
- [ ] [Co není součástí tasku]

## Requirements

- [ ] [funkční nebo technický požadavek]
- [ ] [funkční nebo technický požadavek]
- [ ] [funkční nebo technický požadavek]

## Edge cases

- [ ] [hraniční případ] - [jak se řeší]
- [ ] [hraniční případ] - [jak se řeší]

## Acceptance criteria

- [ ] [měřitelná podmínka hotovo]
- [ ] [měřitelná podmínka hotovo]
- [ ] [měřitelná podmínka hotovo]

## Output

- [ ] [Pouze pokud je výstup design nebo jiný explicitní deliverable]
- [ ] [Např. Figma soubor, wireframy, report]
```

## 7. Šablony podle typu práce

### 7.1 DSN

Použití:
- wireframy
- hi-fi design
- návrh obrazovek
- návrh komponent
- design system

```md
## Popis a cíl

[Co má designér vytvořit a proč. 2–3 věty. Obecně - bez výčtu konkrétních obrazovek nebo míst použití.]

## Obsah / Funkce

### 1. [Název obrazovky nebo části]

Obsah

* **[Hlavní prvek 1]**
  * [Podprvek / vlastnost]
  * [Podprvek / vlastnost]
* **[Hlavní prvek 2]**
* **[Hlavní prvek 3]**

### 2. [Název obrazovky nebo části]

Obsah

* **[Hlavní prvek 1]**
  * [Podprvek / vlastnost]

## Stavy

**Výchozí**

- [ ] [Konkrétní default stavy]
- [ ] [Konkrétní default stavy]

**Hover**

Viz Design system

**Chybový**

- [ ] [Obecný chybový pattern] - Viz Design system
- [ ] [Screen-specific chyba nebo empty state]
- [ ] [Screen-specific chyba nebo empty state]

## Požadavky na design

**Kompozice**

[Popis kompozice]

**Další požadavky**

[Doplňující požadavky]

**Responzivita**

- [ ] Mobil (375px): ano / ne
- [ ] Tablet (768px): ano / ne
- [ ] Desktop (1280px): ano / ne

**Inspirace**

Není k dispozici

**Návrh**

Není k dispozici

## Rozsah

**In scope:**

- [ ] [Co je součástí]
- [ ] [Co je součástí]

**Out of scope:**

- [ ] [Co není součástí]
- [ ] [Co není součástí]

## Výstup

- [ ] [Očekávaný deliverable]
- [ ] Breakpointy: Mobil (375px), Tablet (768px), Desktop (1280px)
```

### 7.2 Pravidla pro DSN

- `Popis a cíl` - obecný popis, bez výčtu konkrétních obrazovek nebo míst použití
- `Obsah / Funkce` piš hierarchicky
- obrazovka nebo velká část = `###`
- hlavní prvky piš tučně
- detaily piš jako pododrážky
- `Header` a `Footer` mohou být samostatné sekce, pokud jsou shared
- u `Hover` nepřepisuj design system, stačí `Viz Design system`
- u `Chybový` rozděl:
  - obecné komponentové chyby = `Viz Design system`
  - specifické chyby obrazovky rozepsat
- `Inspirace` a `Návrh` mají defaultně hodnotu `Není k dispozici`, pokud není řečeno jinak
- `Responzivita` je povinná vždy - pokud PM určí které breakpointy jsou v scope, vyplň konkrétně (`ano` / `ne`) a stejné hodnoty použij konzistentně i v navazujících FE taskách; pokud není řečeno, nech jako checkboxy k doplnění
- před úpravou DSN tasku se vždy zeptej, zda chceš opravit popis, nebo jen přidat komentář a přeskočit
- komentář u DSN tasku má vždy znít: „Nemáme design, přeskakuji - máme demo app."

### 7.3 FE

Použití:
- frontendová implementace obrazovky
- frontendová implementace komponenty
- frontendové stavy a interakce

```md
## Popis a cíl

[Co obrazovka nebo komponenta dělá a proč. 2–3 věty. Obecný popis - bez výčtu konkrétních míst použití v aplikaci.]

## Funkčnost

- [ ] [Funkce 1]
- [ ] [Funkce 2]
- [ ] [Funkce 3]

## Edge cases

- [ ] [Případ 1] - [jak řešit]
- [ ] [Případ 2] - [jak řešit]

## Technická a další omezení

- [ ] [Validační nebo business pravidlo platné pro všechny instance této komponenty / obrazovky]
- [ ] [Validační nebo business pravidlo]
- [ ] Další dle jednotlivých tasků

## Rozsah

**In scope:**

- [ ] [Co je součástí]
- [ ] [Co je součástí]

**Out of scope:**

- [ ] [Co není součástí]
- [ ] [Co není součástí]

**Responzivita**

- [ ] Mobil (375px) - [ano / ne]
- [ ] Tablet (768px) - [ano / ne]
- [ ] Desktop (1280px) - [ano / ne]

## Uživatelské scénáře

**Legends**

- Backlog
- Done
- Not done
- There is some problem

---

**Výchozí stav**

- [ ] **[Jako uživatel chci ..., abych ...]**

1. [Uživatel provede akci - vždy první krok.]
2. [Systém reaguje.]

**Hover stav**

- [ ] **Hover - [název konkrétního prvku]**
- [ ] **Hover - [název dalšího prvku]**

**Chybový stav**

- [ ] **[Jako uživatel musím být informován o chybě, pokud ...]**

1. [Uživatel provede akci - vždy první krok.]
2. [Systém zobrazí chybu.]
```

### 7.4 FE pravidla

- sekci `## Design` do FE tasku nedávej - vazba na DSN řeší `Linked work items`
- `Popis a cíl` - obecný, bez výčtu konkrétních obrazovek nebo míst v aplikaci kde se komponenta/screen používá
- `Uživatelské scénáře` jsou součást FE tasku
- první krok každého scénáře musí být **akce uživatele**, ne systémová reakce
- hover scénáře jsou **bez kroků** - jen `- [ ] **Hover - název prvku**`
- hover scénáře rozděl na **jednotlivé prvky** (např. primární tlačítko, sekundární tlačítko, X tlačítko zvlášť)
- `Technická a další omezení` obsahuje **business a validační pravidla**: maximální délky polí, povolené formáty souborů, datové formáty, autorizační pravidla (např. přístup pouze pro roli X) - pravidla platná univerzálně pro všechny instance; zbytek patří do `Další dle jednotlivých tasků`
- `Technická a další omezení` **neobsahuje** implementační rozhodnutí jako správa stavu, strategie cachování nebo volba konkrétních knihoven
- `In scope` a `Out of scope` popisují **funkční rozsah** - co uživatel může nebo nemůže dělat; nepatří sem implementační detaily jako volba knihovny, způsob ukládání dat nebo strategie cachování
- checkbox formát je vždy `- [ ]` - bez mezery uvnitř, bez pomlčky
- pokud FE task pokrývá více entit nebo oblastí (např. Tenanti a Lokace), rozděl sekce `## Funkčnost`, `## Edge cases` i `## Uživatelské scénáře` pomocí `###` podnadpisů - konzistentně ve všech sekcích
- modální sekce v Uživatelských scénářích se dělí na **Výchozí stav / Hover stav / Chybový stav** - stejně jako hlavní scénáře; Výchozí stav má kroky (otevření modalu a zobrazení), Hover a Chybový jsou pouze checkboxy bez kroků
- odkaz na sdílenou komponentu se zapisuje jako „viz [název komponenty]" přímo v textu sekce `## Funkčnost` - bez task klíče; propojení se řeší přes `Linked work items`

### 7.5 BE

Použití:
- GraphQL query / mutation
- backendová business logika
- session / auth / authz
- zápis přes `ent` do `PostgreSQL`
- návaznost na mikroservisy nebo backendové funkce

```md
## Popis

[Co backendová změna dělá. 2–3 věty. Pokud je text komplexní, strukturuj pomocí `###` podnadpisů.]

## Akceptační kritéria

- [ ] [Kritérium 1]
- [ ] [Kritérium 2]
- [ ] [Kritérium 3]
```

### 7.6 BE pravidla

- struktura BE tasku obsahuje **pouze** `## Popis` a `## Akceptační kritéria`
- pokud je Popis komplexní, strukturuj ho pomocí `###` podnadpisů - jeden dlouhý odstavec je špatně čitelný
- piš `GraphQL query` nebo `GraphQL mutation`
- nezakládej backend task jako neurčité „udělat auth", když jde rozpadnout
- pokud se task týká jiné service boundary, rozděl ho
- `ent`, `PostgreSQL` a service kontext zmiňuj jen tam, kde je to důležité pro zadání
- pokud epic zahrnuje více vzájemně závislých BE entit, vytvoř hierarchii tasků: nejdřív architektura/infrastruktura, pak entity v pořadí FK závislostí

## 8. Backendový kontext pro Instrumento

Při psaní `BE` tasků počítej s tímto technickým kontextem:

- frontend je `Nuxt`
- backend / BaaS je `Supabase`
- autentizace je `Supabase Auth`
- persistence je `PostgreSQL` přes Supabase
- auth a přístupová pravidla se řeší přes Supabase capabilities a RLS, pokud není výslovně řečeno jinak
- pokud je potřeba server-side logika, preferuj jednoduchou service boundary a funkce nad zbytečným vrstvením

Praktický dopad:
- v `BE` tasku piš jen to, co je pro zadání důležité
- nemíchej do jednoho tasku více backendových témat, pokud to jde rozdělit
- pokud task mění přístup nebo session, počítej s dopadem na auth flow

## 9. Mapování Linear -> obsah šablony

| Linear prvek | Co to znamená | Poznámka |
| --- | --- | --- |
| Project | hlavní delivery blok / iniciativa | často odpovídá `[Fáze X]` celek |
| Parent issue | umbrella issue uvnitř projektu | může sdružovat FE / BE / DSN rozpad |
| Label | hlavní typ práce | `FE`, `DSN`, `BE`, případně `Test` |
| Blocks / blocked by | tvrdá návaznost | používat pro skutečné blokace |
| related | měkčí vazba | vhodné pro reference a související issue |

## 10. Pravidla pro AI generování

- Použij pouze sekce definované v tomto dokumentu.
- Neopakuj metadata z Linear polí v `description`.
- Vyber přesně jeden hlavní label `FE`, `DSN`, `BE` nebo `Test`.
- `Title` piš primárně česky, stručně a výstupově.
- `Description` piš česky.
- `In scope` a `Out of scope` ponech anglicky.
- Projektové popisy piš stejně úsporně jako v `Instrumento`: 1 cíl, jasný scope, jasné DoD.
- Vyplň pouze sekce relevantní pro daný typ práce, ale nikdy neměň pořadí sekcí.
- Pokud task pokrývá shared komponentu pro 2 a více obrazovek, navrhni samostatný issue a propojení přes linky místo duplikace textu.
- Nepřidávej sekce jako `Notes`, `Implementation detail`, `QA`, pokud nejsou výslovně požadované.
- `Acceptance criteria` musí být měřitelná a ověřitelná.
- `Dependencies / References` do popisu nepiš; používej Linear relations.

## 11. Referenční příklady

### FE issue

**Title**

`FE: Implementovat Market sekci (katalog nabídek)`

**Fields**

- `Project`: Fáze 1 - MVP
- `Label`: FE
- `Priority`: High

**Description**

```md
## Context / Goal

Implementovat hlavní market sekci aplikace jako vstupní místo pro procházení nabídek. Uživatel zde najde seznam nabídek, vyhledávání a základní přehled nad tím, co si může půjčit.

## Scope

**In scope:**

- [ ] seznam nabídek
- [ ] vyhledávání a základní filtrování
- [ ] vstup do detailu nabídky

## Out of scope

**Out of scope:**

- [ ] interní správa nabídky
- [ ] payment flow

## Requirements

- [ ] Market sekce musí fungovat jako výchozí veřejný pohled po přihlášení
- [ ] Karta nabídky musí být klikací a vést do detailu
- [ ] Stránka musí fungovat na mobilu i desktopu

## Edge cases

- [ ] Není žádná nabídka - zobrazí se empty state
- [ ] Backend nevrátí data - zobrazí se chybový stav

## Acceptance criteria

- [ ] Uživatel vidí seznam nabídek
- [ ] Uživatel může otevřít detail nabídky z karty
- [ ] Obrazovka má funkční empty a error state
```

### DSN issue

**Title**

`DSN: Navrhnout obrazovky registrace a přihlášení`

**Fields**

- `Project`: Fáze 1 - MVP
- `Label`: DSN
- `Priority`: High

**Description**

```md
## Context / Goal

Navrhnout obrazovky registrace a přihlášení pro MVP marketplace. Cílem je připravit jasný a srozumitelný vstup do aplikace pro nové i vracející se uživatele a sjednotit obsah, hlavní akce a základní stavy těchto obrazovek před implementací.

## Scope

**In scope:**

- [ ] přihlašovací obrazovka
- [ ] registrační obrazovka
- [ ] základní validace a stavy

## Out of scope

**Out of scope:**

- [ ] reset hesla jako samostatná obrazovka
- [ ] sociální přihlášení
- [ ] vícefaktorové ověření

## Requirements

- [ ] obrazovky musí obsahovat všechny povinné inputy a CTA
- [ ] návrh musí pokrývat výchozí, hover a chybové stavy
- [ ] breakpointy: mobil, tablet, desktop

## Edge cases

- [ ] neplatný e-mail
- [ ] již existující e-mail při registraci

## Acceptance criteria

- [ ] Existuje návrh přihlašovací obrazovky
- [ ] Existuje návrh registrační obrazovky
- [ ] Jsou připravené hlavní stavy pro implementaci

## Output

- [ ] Figma soubor s návrhem
- [ ] Breakpointy: Mobil 375px, Tablet 768px, Desktop 1280px
```

### BE issue

**Title**

`BE: Implementovat registraci, přihlášení a session`

**Fields**

- `Project`: Fáze 1 - MVP
- `Label`: BE
- `Priority`: High

**Description**

```md
## Popis

Implementovat backendovou podporu pro registraci, přihlášení a správu session uživatele. Cílem je vytvořit spolehlivý základ pro vstup do aplikace a navázané MVP flow.

## Akceptační kritéria

- [ ] Backend umožňuje registraci nového uživatele
- [ ] Backend umožňuje přihlášení existujícího uživatele
- [ ] Frontend může načíst aktuálně přihlášeného uživatele
```

## 12. Rychlá pravidla

- `Dependencies / References` do popisu issue nepatří - používej `Linear relations`.
- Směr blokace: `DSN blocks FE`, `BE blocks FE`.
- Checkbox formát: `- [ ]` bez pomlčky uvnitř položky, ale s pomlčkou na začátku řádku.
