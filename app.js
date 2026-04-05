const DEFAULT_FIGMA_FILE_KEY = "SB3rKj1eJNqOZ57vyW02H3";

const mockApp = {
  source: "mock",
  file: {
    name: "Vercajkovna",
    lastModified: "2026-03-22T00:00:00Z",
    version: "mock",
  },
  pages: [
    {
      id: "page-market",
      name: "Market / Home",
      kind: "CANVAS",
      frames: [
        { id: "market-hero", name: "Hero + Search", type: "FRAME", width: 1440, height: 980 },
        { id: "market-grid", name: "Grid of Listings", type: "FRAME", width: 1440, height: 1280 },
      ],
    },
    {
      id: "page-detail",
      name: "Listing Detail",
      kind: "CANVAS",
      frames: [
        { id: "detail-main", name: "Listing detail", type: "FRAME", width: 1440, height: 1200 },
        { id: "detail-request", name: "Request drawer", type: "FRAME", width: 1440, height: 1040 },
      ],
    },
    {
      id: "page-auth",
      name: "Auth + Profile",
      kind: "CANVAS",
      frames: [
        { id: "auth-login", name: "Login", type: "FRAME", width: 1440, height: 1040 },
        { id: "auth-profile", name: "Profile", type: "FRAME", width: 1440, height: 1220 },
      ],
    },
  ],
};

const mockListings = [
  {
    id: "festool-ts55",
    title: "Kompaktní kotoučová pila Festool TS 55",
    price: "450 Kč / den",
    location: "Praha 7",
    rating: 4.9,
    emoji: "🪚",
    category: "Stavba",
    distance: "1.8 km",
    availability: "K dispozici dnes",
    description:
      "Pro přesné řezy, čistý finish a víkendové projekty. Ideální jako hlavní hvězda marketplace demo flow.",
    badges: ["Ov. profil", "Bezpečné předání", "Okamžitý kontakt"],
    owner: "Tomáš",
    ownerSince: "na platformě 3 roky",
    handoff: "Osobní předání u metra Vltavská",
    timeline: ["Navrženo", "Rezervováno", "Předáno", "Vráceno"],
  },
  {
    id: "makita-drill",
    title: "Aku vrtačka Makita 18V",
    price: "180 Kč / den",
    location: "Brno-střed",
    rating: 4.8,
    emoji: "🔧",
    category: "Dílna",
    distance: "0.9 km",
    availability: "Možné vyzvednout dnes večer",
    description:
      "Lehká, spolehlivá a připravená na montáž nábytku i drobné domácí opravy.",
    badges: ["Top rating", "Rychlá odpověď", "Osobní předání"],
    owner: "Pavel",
    ownerSince: "ověřený hostitel",
    handoff: "Vyzvednutí po 18:00",
    timeline: ["Nabídka aktivní", "Žádost čeká", "Schválení", "Handoff"],
  },
  {
    id: "karcher-wash",
    title: "Tlaková myčka Kärcher K5",
    price: "300 Kč / den",
    location: "Ostrava",
    rating: 4.7,
    emoji: "💦",
    category: "Údržba",
    distance: "2.4 km",
    availability: "Na víkend volné",
    description:
      "Na terasy, auto i zahradní povrchy. Demo karta s výrazným vizuálním akcentem.",
    badges: ["Rychlé schválení", "Připraveno k půjčení", "Fotky stavu"],
    owner: "Lucie",
    ownerSince: "na platformě 11 měsíců",
    handoff: "Předání v sobotu ráno",
    timeline: ["Nabídka aktivní", "Žádost dorazila", "Schváleno", "Předáno"],
  },
  {
    id: "laser-level",
    title: "Křížový laser Bosch",
    price: "220 Kč / den",
    location: "Plzeň",
    rating: 4.9,
    emoji: "📐",
    category: "Měření",
    distance: "3.2 km",
    availability: "Rezervace od pátku",
    description:
      "Pro přesné srovnání polic, obrazů a kuchyňských linek. Dobře funguje jako sekundární detail.",
    badges: ["Záruka stavu", "Doprava domluvou", "Oblíbené"],
    owner: "Jana",
    ownerSince: "ověřená",
    handoff: "Převzetí po dohodě",
    timeline: ["Náhled", "Žádost", "Potvrzení", "Předání"],
  },
];

const categories = [
  { id: "all", name: "Vše" },
  { id: "stavba", name: "Stavba" },
  { id: "dilna", name: "Dílna" },
  { id: "udrzba", name: "Údržba" },
  { id: "mereni", name: "Měření" },
];

const routeLabels = {
  auth: "Přihlášení",
  market: "Domů",
  detail: "Detail",
  request: "Žádost",
  status: "Stav",
  profile: "Profil",
  design: "Design notes",
};

function readAuthState() {
  return Boolean(
    localStorage.getItem("vercajkovna-authenticated") ||
      sessionStorage.getItem("vercajkovna-authenticated"),
  );
}

function persistAuthState({ remember, name, email }) {
  const storage = remember ? localStorage : sessionStorage;
  const otherStorage = remember ? sessionStorage : localStorage;
  storage.setItem("vercajkovna-authenticated", "1");
  storage.setItem("vercajkovna-user", JSON.stringify({ name, email }));
  otherStorage.removeItem("vercajkovna-authenticated");
  otherStorage.removeItem("vercajkovna-user");
}

const state = {
  route: parseRoute(),
  authenticated: readAuthState(),
  login: {
    mode: "login",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    remember: true,
    error: "",
    hint: "",
  },
  search: "",
  category: "all",
  selectedListingId: mockListings[0].id,
  selectedFrameId: null,
  figma: {
    loading: true,
    error: "",
    data: mockApp,
    previewUrls: {},
  },
  request: {
    moveIn: "2026-03-29",
    duration: "7",
    note: "Potřebuji ji na víkendový projekt.",
    step: 2,
    status: "Čeká na schválení",
  },
};

const app = document.querySelector("#app");

init();

async function init() {
  bindGlobalEvents();
  syncRouteWithAuth();
  render();
  loadFigmaSummary().finally(() => {
    render();
  });
}

function bindGlobalEvents() {
  window.addEventListener("hashchange", () => {
    state.route = parseRoute();
    syncRouteWithAuth();
    render();
  });
}

function parseRoute() {
  const hash = window.location.hash.replace(/^#\/?/, "");
  const [route = "market", slug] = hash.split("/");
  return {
    name: ["auth", "market", "detail", "request", "status", "profile", "design"].includes(route)
      ? route
      : "auth",
    slug,
  };
}

function syncRouteWithAuth() {
  if (!state.authenticated && state.route.name !== "auth") {
    window.location.hash = "#/auth";
  }
  if (state.authenticated && state.route.name === "auth") {
    window.location.hash = "#/market";
  }
}

function render() {
  if (!app) return;
  if (!state.authenticated && state.route.name !== "auth") {
    window.location.hash = "#/auth";
    return;
  }
  const activeListing = getActiveListing();
  const filteredListings = filterListings();
  const route = state.route.name;

  app.innerHTML = `
    ${renderTopbar()}
    <main class="frame">
      <section class="main-panel">
        ${
          route === "auth"
            ? renderAuth()
            : route === "market"
              ? renderMarket(filteredListings)
              : route === "detail"
                ? renderDetail(activeListing)
                : route === "request"
                  ? renderRequest(activeListing)
                  : route === "status"
                    ? renderStatus(activeListing)
                    : route === "profile"
                      ? renderProfile()
                      : renderDesignNotes()
        }
      </section>
    </main>
  `;

  wireInteractions();
}

function renderTopbar() {
  if (state.route.name === "auth") {
    return `
      <header class="topbar topbar-auth">
        <div class="topbar-inner topbar-inner-auth">
          <button class="icon-button icon-button-soft" type="button" aria-label="Zpět" data-action="go-back">${icon("arrowLeft")}</button>
        </div>
      </header>
    `;
  }

  return `
    <header class="topbar topbar-app">
      <div class="topbar-inner topbar-inner-minimal">
        <button class="icon-button" type="button" aria-label="Zpět" data-action="go-back">${icon("arrowLeft")}</button>
        <div class="topbar-title">
          <strong>Vercajkovna</strong>
          <span>${routeLabels[state.route.name] ?? "Domů"}</span>
        </div>
        <button class="icon-button" type="button" aria-label="Nápověda" data-action="help-app">${icon("help")}</button>
      </div>
    </header>
  `;
}

function renderAuth() {
  const isLogin = state.login.mode === "login";
  const hasHint = Boolean(state.login.hint);
  return `
    <div class="auth-shell">
      <section class="auth-card">
        <div class="auth-hero">
          <div class="auth-hero-icon" aria-hidden="true">${icon("handshake")}</div>
          <h1>Půjčujte chytře</h1>
          <p>Připojte se k tisícům lidí, kteří sdílí věci a šetří planetu i peněženku.</p>
        </div>

        <div class="auth-tabs" role="tablist" aria-label="Auth mode">
          <button class="auth-tab ${isLogin ? "is-active" : ""}" type="button" data-action="auth-mode-login">Přihlášení</button>
          <button class="auth-tab ${!isLogin ? "is-active" : ""}" type="button" data-action="auth-mode-register">Registrace</button>
        </div>

        <div class="auth-hint ${hasHint ? "" : "hidden"}">${escapeHtml(state.login.hint)}</div>

        <form class="auth-form auth-form-panel" data-auth-form novalidate>
          ${isLogin ? `
            <label class="field">
              <span>Email</span>
              <div class="input-shell">
                <span class="input-icon" aria-hidden="true">${icon("email")}</span>
                <input id="loginEmail" class="input" type="email" autocomplete="email" placeholder="name@example.com" value="${escapeHtml(state.login.email)}" />
              </div>
            </label>

            <div class="field field-row">
              <span>Heslo</span>
              <button class="field-link" type="button" data-action="help-auth">Zapomenuté heslo?</button>
            </div>

            <label class="field">
              <div class="input-shell">
                <span class="input-icon" aria-hidden="true">${icon("lock")}</span>
                <input id="loginPassword" class="input" type="password" autocomplete="current-password" placeholder="••••••••" value="${escapeHtml(state.login.password)}" />
              </div>
            </label>

            <label class="checkbox">
              <input id="loginRemember" type="checkbox" ${state.login.remember ? "checked" : ""} />
              <span>Zapamatovat si mě</span>
            </label>
          ` : `
            <label class="field">
              <span>Jméno</span>
              <div class="input-shell">
                <span class="input-icon" aria-hidden="true">${icon("user")}</span>
                <input id="loginName" class="input" type="text" autocomplete="name" placeholder="Jan Novák" value="${escapeHtml(state.login.name)}" />
              </div>
            </label>

            <label class="field">
              <span>E-mail</span>
              <div class="input-shell">
                <span class="input-icon" aria-hidden="true">${icon("email")}</span>
                <input id="loginEmail" class="input" type="email" autocomplete="email" placeholder="name@example.com" value="${escapeHtml(state.login.email)}" />
              </div>
            </label>

            <label class="field">
              <span>Heslo</span>
              <div class="input-shell">
                <span class="input-icon" aria-hidden="true">${icon("lock")}</span>
                <input id="loginPassword" class="input" type="password" autocomplete="new-password" placeholder="••••••••" value="${escapeHtml(state.login.password)}" />
              </div>
            </label>

            <label class="field">
              <span>Potvrzení hesla</span>
              <div class="input-shell">
                <span class="input-icon" aria-hidden="true">${icon("lock")}</span>
                <input id="loginConfirmPassword" class="input" type="password" autocomplete="new-password" placeholder="••••••••" value="${escapeHtml(state.login.confirmPassword)}" />
              </div>
            </label>
          `}

          <button class="button button-primary auth-submit" type="submit">
            <span>${isLogin ? "Přihlásit se" : "Registrovat se"}</span>${icon("arrowRight")}
          </button>

          <div class="auth-divider" aria-hidden="true">
            <span>Nebo pokračujte přes</span>
          </div>

          <div class="auth-social">
            <button class="social-button" type="button" aria-label="Přihlásit se přes Google">
              <span class="social-mark social-google">G</span>
              <span>Google</span>
            </button>
            <button class="social-button" type="button" aria-label="Přihlásit se přes Apple">
              <span class="social-mark social-apple"></span>
              <span>Apple</span>
            </button>
            <button class="social-button" type="button" aria-label="Přihlásit se přes Facebook">
              <span class="social-mark social-facebook">f</span>
              <span>Facebook</span>
            </button>
          </div>

          <button class="button button-secondary auth-submit auth-guest" type="button" data-action="guest-login">
            Pokračovat jako demo uživatel
          </button>

          <div class="auth-links">
            <button class="auth-link-button" type="button" data-action="${isLogin ? "auth-mode-register" : "auth-mode-login"}">
              ${isLogin ? "Nemáš účet? Registrace" : "Máš účet? Přihlášení"}
            </button>
            <button class="auth-link-button" type="button" data-action="help-auth">Potřebuji pomoct</button>
          </div>

          <div class="auth-footnote">
            Máte potíže s přihlášením? <button class="auth-link-button" type="button" data-action="help-auth">Kontaktujte podporu</button>
          </div>

          <div class="auth-error ${state.login.error ? "" : "hidden"}" role="alert">${escapeHtml(state.login.error)}</div>
        </form>
      </section>
    </div>
  `;
}

function renderMarket(listings) {
  return `
    <div class="screen-inner">
      <div class="hero">
        <div class="hero-grid">
          <div>
            <span class="eyebrow">MVP marketplace flow</span>
            <h1>Půjč si nářadí bez zbytečných kroků.</h1>
            <p>
              Demo appka ukazuje veřejný katalog, detail nabídky, žádost o půjčení, stav
              handoffu i profil. Vizuální směr se opírá o Figma a layout je připravený pro mobil,
              tablet i desktop.
            </p>
            <div class="hero-actions">
              <a class="button button-primary" href="#/detail/${mockListings[0].id}">${icon("arrowRight")} Otevřít demo</a>
              <a class="button button-secondary" href="#/request/${mockListings[0].id}">${icon("plus")} Zkusit žádost</a>
              <button class="button button-ghost" data-action="scroll-design">${icon("sparkles")} Inspirační poznámky</button>
            </div>
          </div>

          <div class="hero-meta">
            <div class="metric-grid">
              <div class="metric">
                <div class="metric-value">24</div>
                <div class="metric-label">půjčitelných kusů v demo katalogu</div>
              </div>
              <div class="metric">
                <div class="metric-value">4.9</div>
                <div class="metric-label">průměrné hodnocení top listingů</div>
              </div>
            </div>
            <div class="availability-card">
              <div class="availability-header">
                <div>
                  <div class="availability-title">Dnes k dispozici</div>
                  <div class="panel-copy">Ukázka stavů, které se dobře proklikávají na demo scéně.</div>
                </div>
                <span class="pill"><strong>live</strong></span>
              </div>
              <div class="availability-list">
                ${mockListings
                  .slice(0, 3)
                  .map(
                    (item) => `
                      <div class="availability-item">
                        <div>
                          <strong>${item.title}</strong>
                          <span>${item.location} · ${item.distance}</span>
                        </div>
                        <span class="availability-state" title="${item.availability}"></span>
                      </div>
                    `,
                  )
                  .join("")}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="section-grid">
        <section class="section-card">
          <div class="section-header">
            <div>
              <h2 class="section-title">Katalog nabídek</h2>
              <p class="section-subtitle">
                Hlavní veřejný pohled, kde uživatel prochází nabídky, filtruje a přechází do detailu.
              </p>
            </div>
            <div class="pill">${filteredListings.length} položek</div>
          </div>

          <div class="searchbar">
            <input
              id="searchInput"
              class="input"
              type="search"
              placeholder="Hledej nářadí, místo nebo typ ..."
              value="${escapeHtml(state.search)}"
            />
            <select id="categorySelect" class="select" aria-label="Kategorie">
              ${categories
                .map(
                  (cat) => `
                    <option value="${cat.id}" ${state.category === cat.id ? "selected" : ""}>
                      ${cat.name}
                    </option>
                  `,
                )
                .join("")}
            </select>
            <button class="button button-secondary" data-action="clear-filters">${icon("x")} Vyčistit</button>
          </div>

          <div class="chip-row" style="margin-top: 14px">
            ${categories
              .map(
                (cat) => `
                  <button class="chip ${state.category === cat.id ? "is-active" : ""}" data-category="${cat.id}">
                    <span class="chip-dot"></span>${cat.name}
                  </button>
                `,
              )
              .join("")}
          </div>

          <div class="listing-grid" style="margin-top: 16px">
            ${listings
              .map(
                (item) => `
                  <article class="listing-card" data-listing-id="${item.id}" tabindex="0" role="button" aria-label="Otevřít ${item.title}">
                    <div class="listing-media">
                      <div class="listing-emoji">${item.emoji}</div>
                    </div>
                    <div class="listing-content">
                      <div class="listing-topline">
                        <h3 class="listing-title">${item.title}</h3>
                        <div class="listing-price">${item.price}</div>
                      </div>
                      <p class="listing-copy">${item.description}</p>
                      <div class="listing-meta">
                        <span class="tag"><span class="tag-icon"></span>${item.location}</span>
                        <span class="tag"><span class="tag-icon"></span>${item.distance}</span>
                        <span class="tag"><span class="tag-icon"></span>${item.rating} ★</span>
                      </div>
                    </div>
                  </article>
                `,
              )
              .join("")}
          </div>
        </section>

        <section class="section-card">
          <div class="section-header">
            <div>
              <h2 class="section-title">Flow pro klikání</h2>
              <p class="section-subtitle">
                Krokový průchod demo scénářem pro prezentaci. Každý krok simuluje realističtější
                stav aplikace.
              </p>
            </div>
          </div>

          <div class="stepper">
            ${[
              {
                title: "1. Objev nabídku",
                text: "Uživatel najde položku v katalogu a otevře detail.",
                done: true,
              },
              {
                title: "2. Vyplň žádost",
                text: "Zvolí termín, délku a přidá krátkou zprávu hostiteli.",
                done: state.route.name === "request" || state.route.name === "status",
              },
              {
                title: "3. Schválení / handoff",
                text: "Ukážeme stav čekání, schválení a předání kontaktů.",
                done: state.route.name === "status",
              },
            ]
              .map(
                (step) => `
                  <div class="step ${step.done ? "done" : ""}">
                    <div class="step-head">
                      <div>
                        <strong>${step.title}</strong>
                        <div class="panel-copy" style="margin-top: 6px">${step.text}</div>
                      </div>
                      <div class="step-number">${step.done ? icon("check") : "•"}</div>
                    </div>
                  </div>
                `,
              )
              .join("")}
          </div>

          <div class="footer-note">
            Figma data se načítají přes lokální proxy server, takže token nezůstává v browseru.
          </div>
        </section>
      </div>
    </div>
  `;
}

function renderDetail(listing) {
  if (!listing) return renderEmpty("Detail není dostupný", "Zkus otevřít některou položku z katalogu.");

  return `
    <div class="screen-inner">
      <div class="detail-phone">
        <div class="detail-hero">
          <div class="detail-hero-top">
            <button class="icon-button" type="button" data-action="go-market" aria-label="Zpět">${icon("arrowLeft")}</button>
            <div class="detail-top-actions">
              <button class="icon-button" type="button" aria-label="Sdílet">${icon("share")}</button>
              <button class="icon-button" type="button" aria-label="Oblíbené">${icon("heart")}</button>
            </div>
          </div>

          <span class="detail-badge">${listing.availability}</span>
          <h2>${listing.title}</h2>
          <div class="detail-location">${icon("pin")} ${listing.location}</div>
        </div>

        <div class="detail-owner-card">
          <div class="detail-owner-left">
            <div class="detail-owner-avatar">JN</div>
            <div>
              <span class="detail-owner-label">Majitel</span>
              <strong>${listing.owner}</strong>
            </div>
          </div>
          <div class="detail-rating">
            <strong>${listing.rating}</strong>
            <span>24 hodnocení</span>
          </div>
        </div>

        <div class="detail-chip-row">
          ${["Jako nové", "Elektronika", "Outdoor"].map((item) => `<span class="detail-chip">${item}</span>`).join("")}
        </div>

        <section class="detail-section">
          <div class="detail-section-head">
            <h3>O produktu</h3>
            <span>Cena za den</span>
          </div>
          <div class="detail-product-row">
            <div>
              <div class="detail-price">${listing.price}</div>
              <div class="detail-copy-small">Skvělý pro víkendové projekty a rychlé použití.</div>
            </div>
            <a class="button button-primary detail-main-cta" href="#/request/${listing.id}">${icon("arrowRight")} Půjčit</a>
          </div>
          <p class="detail-copy">${listing.description}</p>
          <a class="detail-more" href="#/request/${listing.id}">Číst více</a>
        </section>

        <section class="detail-section">
          <div class="detail-section-head">
            <h3>Dostupnost</h3>
            <span>${listing.handoff}</span>
          </div>
          <div class="availability-strip">
            ${["PO 16", "ÚT 17", "ST 18", "ČT 19"].map((day, index) => `
              <div class="availability-day ${index === 0 ? "is-active" : ""}">
                <strong>${day.split(" ")[0]}</strong>
                <span>${day.split(" ")[1]}</span>
              </div>
            `).join("")}
          </div>
        </section>

        <section class="detail-section">
          <div class="detail-section-head">
            <h3>Lokalita</h3>
            <span>${listing.distance} od tebe</span>
          </div>
          <div class="map-card">
            <div class="map-pin">${icon("map")}</div>
            <div class="map-pill">${listing.location}</div>
          </div>
        </section>

        <section class="detail-section">
          <div class="detail-section-head">
            <h3>Recenze</h3>
            <a href="#/detail/${listing.id}">Zobrazit vše →</a>
          </div>
          <div class="review-card">
            <div class="review-avatar">AM</div>
            <div class="review-body">
              <div class="review-topline">
                <strong>Alex M.</strong>
                <span>5.0 ★★★★★</span>
              </div>
              <p>“Naprostá bomba. Rychlé předání a všechno v perfektním stavu.”</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  `;
}

function renderRequest(listing) {
  if (!listing) return renderEmpty("Žádost není dostupná", "Zkus otevřít některou položku z katalogu.");

  const stepIndex = state.request.step;

  return `
    <div class="screen-inner">
      <div class="screen-header">
        <div>
          <span class="eyebrow">Žádost o půjčení</span>
          <h2 class="screen-title">Domluv si ${listing.title}</h2>
          <p class="screen-copy">
            Demo formulář napodobuje flow, ve kterém uživatel vybere termín, délku půjčení a
            odešle žádost hostiteli.
          </p>
        </div>
        <div class="pill"><strong>Krok ${stepIndex} / 3</strong></div>
      </div>

      <div class="request-layout">
        <div class="card">
          <div class="stepper">
            <div class="step ${stepIndex >= 1 ? "done" : ""}">
              <div class="step-head">
                <strong>1. Termín</strong>
                <div class="step-number">${stepIndex >= 1 ? icon("check") : "1"}</div>
              </div>
              <div class="searchbar">
                <input id="requestDate" class="input" type="date" value="${escapeHtml(state.request.moveIn)}" />
                <select id="requestDuration" class="select">
                  ${[3, 5, 7, 14]
                    .map(
                      (days) => `
                        <option value="${days}" ${String(days) === state.request.duration ? "selected" : ""}>
                          ${days} dní
                        </option>
                      `,
                    )
                    .join("")}
                </select>
                <button class="button button-secondary" data-action="go-status">${icon("sparkles")} Předvyplnit schválení</button>
              </div>
            </div>

            <div class="step ${stepIndex >= 2 ? "done" : ""}">
              <div class="step-head">
                <strong>2. Zpráva hostiteli</strong>
                <div class="step-number">${stepIndex >= 2 ? icon("check") : "2"}</div>
              </div>
              <textarea id="requestNote" class="textarea" placeholder="Napiš krátkou zprávu hostiteli...">${escapeHtml(state.request.note)}</textarea>
            </div>

            <div class="step ${stepIndex >= 3 ? "done" : ""}">
              <div class="step-head">
                <strong>3. Odeslání</strong>
                <div class="step-number">${stepIndex >= 3 ? icon("check") : "3"}</div>
              </div>
              <div class="status-banner">
                <div>
                  <strong>${state.request.status}</strong>
                  <span>Flow je připravený přejít do čekacího / handoff stavu.</span>
                </div>
                <button class="button button-primary" data-action="submit-request">${icon("arrowRight")} Odeslat</button>
              </div>
            </div>
          </div>
        </div>

        <div class="detail-panel">
          <div class="card">
            <div class="panel-title">Shrnutí</div>
            <div class="detail-stat" style="margin-top: 14px">
              <strong>${listing.price}</strong>
              <span>${listing.location}</span>
            </div>
            <div class="detail-stat">
              <strong>Hostitel</strong>
              <span>${listing.owner} · ${listing.ownerSince}</span>
            </div>
            <div class="detail-stat">
              <strong>Pickup</strong>
              <span>${listing.handoff}</span>
            </div>
          </div>

          <div class="card">
            <div class="panel-title">Timeline</div>
            <div class="timeline" style="margin-top: 14px">
              ${listing.timeline
                .map(
                  (item, index) => `
                    <div class="timeline-entry">
                      <strong>${index + 1}. ${item}</strong>
                      <small>
                        ${index === 0 ? "Nabídka se zobrazí veřejně." : index === 1 ? "Uživatel odešle žádost." : index === 2 ? "Hostitel schválí nebo zamítne." : "Předání je uzavřené."}
                      </small>
                    </div>
                  `,
                )
                .join("")}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderStatus(listing) {
  if (!listing) return renderEmpty("Stav není dostupný", "Zkus otevřít některou položku z katalogu.");

  return `
    <div class="screen-inner">
      <div class="screen-header">
        <div>
          <span class="eyebrow">Stav žádosti</span>
          <h2 class="screen-title">Žádost pro ${listing.title} čeká na potvrzení</h2>
          <p class="screen-copy">
            Tohle je obrazovka, kde demo ukáže, že flow pokračuje i po odeslání žádosti. Uživatel
            vidí stav, handoff a další krok.
          </p>
        </div>
        <a class="button button-secondary" href="#/profile">${icon("user")} Otevřít profil</a>
      </div>

      <div class="detail-layout">
        <div class="card">
          <div class="status-banner">
            <div>
              <strong>${state.request.status}</strong>
              <span>${listing.handoff}</span>
            </div>
            <div class="pill"><strong>${listing.price}</strong></div>
          </div>

          <div class="stepper" style="margin-top: 14px">
            ${[
              {
                title: "Žádost dorazila",
                text: "Hostitel dostal notifikaci a vidí požadovaný termín.",
                done: true,
              },
              {
                title: "Schválení",
                text: "V demo flow můžeš přepnout stav na schváleno nebo zamítnuto.",
                done: true,
              },
              {
                title: "Handoff",
                text: "Zobrazí se kontakt a instrukce pro předání.",
                done: true,
              },
            ]
              .map(
                (item) => `
                  <div class="step done">
                    <div class="step-head">
                      <div>
                        <strong>${item.title}</strong>
                        <div class="panel-copy" style="margin-top: 6px">${item.text}</div>
                      </div>
                      <div class="step-number">${icon("check")}</div>
                    </div>
                  </div>
                `,
              )
              .join("")}
          </div>

          <div style="display: grid; gap: 12px; margin-top: 16px">
            <a class="button button-primary" href="#/detail/${listing.id}">${icon("arrowLeft")} Zpět na detail</a>
            <button class="button button-secondary" data-action="toggle-approved">${icon("sparkles")} Přepnout na schváleno</button>
          </div>
        </div>

        <div class="detail-panel">
          <div class="card">
            <div class="panel-title">Kontakt a instrukce</div>
            <div class="detail-stat" style="margin-top: 14px">
              <strong>Telefon hostitele</strong>
              <span>+420 777 123 456</span>
            </div>
            <div class="detail-stat">
              <strong>Instrukce</strong>
              <span>Setkání před kavárnou, ověření stavu a předání příslušenství.</span>
            </div>
          </div>

          <div class="card">
            <div class="panel-title">Audit trail</div>
            <div class="timeline" style="margin-top: 14px">
              <div class="timeline-entry">
                <strong>18:42 · Žádost odeslána</strong>
                <small>Mockovaný datumový záznam v demo režimu.</small>
              </div>
              <div class="timeline-entry">
                <strong>18:50 · Hostitel reaguje</strong>
                <small>Stav může být schválen nebo zamítnut.</small>
              </div>
              <div class="timeline-entry">
                <strong>19:00 · Handoff připraven</strong>
                <small>V demo scéně se ukáže contact card a další akce.</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderProfile() {
  return `
    <div class="screen-inner">
      <div class="screen-header">
        <div>
          <span class="eyebrow">Profil a dashboard</span>
          <h2 class="screen-title">Přehled uživatele</h2>
          <p class="screen-copy">
            Profilová stránka demonstruje, že MVP není jen katalog. Uživateli dává stav účtu,
            aktivní nabídky a jednoduché metriky.
          </p>
        </div>
      </div>

      <div class="profile-grid">
        <div class="profile-card">
          <h3>Michal V.</h3>
          <p>Ověřený člen · 18 půjček · 4.9 rating · reaguje do 15 minut</p>
        </div>
        <div class="profile-card">
          <h3>Aktivní nabídky</h3>
          <p>3 položky public · 7 žádostí v posledním týdnu · 2 dokončené handoffy</p>
        </div>
        <div class="profile-card">
          <h3>Ověření a bezpečnost</h3>
          <p>Telefon, e-mail a profilová fotka jsou připravené jako základ pro důvěru.</p>
        </div>
      </div>

      <div class="section-grid" style="margin-top: 16px">
        <div class="card">
          <div class="panel-title">Moje nabídky</div>
          <div class="listing-grid" style="margin-top: 14px">
            ${mockListings
              .slice(0, 2)
              .map(
                (item) => `
                  <article class="listing-card" data-listing-id="${item.id}">
                    <div class="listing-media">
                      <div class="listing-emoji">${item.emoji}</div>
                    </div>
                    <div class="listing-content">
                      <div class="listing-topline">
                        <h3 class="listing-title">${item.title}</h3>
                        <div class="listing-price">${item.price}</div>
                      </div>
                      <p class="listing-copy">${item.description}</p>
                    </div>
                  </article>
                `,
              )
              .join("")}
          </div>
        </div>
        <div class="card">
          <div class="panel-title">Dashboard highlights</div>
          <div class="timeline" style="margin-top: 14px">
            <div class="timeline-entry">
              <strong>5 aktivních požadavků</strong>
              <small>Žádosti lze schválit nebo zamítnout přímo v demo flow.</small>
            </div>
            <div class="timeline-entry">
              <strong>2 rychlé handoffy tento měsíc</strong>
              <small>Uživatel má přehled o předání i návratu.</small>
            </div>
            <div class="timeline-entry">
              <strong>1 připravený profilový draft</strong>
              <small>Ukázka pro budoucí rozšíření o editaci profilu.</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderDesignNotes() {
  const figma = state.figma.data;

  return `
    <div class="screen-inner">
      <div class="screen-header">
        <div>
          <span class="eyebrow">Figma inspirované layouty</span>
          <h2 class="screen-title">Design reference board</h2>
          <p class="screen-copy">
            Tady se zobrazují stránky a frame metadata z Figma API, případně fallback data, když je
            API nedostupné. Je to pracovní prostor pro inspiraci před implementací konkrétních
            obrazovek.
          </p>
        </div>
      </div>

      <div class="section-grid">
        <div class="card">
          <div class="panel-title">Soubor</div>
          <div class="detail-stat" style="margin-top: 14px">
            <strong>${escapeHtml(figma.file?.name ?? "Vercajkovna")}</strong>
            <span>Zdroj: ${state.figma.error ? "mock fallback" : figma.source === "api" ? "Figma API" : "lokální mock"}</span>
          </div>
          <div class="detail-stat">
            <strong>Poslední aktualizace</strong>
            <span>${formatDate(figma.file?.lastModified ?? new Date().toISOString())}</span>
          </div>
        </div>

        <div class="card">
          <div class="panel-title">Co z toho čteme</div>
          <div class="timeline" style="margin-top: 14px">
            <div class="timeline-entry">
              <strong>Page names</strong>
              <small>Pomůžou pochopit, jaký flow už je navržený.</small>
            </div>
            <div class="timeline-entry">
              <strong>Frame names</strong>
              <small>Vybereme relevantní obrazovky pro demo appku.</small>
            </div>
            <div class="timeline-entry">
              <strong>Preview images</strong>
              <small>Pro vybrané node IDs můžeme zobrazit render z Figma.</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderSidePanel(activeListing) {
  const data = state.figma.data ?? mockApp;
  const frames = flattenFrames(data.pages ?? []);
  const selectedFrame = frames.find((frame) => frame.id === state.selectedFrameId) ?? frames[0];
  const selectedFramePreview = selectedFrame ? state.figma.previewUrls[selectedFrame.id] : null;

  return `
    <div>
      <span class="eyebrow">Design references</span>
      <h2 class="panel-title">Figma board</h2>
      <p class="panel-copy">
        Přehled obrazovek a frameů, které bereme jako inspiraci. Klikni na frame, případně si
        zobraz preview, pokud je dostupné.
      </p>

      <div class="design-stack">
        ${data.pages
          .map(
            (page) => `
              <div class="design-card">
                <div class="design-card-head">
                  <h3>${escapeHtml(page.name)}</h3>
                  <span class="pill"><strong>${page.frames.length}</strong> frameů</span>
                </div>
                <p>${page.kind === "CANVAS" ? "Page" : page.kind} · ${page.frames
                  .map((frame) => frame.name)
                  .join(" · ")}</p>
              </div>
            `,
          )
          .join("")}
      </div>

      <div class="design-card" style="margin-top: 14px">
        <div class="design-card-head">
          <h3>Vybraný frame</h3>
          <button class="button button-ghost" data-action="refresh-figma">${icon("sparkles")} Refresh</button>
        </div>

        <div class="frame-list">
          ${frames
            .map(
              (frame) => `
                <div class="frame-row ${selectedFrame?.id === frame.id ? "is-active" : ""}" data-frame-id="${frame.id}">
                  <div>
                    <strong>${escapeHtml(frame.name)}</strong>
                    <div><span>${escapeHtml(frame.pageName)} · ${frame.width}x${frame.height}</span></div>
                  </div>
                  <span>${escapeHtml(frame.type)}</span>
                </div>
              `,
            )
            .join("")}
        </div>

        <div class="preview-frame">
          ${
            selectedFramePreview
              ? `<img src="${selectedFramePreview}" alt="${escapeHtml(selectedFrame.name)}" />`
              : `<div class="empty-state">Preview není dostupný. Ve figma response zatím používáme jen metadata.</div>`
          }
          <div class="preview-meta">
            <strong>${selectedFrame ? escapeHtml(selectedFrame.name) : "Žádný frame"}</strong>
            <span>${selectedFrame ? escapeHtml(selectedFrame.pageName) : ""}</span>
            <span>${selectedFrame ? `${selectedFrame.width} × ${selectedFrame.height}` : ""}</span>
          </div>
        </div>
      </div>

      <div class="footer-note">
        Aktivní listing: ${activeListing ? escapeHtml(activeListing.title) : "není vybraný"}
      </div>
    </div>
  `;
}

function renderEmpty(title, copy) {
  return `
    <div class="screen-inner">
      <div class="empty-state">
        <h2 class="section-title">${escapeHtml(title)}</h2>
        <p class="panel-copy">${escapeHtml(copy)}</p>
        <a class="button button-primary" href="#/market">${icon("arrowLeft")} Zpět do katalogu</a>
      </div>
    </div>
  `;
}

function wireInteractions() {
  const authForm = document.querySelector("[data-auth-form]");
  const loginName = document.querySelector("#loginName");
  const loginEmail = document.querySelector("#loginEmail");
  const loginPassword = document.querySelector("#loginPassword");
  const loginConfirmPassword = document.querySelector("#loginConfirmPassword");
  const loginRemember = document.querySelector("#loginRemember");
  const searchInput = document.querySelector("#searchInput");
  const categorySelect = document.querySelector("#categorySelect");
  const requestDate = document.querySelector("#requestDate");
  const requestDuration = document.querySelector("#requestDuration");
  const requestNote = document.querySelector("#requestNote");

  authForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const email = loginEmail?.value.trim() ?? "";
    const password = loginPassword?.value.trim() ?? "";
    const name = loginName?.value.trim() ?? "";
    const confirmPassword = loginConfirmPassword?.value.trim() ?? "";

    if (state.login.mode === "login") {
      if (!email || !password) {
        state.login.error = "Vyplň e-mail i heslo.";
        state.login.hint = "";
        render();
        return;
      }

      state.login.error = "";
      state.login.hint = "";
      state.login.email = email;
      state.login.password = password;
      state.login.remember = Boolean(loginRemember?.checked);
      state.authenticated = true;
      persistAuthState({
        remember: state.login.remember,
        name: state.login.name || "Demo uživatel",
        email,
      });
      window.location.hash = "#/market";
      return;
    }

    if (!name || !email || !password || !confirmPassword) {
      state.login.error = "Vyplň všechna pole registrace.";
      state.login.hint = "";
      render();
      return;
    }

    if (password !== confirmPassword) {
      state.login.error = "Hesla se neshodují.";
      state.login.hint = "";
      render();
      return;
    }

    state.login.error = "";
    state.login.hint = "";
    state.login.name = name;
    state.login.email = email;
    state.login.password = password;
    state.login.confirmPassword = confirmPassword;
    state.authenticated = true;
    persistAuthState({ remember: true, name, email });
    window.location.hash = "#/market";
  });

  loginName?.addEventListener("input", (event) => {
    state.login.name = event.target.value;
    state.login.error = "";
    state.login.hint = "";
  });

  loginEmail?.addEventListener("input", (event) => {
    state.login.email = event.target.value;
    state.login.error = "";
    state.login.hint = "";
  });

  loginPassword?.addEventListener("input", (event) => {
    state.login.password = event.target.value;
    state.login.error = "";
    state.login.hint = "";
  });

  loginConfirmPassword?.addEventListener("input", (event) => {
    state.login.confirmPassword = event.target.value;
    state.login.error = "";
    state.login.hint = "";
  });

  loginRemember?.addEventListener("change", (event) => {
    state.login.remember = event.target.checked;
  });

  searchInput?.addEventListener("input", (event) => {
    state.search = event.target.value;
    render();
  });

  categorySelect?.addEventListener("change", (event) => {
    state.category = event.target.value;
    render();
  });

  requestDate?.addEventListener("input", (event) => {
    state.request.moveIn = event.target.value;
  });

  requestDuration?.addEventListener("change", (event) => {
    state.request.duration = event.target.value;
    state.request.step = 2;
  });

  requestNote?.addEventListener("input", (event) => {
    state.request.note = event.target.value;
  });

  document.querySelectorAll("[data-listing-id]").forEach((el) => {
    el.addEventListener("click", () => {
      const id = el.getAttribute("data-listing-id");
      state.selectedListingId = id;
      window.location.hash = `#/detail/${id}`;
    });
    el.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        el.click();
      }
    });
  });

  document.querySelectorAll("[data-category]").forEach((el) => {
    el.addEventListener("click", () => {
      state.category = el.getAttribute("data-category");
      render();
    });
  });

  document.querySelectorAll("[data-frame-id]").forEach((el) => {
    el.addEventListener("click", () => {
      state.selectedFrameId = el.getAttribute("data-frame-id");
      loadFramePreview(state.selectedFrameId);
      render();
    });
  });

  document.querySelectorAll("[data-action]").forEach((el) => {
    el.addEventListener("click", () => handleAction(el.getAttribute("data-action")));
  });
}

function handleAction(action) {
  const activeListing = getActiveListing();

  switch (action) {
    case "go-market":
      window.location.hash = "#/market";
      break;
    case "submit-request":
      state.request.step = 3;
      state.request.status = "Čeká na schválení";
      window.location.hash = `#/status/${activeListing?.id ?? mockListings[0].id}`;
      break;
    case "go-status":
      state.request.step = 3;
      state.request.status = "Čeká na schválení";
      window.location.hash = `#/status/${activeListing?.id ?? mockListings[0].id}`;
      break;
    case "toggle-approved":
      state.request.status =
        state.request.status === "Schváleno" ? "Čeká na schválení" : "Schváleno";
      render();
      break;
    case "clear-filters":
      state.search = "";
      state.category = "all";
      render();
      break;
    case "auth-mode-login":
      state.login.mode = "login";
      state.login.error = "";
      state.login.confirmPassword = "";
      state.login.hint = "";
      render();
      break;
    case "auth-mode-register":
      state.login.mode = "register";
      state.login.error = "";
      state.login.confirmPassword = "";
      state.login.hint = "";
      render();
      break;
    case "guest-login":
      state.login.error = "";
      state.authenticated = true;
      persistAuthState({
        remember: true,
        name: "Demo uživatel",
        email: "demo@vercajkovna.cz",
      });
      window.location.hash = "#/market";
      break;
    case "help-auth":
      state.login.error = "";
      state.login.hint = "Použij e-mail a heslo, nebo demo uživatele pro rychlý vstup.";
      render();
      break;
    case "help-app":
    case "go-back":
      break;
    case "scroll-design":
      window.location.hash = "#/design";
      break;
    case "refresh-figma":
      loadFigmaSummary().finally(() => render());
      break;
    default:
      break;
  }
}

function getActiveListing() {
  const id = state.route.slug || state.selectedListingId;
  return mockListings.find((item) => item.id === id) ?? mockListings[0];
}

function filterListings() {
  const q = state.search.trim().toLowerCase();
  return mockListings.filter((item) => {
    const matchesCategory =
      state.category === "all" || item.category.toLowerCase().includes(state.category);
    const matchesSearch =
      !q ||
      [item.title, item.location, item.category, item.description, item.owner]
        .join(" ")
        .toLowerCase()
        .includes(q);
    return matchesCategory && matchesSearch;
  });
}

async function loadFigmaSummary() {
  state.figma.loading = true;
  state.figma.error = "";

  const params = new URLSearchParams({
    file_key: getEnv("FIGMA_FILE_KEY", DEFAULT_FIGMA_FILE_KEY),
  });

  try {
    const response = await fetch(`/api/figma/summary?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const payload = await response.json();
    state.figma.data = payload;
    if (!state.selectedFrameId) {
      state.selectedFrameId = flattenFrames(payload.pages ?? [])[0]?.id ?? null;
    }
    if (state.selectedFrameId) {
      await loadFramePreview(state.selectedFrameId, { silent: true });
    }
  } catch (error) {
    state.figma.error = error instanceof Error ? error.message : "Neznámá chyba";
    state.figma.data = mockApp;
    state.selectedFrameId = flattenFrames(mockApp.pages)[0]?.id ?? null;
    state.figma.previewUrls = {};
  } finally {
    state.figma.loading = false;
  }
}

async function loadFramePreview(frameId, options = {}) {
  if (!frameId) return;
  const silent = options.silent ?? false;

  try {
    const response = await fetch(`/api/figma/images?ids=${encodeURIComponent(frameId)}`);
    if (!response.ok) return;
    const payload = await response.json();
    const previewUrl = payload.images?.[frameId];
    if (!previewUrl) return;
    state.figma.previewUrls = {
      ...state.figma.previewUrls,
      [frameId]: previewUrl,
    };
    if (!silent) render();
  } catch {
    if (!silent) render();
  }
}

function flattenFrames(pages) {
  return pages.flatMap((page) =>
    (page.frames ?? []).map((frame) => ({
      ...frame,
      pageName: page.name,
    })),
  );
}

function formatDate(value) {
  const date = new Date(value);
  return new Intl.DateTimeFormat("cs-CZ", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function icon(name) {
  const icons = {
    handshake: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M7.5 12.5 4 9.5a2 2 0 0 1 0-2.9l1.8-1.8a2 2 0 0 1 2.8 0l2.3 2.3" />
        <path d="M13.1 7.1 17 3.2a2 2 0 0 1 2.8 0L21 4.4a2 2 0 0 1 0 2.8l-5.3 5.3" />
        <path d="m8 11 2.6 2.6a2 2 0 0 0 2.8 0l2-2" />
        <path d="M6.8 15.2 10 18.4a2 2 0 0 0 2.8 0l.4-.4" />
        <path d="M14.5 14.5 16.8 16.8a2 2 0 0 0 2.8 0l.9-.9" />
      </svg>
    `,
    email: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="3" />
        <path d="m4.5 7.5 7.5 5 7.5-5" />
      </svg>
    `,
    lock: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="5" y="11" width="14" height="9" rx="2" />
        <path d="M8 11V8a4 4 0 0 1 8 0v3" />
      </svg>
    `,
    arrowRight: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M5 12h13" />
        <path d="m12 5 7 7-7 7" />
      </svg>
    `,
    arrowLeft: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M19 12H6" />
        <path d="m12 5-7 7 7 7" />
      </svg>
    `,
    plus: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </svg>
    `,
    share: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <path d="m8.6 10.6 6.8-3.2" />
        <path d="m8.6 13.4 6.8 3.2" />
      </svg>
    `,
    home: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M3 11 12 4l9 7" />
        <path d="M5 10v10h14V10" />
        <path d="M9 20v-6h6v6" />
      </svg>
    `,
    pin: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M12 21s6-5.3 6-11a6 6 0 0 0-12 0c0 5.7 6 11 6 11Z" />
        <circle cx="12" cy="10" r="2.2" />
      </svg>
    `,
    map: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="m3 6 6-2 6 2 6-2v14l-6 2-6-2-6 2Z" />
        <path d="M9 4v14" />
        <path d="M15 6v14" />
      </svg>
    `,
    compass: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="8" />
        <path d="m14.5 9.5-1.6 4.6-4.6 1.6 1.6-4.6 4.6-1.6Z" />
      </svg>
    `,
    heart: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M20.8 8.5c0 5.7-8.8 11-8.8 11S3.2 14.2 3.2 8.5A4.2 4.2 0 0 1 7.4 4.3c1.5 0 2.8.8 3.6 2 .8-1.2 2.1-2 3.6-2a4.2 4.2 0 0 1 4.2 4.2Z" />
      </svg>
    `,
    help: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.5 9a2.6 2.6 0 1 1 4.4 1.9c-.8.7-1.4 1.2-1.4 2.6" />
        <path d="M12 17h.01" />
      </svg>
    `,
    x: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M6 6 18 18" />
        <path d="M18 6 6 18" />
      </svg>
    `,
    check: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="m5 12 4 4 10-10" />
      </svg>
    `,
    sparkles: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="m10 4 1.2 3.4L14 8.6l-2.8 1.2L10 13l-1.2-3.2L6 8.6l2.8-1.2L10 4Z" />
        <path d="m17 12 0.8 2.2 2.2.8-2.2.8L17 18l-.8-2.2-2.2-.8 2.2-.8L17 12Z" />
      </svg>
    `,
    user: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M20 21a8 8 0 1 0-16 0" />
        <circle cx="12" cy="8" r="4" />
      </svg>
    `,
  };
  return icons[name] ?? "";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getEnv(name, fallback = "") {
  const meta = document.querySelector(`meta[name="${name.toLowerCase()}"]`);
  if (meta?.content) return meta.content;
  return fallback;
}
