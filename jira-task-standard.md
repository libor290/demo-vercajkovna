# METODIKA
## Tvorba Jira tasků
### Projekt STAN

Tento dokument slouží jako závazná metodika pro AI i pro členy týmu při zakládání a úpravách Jira issue v projektu STAN.

Cíl dokumentu:
- sjednotit strukturu epiců a tasků
- sjednotit tón a míru detailu
- vyjasnit rozdíl mezi `DSN`, `FE`, `BE` a produktovým taskem bez prefixu
- určit, co patří do popisu issue a co se má řešit přes `Linked work items`

Verze 3.3 | Březen 2026 | MLJ Solutions

---

## 1. Základní principy

- Každý task má být čitelný samostatně, ale bez zbytečné duplicitní omáčky.
- Do popisu patří jen to, co má být opravdu součástí zadání.
- Závislosti, návaznosti a blokace se řeší přes Jira `Linked work items`, ne přes textovou sekci `Dependencies / References`.
- Pokud bez jiné práce nelze pokračovat, má být issue navázané přes `Blocks`.
- `DSN` prefix používej jen pro skutečný designový task.
- Produktové nebo analytické tasky bez explicitního design deliverable nemají prefix `DSN`.
- `FE` a `BE` prefixy používej pro implementační tasky.
- Názvy tasků piš primárně česky. Angličtinu použij jen tam, kde je to přirozený a zavedený název.
- Označení fáze (`[Fáze X]`) patří pouze do názvu epicu - nikdy do názvu jednotlivých tasků.
- Zrušený task označuj prefixem `[CANCELLED]` v názvu - workflow projektu nemá Cancelled status.
- Nepřidávej vlastní sekce mimo tuto metodiku.

---

## 2. Tón a styl

- Piš věcně, stručně a produktově-technicky.
- Nepoužívej marketingové formulace.
- Nepoužívej výplňové věty.
- Piš konkrétně, co se má dodat, ne obecně co se "nějak upraví".
- `In scope` a `Out of scope` zůstávají anglicky.
- `E-mail` piš vždy s pomlčkou.

---

## 3. Jira pravidla

### 3.1 Epic

Epic je střešní celek pro jednu část Fáze nebo větší delivery blok.

Popis epiku obsahuje pouze:
- `## Popis a cíl`
- `## Definition of Done`

### 3.2 Linked work items

Do popisu tasku se nepíše:
- dependencies
- references
- linked issue list

Místo toho se používá Jira propojení:
- `Blocks`
- `is blocked by`
- případně jiné vazby podle potřeby

**Směr blokace:**
- `DSN blocks FE` - design musí existovat před implementací
- `BE blocks FE` - backendové API musí existovat před frontendovou implementací
- pokud feature čeká na umbrella design epic, použij blokaci na ten epic
- pokud je funkcionalita shared pro více screenů, udělej samostatný task a propoj ho linky

**Nikdy:**
- `FE blocks DSN` - špatný směr
- `FE blocks BE` - špatný směr

### 3.3 Rozpad tasků

- `DSN` může spojit více blízce souvisejících obrazovek do jednoho návrhového tasku
- `FE` a `BE` tasky dělíme jemněji podle skutečné implementační práce
- pokud je task příliš široký, rozděl ho
- pokud jedna schopnost služby znamená jednu jasnou backendovou změnu, preferuj jeden samostatný `BE` task

---

## 4. Typy tasků

Projekt používá tyto typy tasků:
- `DSN`
- `FE`
- `BE`
- produktový / analytický task bez prefixu

### 4.1 DSN

Použití:
- wireframy
- hi-fi design
- návrh obrazovek
- návrh komponent
- design system

### 4.2 FE

Použití:
- frontendová implementace obrazovky
- frontendová implementace komponenty
- frontendové stavy a interakce

### 4.3 BE

Použití:
- GraphQL query / mutation
- backendová business logika
- session / auth / authz
- zápis přes `ent` do `PostgreSQL`
- návaznost na mikroservisy

### 4.4 Produktový task bez prefixu

Použití:
- pokud nejde o design
- pokud nejde o FE nebo BE implementaci
- pokud je potřeba produktové nebo analytické rozhodnutí

Nepoužívej ho automaticky. Zakládej ho jen když je skutečně potřeba.

### 4.5 Test task

Použití:
- manuální testování feature PM

Pravidla:
- pojmenování: `Test: [název feature]` (bez dalšího prefixu)
- label: `Test`
- zakládá se v příslušném QA epicu dané fáze
- popis obsahuje checklist scénářů k ručnímu ověření

---

## 5. Backendový kontext pro STAN

Při psaní `BE` tasků počítej s tímto technickým kontextem:

- architektura je po mikroservisách
- jedno téma = jedna service
- existující service oblasti:
  - autentikace
  - autorizace
  - tenant management
  - e-mailing
  - správa souborů

### Autentikace

- podporované typy: `password`, `oauth`
- token model: JWT access token + refresh token
  - `accessToken`, `expiresIn`
  - `refreshToken`, `refreshTokenExpiresIn`
- session operace: `login`, `refresh`, `revoke`, `revokeAll`
- uživatelské operace: `registerUser`, `updateMe`, `updateUser`, `updateUserPassword`, `anonymizeUser`, `deleteUser`
- user profil je uložen jako volný JSON (`Map` typ - `profile`)

### Autorizace

- postavená na **Casbin**
- autorizační model (entity `Model`) definuje:
  - `requestDefinition` - co se ověřuje
  - `policyDefinition` - struktura policy pravidla
  - `policyEffect` - výsledný efekt
  - `matchers` - výraz pro vyhodnocení
  - `roleDefinition` - definice rolí (grouping)
- pravidla se ukládají jako `Rule` s poli `ptype` (`p` = policy, `g` = grouping) a `v0`–`v5`
- operace: `addRule`, `updateRule`, `deleteRule`
- scope je strukturovaný jako `resource` + `action`
- uživatel dostane scopes po přihlášení jako součást `LoginResponse`

### Multi-tenancy

- každá entita nese `tenantID`
- tenant má volná metadata jako JSON (`Map` typ - `metadata`)
- operace: `createTenant`, `updateTenant`, `deleteTenant`, `patchTenantMetadata` (deep merge)

### Pagination

- Relay cursor-based pattern: `Connection` / `Edge` / `PageInfo`
- `PageInfo` obsahuje: `hasNextPage`, `hasPreviousPage`, `startCursor`, `endCursor`
- každá kolekce vrací `totalCount`
- filtrování přes `WhereInput` (generováno `ent`)
- řazení přes `OrderInput` s `OrderDirection`

### Persistence a API

- persistence: `ent` + `PostgreSQL`
- API vrstva: `GraphQL`
- input typy generovány přes `ent` (`CreateXInput`, `UpdateXInput`, `XWhereInput`)

Praktický dopad:
- v `BE` tasku používej `GraphQL query` nebo `GraphQL mutation`, ne REST endpoint, pokud není výslovně řečeno jinak
- nemíchej do jednoho tasku více backendových témat, pokud to jde rozdělit po service boundary
- autorizační logika jde do Casbin modelu / pravidel - ne do aplikační vrstvy
- pokud task mění přístupy, počítej s dopadem na `Rule` (ptype `p` nebo `g`)

---

## 6. Šablona Epicu

```md
## Popis a cíl

[Popiš co epic pokrývá a jaký je jeho cíl. 2–3 věty.]

## Definition of Done

[] [Podmínka 1]
[] [Podmínka 2]
[] [Podmínka 3]
```

---

## 7. Šablona DSN tasku

Používej pro designové tasky.

### 7.1 Povinné sekce

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

* [Konkrétní default stavy]
* [Konkrétní default stavy]

**Hover**

Viz Design system

**Chybový**

* [Obecný chybový pattern] - Viz Design system
* [Screen-specific chyba nebo empty state]
* [Screen-specific chyba nebo empty state]

## Požadavky na design

**Kompozice**

[Popis kompozice]

**Další požadavky**

[Doplňující požadavky]

**Responzivita**

[] Mobil (375px): ano / ne
[] Tablet (768px): ano / ne
[] Desktop (1280px): ano / ne

**Inspirace**

Není k dispozici

**Návrh**

Není k dispozici

## Rozsah

**In scope:**

* [Co je součástí]
* [Co je součástí]

**Out of scope:**

* [Co není součástí]
* [Co není součástí]

## Výstup

* [Očekávaný deliverable]
* Breakpointy: Mobil (375px), Tablet (768px), Desktop (1280px)
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

---

## 8. Šablona FE tasku

Používej pro frontendovou implementaci.

### 8.1 Povinné sekce

```md
## Popis a cíl

[Co obrazovka nebo komponenta dělá a proč. 2–3 věty. Obecný popis - bez výčtu konkrétních míst použití v aplikaci.]

## Funkčnost

* [Funkce 1]
* [Funkce 2]
* [Funkce 3]

## Edge cases

* [Případ 1] - [jak řešit]
* [Případ 2] - [jak řešit]

## Technická a další omezení

* [Validační nebo business pravidlo platné pro všechny instance této komponenty / obrazovky]
* [Validační nebo business pravidlo]
* Další dle jednotlivých tasků

## Rozsah

**In scope:**

* [Co je součástí]
* [Co je součástí]

**Out of scope:**

* [Co není součástí]
* [Co není součástí]

**Responzivita**

* Mobil (375px) - [ano / ne]
* Tablet (768px) - [ano / ne]
* Desktop (1280px) - [ano / ne]

## Uživatelské scénáře

**Legends**

* Backlog
* Done
* Not done
* There is some problem

---

**Výchozí stav**

[] **[Jako uživatel chci ..., abych ...]**

1. [Uživatel provede akci - vždy první krok.]
2. [Systém reaguje.]

**Hover stav**

[] **Hover - [název konkrétního prvku]**

[] **Hover - [název dalšího prvku]**

**Chybový stav**

[] **[Jako uživatel musím být informován o chybě, pokud ...]**

1. [Uživatel provede akci - vždy první krok.]
2. [Systém zobrazí chybu.]
```

### 8.2 Pravidla pro FE

- sekci `## Design` do FE tasku nedávej - vazba na DSN řeší `Linked work items`
- `Popis a cíl` - obecný, bez výčtu konkrétních obrazovek nebo míst v aplikaci kde se komponenta/screen používá
- `Uživatelské scénáře` jsou součást FE tasku
- první krok každého scénáře musí být **akce uživatele**, ne systémová reakce
- hover scénáře jsou **bez kroků** - jen `[] **Hover - název prvku**`
- hover scénáře rozděl na **jednotlivé prvky** (např. primární tlačítko, sekundární tlačítko, X tlačítko zvlášť)
- `Technická a další omezení` obsahuje **business a validační pravidla**: maximální délky polí, povolené formáty souborů, datové formáty, autorizační pravidla (např. přístup pouze pro roli X) - pravidla platná univerzálně pro všechny instance; zbytek patří do `Další dle jednotlivých tasků`
- `Technická a další omezení` **neobsahuje** implementační rozhodnutí jako správa stavu, strategie cachování nebo volba konkrétních knihoven
- `In scope` a `Out of scope` popisují **funkční rozsah** - co uživatel může nebo nemůže dělat; nepatří sem implementační detaily jako volba knihovny, způsob ukládání dat nebo strategie cachování
- checkbox formát je vždy `[]` - bez mezery uvnitř, bez pomlčky
- pokud FE task pokrývá více entit nebo oblastí (např. Tenanti a Lokace), rozděl sekce `## Funkčnost`, `## Edge cases` i `## Uživatelské scénáře` pomocí `###` podnadpisů - konzistentně ve všech sekcích
- modální sekce v Uživatelských scénářích se dělí na **Výchozí stav / Hover stav / Chybový stav** - stejně jako hlavní scénáře; Výchozí stav má kroky (otevření modalu a zobrazení), Hover a Chybový jsou pouze checkboxy bez kroků
- odkaz na sdílenou komponentu se zapisuje jako „viz [název komponenty]" přímo v textu sekce `## Funkčnost` - bez task klíče (např. STAN-88); propojení se řeší přes `Linked work items`

---

## 9. Šablona BE tasku

Používej pro backendovou implementaci.

```md
## Popis

[Co backendová změna dělá. 2–3 věty.]

## Akceptační kritéria

[] [Kritérium 1]
[] [Kritérium 2]
[] [Kritérium 3]
```

### 9.1 Pravidla pro BE

- struktura BE tasku obsahuje **pouze** `## Popis` a `## Akceptační kritéria`
- pokud je Popis komplexní, strukturuj ho pomocí `###` podnadpisů (např. `### Typy notifikací`, `### Datový model`, `### Autentizace a filtrování`) - jeden dlouhý odstavec je špatně čitelný
- piš `GraphQL query` nebo `GraphQL mutation`
- nezakládej backend task jako neurčité „udělat auth", když jde rozpadnout
- pokud se task týká jiné service boundary, rozděl ho
- `ent`, `PostgreSQL` a service kontext zmiňuj jen tam, kde je to důležité pro zadání
- pokud epic zahrnuje více vzájemně závislých BE entit, vytvoř hierarchii tasků: nejdřív architektura/infrastruktura (middleware, izolace dat), pak entity v pořadí FK závislostí. Vzor: `BE: [oblast] architektura` → `BE: [entita A]` → `BE: [entita B s FK na A]`

---

## 10. Příklady

### 10.1 Epic příklad

```md
## Popis a cíl

Doručit bezpečný vstup do aplikace STAN a řízení přístupů podle role a kontextu uživatele. Cílem je umožnit přihlášení, registraci, obnovu hesla a správné vyhodnocení oprávnění tak, aby uživatel po vstupu viděl jen to, co odpovídá jeho roli a přiřazení.

## Definition of Done

[] Uživatel se může registrovat a přihlásit do aplikace
[] Uživatel může obnovit přístup přes flow zapomenutého hesla
[] Aplikace správně vyhodnocuje oprávnění podle role a přiřazení uživatele
```

### 10.2 DSN příklad

```md
## Popis a cíl

Navrhnout vstupní obrazovky do aplikace STAN pokrývající přihlášení, registraci a obnovu hesla. Cílem je poskytnout podklad pro navazující hi-fi design a frontendovou implementaci.

## Obsah / Funkce

### 1. Přihlašovací obrazovka

Obsah

* **E-mail input**
  * label "E-mail"
  * povinné pole
  * validace formátu
* **Heslo input**
  * label "Heslo"
  * povinné pole
  * ikona pro zobrazení/skrytí hesla
* **Tlačítko "Přihlásit se"**
* **Odkaz "Zapomenuté heslo?"**
* **Odkaz nebo přechod na registraci**

## Stavy

**Výchozí**

* Formulář je prázdný, tlačítko "Přihlásit se" je aktivní

**Hover**

Viz Design system

**Chybový**

* Validace polí - Viz Design system
* Neplatné přihlašovací údaje - zobrazit inline chybovou zprávu pod formulářem

## Požadavky na design

**Kompozice**

Centrovaný formulář na celé obrazovce.

**Další požadavky**

Bez dalších požadavků.

**Responzivita**

[] Mobil (375px): ano
[] Tablet (768px): ano
[] Desktop (1280px): ano

**Inspirace**

Není k dispozici

**Návrh**

Není k dispozici

## Rozsah

**In scope:**

* Přihlašovací obrazovka
* Registrační obrazovka
* Základní validace a stavy

**Out of scope:**

* Reset hesla jako samostatná obrazovka
* Sociální přihlášení
* Vícefaktorové ověření

## Výstup

* Návrh přihlašovací obrazovky
* Návrh registrační obrazovky
* Mobilní, tabletová a desktopová varianta
```

### 10.3 FE příklad

```md
## Popis a cíl

Implementovat přihlašovací a registrační formulář pro aplikaci STAN. Cílem je umožnit novému i vracejícímu se uživateli bezpečně vstoupit do aplikace a navázat na další flow produktu.

## Funkčnost

* Přihlášení pomocí e-mailu a hesla
* Registrace pomocí jména, e-mailu a hesla
* Validace vstupů před odesláním
* Redirect po úspěšném vstupu do aplikace

## Edge cases

* Neplatný e-mail - zobrazit validační chybu a neodesílat formulář
* Existující e-mail při registraci - zobrazit chybu a zachovat vyplněná pole

## Technická a další omezení

* E-mail musí být validní
* Jméno je povinné při registraci
* Heslo musí splnit minimální backendové požadavky

## Rozsah

**In scope:**

* Přihlašovací formulář
* Registrační formulář
* Základní chybové stavy

**Out of scope:**

* Reset hesla
* Sociální přihlášení
* Vícefaktorové ověření

**Responzivita**

* Mobil (375px) - ano
* Tablet (768px) - ano
* Desktop (1280px) - ano

## Uživatelské scénáře

**Legends**

* Backlog
* Done
* Not done
* There is some problem

---

**Výchozí stav**

[] **Jako nový uživatel se mohu registrovat, abych mohl aplikaci používat.**

1. Uživatel otevře registrační obrazovku.
2. Uživatel vyplní jméno, e-mail, heslo a potvrzení hesla.
3. Systém ověří vstupy a umožní odeslat formulář.

**Hover stav**

[] **Hover - primární tlačítko**

[] **Hover - textový odkaz**

**Chybový stav**

[] **Jako uživatel musím být informován o chybě, pokud zadám neplatný e-mail.**

1. Uživatel vyplní neplatný formát e-mailu.
2. Systém zobrazí validační chybový stav u pole e-mail.
```

### 10.4 BE příklad

```md
## Popis

Implementovat backendovou podporu pro registraci, přihlášení a správu session uživatele. Cílem je vytvořit spolehlivý základ pro vstup do aplikace a navázané MVP flow.

## Akceptační kritéria

[] Backend umožňuje registraci nového uživatele
[] Backend umožňuje přihlášení existujícího uživatele
[] Frontend může načíst aktuálně přihlášeného uživatele
```

---

## 11. Rychlá pravidla

- `Dependencies / References` do popisu issue nepatří - používej `Linked work items`.
- Směr blokace: `DSN blocks FE`, `BE blocks FE`.
- Checkbox formát: `[]` bez mezery uvnitř, bez pomlčky.
