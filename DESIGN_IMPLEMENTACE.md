# Vercajkovna — Implementační brief
> Převod stávající Vue app (`src/App.vue` + `src/styles.css`) na nový design z `claude_design_vercajkovna/project/`

---

## 1. Design tokeny — co se mění v `styles.css`

### Barvy (`:root`)
```css
/* STARÁ paleta → NOVÁ paleta */
--bg:           #ffffff        → #f3ede1   /* teplý papír */
--bg-soft:      #faf8f5        → #e9e0d1
--surface:      rgba(255,250,244,0.98) → #fdf9f1   /* card */
--surface-muted:#f4ebe1        → #e9e0d1
--border:       rgba(58,37,25,.16) → rgba(31,22,16,.14)
--text:         #352116        → #1f1610
--muted:        #6d584a        → #5a4a3c
--muted-2:      #8b7464        → #8a7a6a
--brand:        #3a2519        → #3a2519   /* zachovat */
--brand-2:      #1b5431        → #1b5431   /* zachovat */
--success:      #1b5431        → #1b5431
--danger:       #b44d38        → #9a3a1f
--shadow: ...                  → odstranit, nahradit border+radius
```

### Nový akcent systém — přidat do `:root`
```css
/* Akcent: zelená (výchozí) */
--accent:        #1b5431;
--accent-soft:   rgba(27,84,49,.12);
--accent-border: rgba(27,84,49,.28);
--accent-ink:    #0f3a22;
```

### Typografie
```css
/* Nové fonty — přidat do <head> */
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700;800;900&family=Fraunces:opsz,wght@9..144,700;9..144,800;9..144,900&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">

/* V :root */
--font-display: 'Playfair Display', Georgia, serif;   /* nadpisy */
--font-body:    'Inter', 'Helvetica Neue', sans-serif; /* tělo */
--font-mono:    'JetBrains Mono', monospace;           /* kikkery, labely */
--font-price:   'Fraunces', Georgia, serif;            /* ceny, logo */
```

### Zaoblení a stíny
```css
--radius-xl: 28px → 18px  (méně agresivní)
--radius-lg: 20px → 14px
--radius-md: 15px → 12px
--radius-sm: 11px → 8px
/* stíny: skoro žádné — border + subtilní bg */
```

---

## 2. Globální layout změny

### `body` + `.app-shell`
- `background: var(--bg)` → `#f3ede1` (teplý papír)
- Žádný bílý podklad za appkou

### Spodní navigace `.bottom-nav`
```
Stará:  Domů / Oblíbené / [FAB uprostřed] / Chat / Profil  (5 položek)
Nová:   Tržiště / Oblíbené / Zprávy / Profil  (4 položky, žádný FAB uprostřed)
```
- FAB (tlačítko "+") se přesouvá jako `position: absolute; bottom: 90px; right: 20px`
- Aktivní stav: `color: var(--accent)` + malý pruhy `height: 3px` nad ikonou
- Výška: `78px`, `padding-bottom: 14px`
- Ikony: 22px, label: 10.5px

### Kicker labely (kategorie, sekce)
Všude kde je uppercase label, použít:
```css
font-family: var(--font-mono);
font-size: 10px;
letter-spacing: 0.16em;
text-transform: uppercase;
color: var(--muted-2);
font-weight: 700;
```

---

## 3. Obrazovka po obrazovce

### AUTH (přihlášení / registrace)
**Struktura:** zachovat, ale změnit vizuál.

**Hero sekce nahoře:**
```
Logo (40px monogram) + "vercajkovna" (Fraunces 900) + "půjčujem si vercajk" (JetBrains Mono, 9.5px, uppercase)
↓
Velký nadpis (Playfair Display 32px, 800):
  Login:    "Vítej zpátky / v dílně." (slovo "v dílně." = italic, barva accent)
  Register: "Založ si / verštat." (slovo "verštat." = italic, accent)
↓
Podnadpis 14px, --muted
```

**Tab switcher (Přihlášení / Registrace):**
- `background: var(--bg-soft)`, padding: 4px, border-radius: 14px
- Aktivní tab: `background: white`, box-shadow jemný
- Výška: 40px

**Formulářová pole:**
- Výška: 52px, border-radius: 12px, border: 1.5px
- Focus border: `var(--accent)`
- Icon vlevo, input, volitelně akce vpravo

**CTA tlačítko:**
- `background: var(--brand)`, height: 54px, border-radius: 12px
- `font-weight: 700`, `text-transform: uppercase`, `letter-spacing: 0.06em`
- Text: "Jdeme na to" (login) / "Pojď do toho" (register)

**Demo profily:**
- Grid 2 sloupce
- Každá karta: avatar (32px) + jméno + role
- `background: var(--surface)`, border-radius: 12px, padding: 10px 12px

**Divider:** trojsloupcový grid `1fr auto 1fr` s textem "nebo přes"

**Social tlačítka:** 3 v řadě, height: 48px, jen symbol (G / Apple logo / f), border-radius: 12px

---

### ONBOARDING — NOVÁ OBRAZOVKA (přidat)
Po registraci: 4kroková flow.

**Step 1:** Hodnoty komunity (3 karty: Důvěra / Fair play / Sousedství)
**Step 2:** Ověření telefonu — input + SMS kód (4 samostatné inputy)
**Step 3:** Lokalita — tlačítko "Zjistit polohu" nebo input adresy
**Step 4:** Krátký tour — 3 tipy v kartách

Progress bar: 4 segmenty, aktivní = `var(--accent)`, neaktivní = `var(--bg-soft)`

---

### MARKET (tržiště)
**Header:**
- Logo (38px) + "vercajkovna" (Playfair 18px 800) + podtitulek
- Avatar vpravo (38px, kulatý) — klik = profil

**Velký nadpis:**
```
"Co bude"
"dneska?" ← italic, barva --accent
```
(Playfair Display, 30px, 800, letter-spacing: -0.03em)

**Search:**
- Input s ikonou lupy + tlačítko filtru (IconButton) vpravo
- Filter panel: `background: var(--surface)`, border, border-radius: 14px
  - Slider pro max. cenu

**Category chipy:**
- Scrollovatelné horizontálně, `scrollbar-width: none`
- Aktivní: `background: var(--brand)`, `color: #fff7e6`
- Neaktivní: `background: var(--surface)`, border
- Výška: ~38px, border-radius: 999px
- Každý chip: emoji glyph + label

**Hero karta (první výsledek):**
- Celá šířka, foto 200px výšky, zaoblení 18px
- Fav tlačítko (kruh 36px) vpravo nahoře
- Badge vlevo nahoře (brand background)
- Info: název (bold 15px) + lokace + vzdálenost + hvězdy
- Cena: Fraunces 22px 800 + "/ den" 12px muted

**Malé karty (zbytek):**
- Grid 2 sloupce, aspect-ratio: 4/3 pro foto
- Cena: Fraunces 16px 800

**FAB:**
- `position: absolute; bottom: 90px; right: 20px`
- 58px kruh, `background: var(--accent)`, box-shadow s accent barvou
- Ikona "+" 24px, stroke 2.4

---

### DETAIL inzerátu
**Hero foto:** 320px, position: relative
- Zpět tlačítko (kruh 42px) vlevo nahoře
- Fav tlačítko (kruh 42px) vpravo nahoře
- Badge "1 / 4" vpravo dole (blur backdrop)

**Content:**
- Badges (accent-soft background, rounded pills)
- Nadpis: Playfair 24px 800
- Hvězdy + lokace inline
- Cena box: Fraunces 34px 900 + "za den · kauce X Kč" + status "● volný dnes"
- Owner card: avatar 46px + jméno + "Na Vercajkovně od..." + tlačítko "Napsat"
- Popis + mini kalendář dostupnosti

**Sticky CTA:**
- Chat button (secondary, jen ikona) + "Rezervovat · X Kč/den" (accent, velký)

---

### OBLÍBENÉ
**Header:** kicker "— tvé oblíbené —" + nadpis "Vercajk na / příště."

**Prázdný stav:**
- Kruh 120px s dashed border + ikona srdce 40px
- Nadpis: Playfair 22px
- Text + tlačítko "Prozkoumat tržiště"

**S položkami:** stejný grid 2 sloupce jako market

---

### CHAT — seznam konverzací
**Header:** kicker + nadpis "Co je / nového?"

**Každá konverzace:**
- Avatar 46px + jméno (bold 14px) + čas
- Italic text pod jménem: `o „název inzerátu"`
- Last message: 13px, ellipsis
- Unread badge: kruh, accent background

---

### CHAT — vlákno
**Topbar:** ← tlačítko + jméno + kicker (název inzerátu) + phone ikona

**Bublinky:**
- Moje: accent background, bílý text, border-radius pravý dolní = 4px
- Jejich: surface background, border, border-radius levý dolní = 4px

**Input bar:**
- Input + send tlačítko (accent, 48px, border-radius: 12px)

---

### PROFIL — menu
**Hero karta:**
- Avatar 60px s ring (accent border) + jméno (Playfair 19px) + email + badge "Ověřený soused"

**Stats:** 3 karty v řadě — Půjčeno / Vypůjčeno / Hodnocení★

**Menu položky:**
- Ikona (38px čtverec, zaoblený, bg-soft) + label + meta text + chevron vpravo
- Ikony: Osobní údaje / Můj vercajk / Rezervace / Platby / Zabezpečení / Jazyk a měna / Oznámení / Nápověda

**Odhlásit:** červená barva `#9a3a1f`, border, šířka 100%

---

### PROFIL — osobní údaje
- Velký avatar 80px + tlačítko "Změnit foto"
- Grid formuláře: Jméno + Příjmení (2 sloupce) / Email / Telefon / Adresa / Bio (textarea)
- Sticky "Uložit změny" dole

---

### PLATBY
- Uložené karty: brand vizual (Visa = tmavě modrá, MC = červená) + číslo + platnost + badge "Výchozí"
- "Přidat kartu" secondary button
- Historie plateb: list s datem + item + částka (příjem zelená / platba brand)

---

### ZABEZPEČENÍ
- Sekce heslo: 3 inputy + tlačítko
- Sekce 2FA: karta s toggle přepínačem

---

### OZNÁMENÍ
- List s toggle přepínači pro každý typ

**Toggle přepínač (PToggle):**
```
width: 46px, height: 26px, border-radius: 999px
ON:  background: var(--accent)
OFF: background: var(--bg-soft)
Knob: 22px bílý kruh, transition transform 180ms
```

---

### PŘIDAT INZERÁT — 3kroková flow
**Krok 1 — Co budeš půjčovat?**
- Foto grid: 2×2, první slot je wide (2 sloupce), dashed border
- Název input
- Kategorie: grid 2 sloupce, každá kategorie jako chip s emoji + label

**Krok 2 — Za kolik a kdy?**
- Cena/den: input s "Kč / den" vpravo
- Kauce: toggle + podmíněný input
- Dostupnost: interaktivní kalendář s výběrem rozsahu
- Lokalita: radio (z profilu / vlastní adresa)

**Krok 3 — Pár detailů.**
- Tech parametry: Značka / Model / Výkon / Příslušenství (2 sloupce + full-width)
- Stav vercajku: custom dropdown
- Popis: textarea
- Způsob vyzvednutí: radio
- Pravidla: checkboxy

**Progress bar:** 3 segmenty, výška 4px, border-radius: 4px

**Success obrazovka:**
- Velký kruh (96px) s checkmark + animace vkPop
- "A máš po práci." (Playfair, italic accent)

---

### NÁPOVĚDA
- Nadpis "Jak ti pomůžem?"
- Accordion FAQ: border-radius: 12px, expand/collapse
- Contact box: accent-soft background, "Nenašel jsi odpověď?" + CTA

---

## 4. Sdílené komponenty — implementovat jako Vue composables nebo styly

### Button (`.btn`)
```
primary:   background: var(--brand), color: #fff7e6
accent:    background: var(--accent), color: white
secondary: background: var(--surface), color: var(--brand), border
ghost:     transparent, color: var(--brand)
danger:    transparent, color: #9a3a1f, border červená
```
Výška: sm=36 / md=48 / lg=54px, border-radius: 12px, font-weight: 700

### Input
- height: 52px, border-radius: 12px, border: 1.5px
- Ikona vlevo, akce vpravo
- Focus: border-color: var(--accent), box-shadow: 0 0 0 3px accent-soft

### Avatar
- Kulatý, background: bg-soft, font: Fraunces 700
- `ring` prop: border 2px accent

### IconButton
- 40px čtverec, border-radius: 12px
- Aktivní: accent-soft background + accent border

### Topbar (sub-screens)
- ← tlačítko vlevo (40px) + title (centered, 15px 700) + akce vpravo (40px)
- Kicker nad title: 10px mono uppercase muted

---

## 5. Animace
```css
@keyframes vkPop {
  0%   { transform: scale(0.4); opacity: 0; }
  60%  { transform: scale(1.08); }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes vkToast {
  from { transform: translate(-50%, 8px); opacity: 0; }
  to   { transform: translate(-50%, 0); opacity: 1; }
}
button:active { transform: scale(0.97); }
```

---

## 6. Priorita implementace

| # | Co | Důvod |
|---|---|---|
| 1 | Design tokeny (barvy, fonty v CSS) | Okamžitý efekt na celou app |
| 2 | Přihlášení / Registrace | První dojem, teď hotový redesign |
| 3 | Market + karty | Hlavní obrazovka |
| 4 | Detail inzerátu | Kritická pro konverzi |
| 5 | Spodní nav + FAB | Navigace |
| 6 | Profil menu + sub-screens | Sekundární |
| 7 | Chat | Sekundární |
| 8 | Add listing flow | Sekundární |
| 9 | Onboarding flow | Pouze po registraci |

---

## 7. Co zachovat beze změny
- Veškerá logika (auth, favorites, navigation, chat, mock data)
- Struktura komponent (AddListing steps)
- PrimeVue komponenty — obalit vlastními styly
- Responzivní breakpointy

## 8. Co přidat nového
- `OnboardingFlow` — 4kroková obrazovka po registraci
- `EasterEgg` — kliknutí 3× na logo (emoji déšť)
- Tweaks panel — výběr akcentní barvy (zelená/hořčice/cihla) — volitelné
