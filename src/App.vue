<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { categories, listings, type Listing } from "@/data/mockData";

type Screen =
  | "auth"
  | "market"
  | "favorites"
  | "detail"
  | "public-profile"
  | "profile-list"
  | "public-profile-list"
  | "rules"
  | "payment"
  | "payment-bank"
  | "confirmation"
  | "cancel-confirmation"
  | "payment-confirmation"
  | "pending-request"
  | "request"
  | "status"
  | "profile";
type AuthMode = "login" | "register";

const AUTH_KEY = "vercajkovna-authenticated";
const USER_KEY = "vercajkovna-user";
const SCREEN_KEY = "vercajkovna-screen";
const REMEMBER_KEY = "vercajkovna-remember";
const FAVORITES_KEY = "vercajkovna-favorites";

function readStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY) ?? sessionStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as { name?: string; email?: string }) : null;
  } catch {
    return null;
  }
}

function readStoredFavorites() {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function hasStoredAuth() {
  return Boolean(localStorage.getItem(AUTH_KEY) || sessionStorage.getItem(AUTH_KEY));
}

const isAuthenticated = ref(hasStoredAuth());
const pendingAuthScreen = ref<Screen | null>(null);
const screen = ref<Screen>("market");
const authMode = ref<AuthMode>("login");
const rememberedUser = readStoredUser();

const user = reactive({
  name: rememberedUser?.name ?? "Demo uživatel",
  email: rememberedUser?.email ?? "demo@vercajkovna.cz",
});

const auth = reactive({
  name: rememberedUser?.name ?? "",
  email: rememberedUser?.email ?? "",
  password: "",
  confirmPassword: "",
  terms: false,
  remember: localStorage.getItem(REMEMBER_KEY) !== "0",
  error: "",
  hint: "",
});
const showPassword = ref(false);
const demoProfiles = [
  { id: "tomas", name: "Tomáš", email: "tomas@vercajkovna.cz", password: "demo1234" },
  { id: "michal", name: "Michal", email: "michal@vercajkovna.cz", password: "demo1234" },
];
const demoProfileMatrix: Record<string, { offers: string[]; requests: string[] }> = {
  "tomas@vercajkovna.cz": {
    offers: ["festool-ts55", "karcher-wash", "makita-drill"],
    requests: ["festool-ts55", "karcher-wash", "laser-level"],
  },
  "michal@vercajkovna.cz": {
    offers: ["makita-drill"],
    requests: ["festool-ts55", "karcher-wash"],
  },
  "demo@vercajkovna.cz": {
    offers: ["festool-ts55"],
    requests: ["makita-drill"],
  },
};

const search = ref("");
const category = ref<string>("all");
const filtersOpen = ref(false);
const filtersAdvancedOpen = ref(false);
const filters = reactive({
  location: "",
  minPrice: 0,
  maxPrice: 1000,
  maxDistance: 15,
  deposit: "all" as "all" | "yes" | "no",
  minRating: 0,
  date: "",
});
const selectedListingId = ref(listings[0].id);
const favoriteListingIds = ref<string[]>(readStoredFavorites());
const requestDate = ref("2026-03-29");
const requestDuration = ref("7");
const requestNote = ref("Potřebuji ji na víkendový projekt.");
const requestStatus = ref("Čeká na schválení");
const requestStep = ref<1 | 2 | 3>(1);
const paymentMethod = ref<"bank" | "card" | null>(null);
const agreeTerms = ref(false);
const showCalendar = ref(false);
const cancelPendingRequestOpen = ref(false);
const confirmPaymentOpen = ref(false);
const confirmPickupOpen = ref(false);
const confirmReturnOpen = ref(false);
const datePickerInput = ref<HTMLInputElement | null>(null);
const detailDateRow = ref<HTMLElement | null>(null);
const publicReviewsSection = ref<HTMLElement | null>(null);
const notificationCount = ref(2);
const techSpecsOpen = ref(true);
const rentalTermsOpen = ref(true);
const descriptionExpanded = ref(false);
const profileListTab = ref<"offers" | "requests">("offers");
const publicProfileListTab = ref<"offers" | "requests">("offers");
const screenHistory = ref<Screen[]>([]);
const pendingRequest = reactive({
  listingId: "festool-ts55",
  statusLabel: "Čeká na schválení",
  dateRange: "12. 10. – 15. 10. 2023",
  days: 3,
  serviceFee: 80,
  deposit: 2000,
  ownerName: "Petr S.",
  accountNumber: "123456789/0100",
  paymentNote: "Půjčovné - Vrtačka Bosch",
  pickupDate: "15. 10. 2023",
  pickupTime: "14:00",
  returnDate: "18. 10. 2023",
  returnTime: "12:00",
  pickupNote:
    "Osobní předání, Praha 4 - Chodov. Konkrétní místo bude upřesněno po schválení.",
});
const pendingStatusOptions = [
  "Čeká na schválení",
  "Schváleno - čeká na platbu",
  "Platba odeslána – čeká na potvrzení",
  "Platba potvrzena - od majitele",
  "Vyzvednutí – čeká na potvrzení",
  "Vyzvednutí potvrzeno",
  "Vrácení – čeká na potvrzení",
  "Vrácení potvrzeno",
  "Zamítnuto",
  "Zrušeno",
];
const screenLabels: Record<Screen, string> = {
  auth: "Přihlášení",
  market: "Marketplace",
  favorites: "Oblíbené",
  detail: "Detail",
  "public-profile": "Veřejný profil",
  "profile-list": "Moje nabídky a poptávky",
  "public-profile-list": "Veřejné položky",
  rules: "Pravidla užívání",
  payment: "Platba",
  "payment-bank": "Platba převodem",
  confirmation: "Potvrzení",
  "cancel-confirmation": "Zrušení žádosti",
  "payment-confirmation": "Platba odeslána",
  "pending-request": "Rezervace",
  request: "Žádost",
  status: "Stav",
  profile: "Profil",
};

const selectedListing = computed<Listing>(
  () => listings.find((listing) => listing.id === selectedListingId.value) ?? listings[0],
);
const requestDateError = computed(() => requestStep.value === 1 && !requestDate.value.trim());
const pendingListing = computed<Listing>(
  () => listings.find((listing) => listing.id === pendingRequest.listingId) ?? listings[0],
);
const pendingSummary = computed(() => {
  const rental = pendingListing.value.priceValue * pendingRequest.days;
  const total = rental + pendingRequest.serviceFee + pendingRequest.deposit;
  return { rental, total };
});
const closePendingCancelModal = () => {
  cancelPendingRequestOpen.value = false;
};
const confirmCancelPendingRequest = () => {
  cancelPendingRequestOpen.value = false;
  setScreen("cancel-confirmation");
};
const closeConfirmPaymentModal = () => {
  confirmPaymentOpen.value = false;
};
const confirmPendingPayment = () => {
  confirmPaymentOpen.value = false;
  pendingRequest.statusLabel = "Platba odeslána – čeká na potvrzení";
  setScreen("payment-confirmation");
};
const closeConfirmPickupModal = () => {
  confirmPickupOpen.value = false;
};
const confirmPickup = () => {
  confirmPickupOpen.value = false;
  pendingRequest.statusLabel = "Vrácení – čeká na potvrzení";
};
const closeConfirmReturnModal = () => {
  confirmReturnOpen.value = false;
};
const confirmReturn = () => {
  confirmReturnOpen.value = false;
  pendingRequest.statusLabel = "Vrácení potvrzeno";
};
const openProfileRequestsList = () => {
  profileListTab.value = "requests";
  setScreen("profile-list");
};
const pendingRequestActionsDisabled = computed(
  () => pendingRequest.statusLabel === "Čeká na schválení",
);
const isRequestReservationStatus = (statusLabel: string) =>
  statusLabel === "Čeká na schválení" ||
  statusLabel === "Schváleno - čeká na platbu" ||
  statusLabel === "Platba odeslána – čeká na potvrzení" ||
  statusLabel === "Platba potvrzena - od majitele" ||
  statusLabel === "Vyzvednutí – čeká na potvrzení" ||
  statusLabel === "Vyzvednutí potvrzeno" ||
  statusLabel === "Vrácení – čeká na potvrzení" ||
  statusLabel === "Vrácení potvrzeno";
const viewedPublicProfile = ref(selectedListing.value.owner);

const publicProfiles: Record<
  string,
  {
    rating: string;
    reviews: string;
    response: string;
    location: string;
    bio: string;
    listings: string[];
    requests: string[];
    feedback: Array<{
      author: string;
      avatar: string;
      role: string;
      stars: number;
      text: string;
      date: string;
    }>;
  }
> = {
  Tomáš: {
    rating: "4.8",
    reviews: "24 recenzí",
    response: "odpovídá do 2 hodin",
    location: "Praha 7",
    bio: "Majitel, který má doma víc vercajku než poliček. Půjčuje hlavně na víkendové projekty a menší opravy.",
    listings: ["festool-ts55", "karcher-wash", "makita-drill"],
    requests: ["laser-level"],
    feedback: [
      {
        author: "Jana",
        avatar: "J",
        role: "Nájemce",
        stars: 5,
        text: "Vše proběhlo rychle a bez komplikací. Vercajk byl připravený.",
        date: "Před 2 dny",
      },
      {
        author: "Pavel",
        avatar: "P",
        role: "Majitel",
        stars: 4,
        text: "Domluva super, předání přesné a zařízení ve skvělém stavu.",
        date: "Minulý týden",
      },
      {
        author: "Lucie",
        avatar: "L",
        role: "Nájemce",
        stars: 5,
        text: "Půjčení bez stresu, ochotný přístup a jasné instrukce.",
        date: "Před měsícem",
      },
    ],
  },
  Michal: {
    rating: "4.9",
    reviews: "18 recenzí",
    response: "odpovídá do 1 hodiny",
    location: "Brno-střed",
    bio: "Pečlivě udržovaný vercajk, rychlé předání a přehledný stav věcí. Ideální pro demo flow i běžné půjčování.",
    listings: ["makita-drill"],
    requests: ["festool-ts55"],
    feedback: [
      {
        author: "Tomáš",
        avatar: "T",
        role: "Nájemce",
        stars: 5,
        text: "Perfektní stav, rychlá komunikace a bezproblémové předání.",
        date: "Před 3 dny",
      },
      {
        author: "Jana",
        avatar: "J",
        role: "Nájemce",
        stars: 5,
        text: "Vše sedělo podle popisu, určitě půjčím znovu.",
        date: "Před 2 týdny",
      },
    ],
  },
};
const currentPublicProfile = computed(
  () => publicProfiles[viewedPublicProfile.value] ?? publicProfiles.Tomáš,
);
const currentUserProfile = computed(() => publicProfiles[user.name] ?? publicProfiles.Tomáš);

const favoriteListings = computed(() =>
  listings.filter((listing) => favoriteListingIds.value.includes(listing.id)),
);

const offerStatusMap: Record<string, { label: string; tone: string }> = {
  "festool-ts55": { label: "Čeká na schválení", tone: "is-brown" },
  "karcher-wash": { label: "Schváleno - čeká na platbu", tone: "is-green" },
  "makita-drill": { label: "Zamítnutí", tone: "is-muted" },
};

const requestStatusMap: Record<string, { label: string; tone: string }> = {
  "festool-ts55": { label: "Čeká na schválení", tone: "is-brown" },
  "karcher-wash": { label: "Schváleno - čeká na platbu", tone: "is-green" },
  "laser-level": { label: "Zamítnutí", tone: "is-muted" },
  "makita-drill": { label: "Schváleno - čeká na platbu", tone: "is-green" },
};

const profileOffers = computed(() => {
  const bucket = demoProfileMatrix[user.email] ?? demoProfileMatrix["demo@vercajkovna.cz"];
  return bucket.offers
    .map((id) => {
      const listing = listings.find((item) => item.id === id);
      if (!listing) return null;
      const status = offerStatusMap[id] ?? { label: "Čeká na schválení", tone: "is-brown" };
      return {
        id,
        title: listing.title,
        priceValue: listing.priceValue,
        location: listing.location,
        statusLabel: status.label,
        statusTone: status.tone,
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
});

const profileRequests = computed(() => {
  const bucket = demoProfileMatrix[user.email] ?? demoProfileMatrix["demo@vercajkovna.cz"];
  return bucket.requests
    .map((id) => {
      const listing = listings.find((item) => item.id === id);
      if (!listing) return null;
      const status = requestStatusMap[id] ?? { label: "Čeká na schválení", tone: "is-brown" };
      return {
        id,
        title: listing.title,
        priceValue: listing.priceValue,
        location: listing.location,
        statusLabel: status.label,
        statusTone: status.tone,
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
});

const calendarInfo = computed(() => {
  const base = requestDate.value ? new Date(requestDate.value) : new Date();
  const year = base.getFullYear();
  const month = base.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const mondayStart = (firstDay.getDay() + 6) % 7;
  const cells = Array.from({ length: 42 }, (_, idx) => {
    const day = idx - mondayStart + 1;
    return day > 0 && day <= daysInMonth ? day : null;
  });
  const monthNames = [
    "Leden",
    "Únor",
    "Březen",
    "Duben",
    "Květen",
    "Červen",
    "Červenec",
    "Srpen",
    "Září",
    "Říjen",
    "Listopad",
    "Prosinec",
  ];
  return {
    year,
    month,
    label: `${monthNames[month]} ${year}`,
    cells,
  };
});

const selectedDay = computed(() => {
  if (!requestDate.value) return null;
  const date = new Date(requestDate.value);
  return date.getDate();
});

const priceSummary = computed(() => {
  const days = Math.max(1, Number(requestDuration.value) || 1);
  const serviceFee = 120;
  const deposit = selectedListing.value.depositRequired ? 2000 : 0;
  const daily = selectedListing.value.priceValue;
  const total = daily * days + serviceFee + deposit;
  return { days, daily, serviceFee, deposit, total };
});

const filteredListings = computed(() => {
  const query = search.value.trim().toLowerCase();
  const locationQuery = filters.location.trim().toLowerCase();
  return listings.filter((listing) => {
    const matchesCategory = category.value === "all" || listing.category === category.value;
    const matchesQuery =
      !query ||
      [listing.title, listing.location, listing.description, listing.owner]
        .join(" ")
        .toLowerCase()
        .includes(query);
    const matchesPrice = listing.priceValue >= filters.minPrice && listing.priceValue <= filters.maxPrice;
    const matchesDistance = listing.distanceValue <= filters.maxDistance;
    const matchesLocation =
      !locationQuery || listing.location.toLowerCase().includes(locationQuery);
    const matchesDeposit =
      filters.deposit === "all" ||
      (filters.deposit === "yes" && listing.depositRequired) ||
      (filters.deposit === "no" && !listing.depositRequired);
    const matchesRating = listing.rating >= filters.minRating;

    return (
      matchesCategory &&
      matchesQuery &&
      matchesPrice &&
      matchesDistance &&
      matchesLocation &&
      matchesDeposit &&
      matchesRating
    );
  });
});

const categoryButtons = computed(() =>
  categories.map((item) => {
    const icons: Record<string, string> = {
      all: "pi-th-large",
      stavba: "pi-wrench",
      dilna: "pi-cog",
      udrzba: "pi-sliders-h",
      mereni: "pi-compass",
    };

    return {
      ...item,
      icon: icons[item.id] ?? "pi-th-large",
    };
  }),
);

function compactAvailability(value: string) {
  const words = value.split(/\s+/);
  if (words.length <= 3) return value;
  return `${words.slice(0, 3).join(" ")}…`;
}

function persistFavorites(next: string[]) {
  favoriteListingIds.value = next;
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
}

function isFavorite(id: string) {
  return favoriteListingIds.value.includes(id);
}

function toggleFavorite(id: string) {
  const next = isFavorite(id)
    ? favoriteListingIds.value.filter((item) => item !== id)
    : [...favoriteListingIds.value, id];

  persistFavorites(next);
}

const featuredListings = computed(() => filteredListings.value.slice(0, 2));
const allMarketplaceListings = computed(() => filteredListings.value);
const marketResultsCount = computed(() => filteredListings.value.length);
const activeFilterCount = computed(() => {
  let count = 0;
  if (search.value.trim()) count += 1;
  if (category.value !== "all") count += 1;
  if (filters.location.trim()) count += 1;
  if (filters.minPrice !== 0) count += 1;
  if (filters.maxPrice !== 1000) count += 1;
  if (filters.maxDistance !== 15) count += 1;
  if (filters.deposit !== "all") count += 1;
  if (filters.minRating > 0) count += 1;
  if (filters.date.trim()) count += 1;
  return count;
});

const passwordRules = computed(() => {
  const value = auth.password;
  return [
    { label: "Min. 8 znaků", ok: value.length >= 8 },
    { label: "Velké písmeno", ok: /[A-Z]/.test(value) },
    { label: "Malé písmeno", ok: /[a-z]/.test(value) },
    { label: "Číslo nebo symbol", ok: /[\d\W]/.test(value) },
  ];
});

const passwordsMatch = computed(() => {
  return auth.confirmPassword.length > 0 && auth.password === auth.confirmPassword;
});

const registerTermsLabel = "Souhlasím s podmínkami a zpracováním osobních údajů.";
const authHeading = computed(() =>
  authMode.value === "login" ? { submitLabel: "Přihlásit se" } : { submitLabel: "Registrovat se" },
);

function persistAuth(remember: boolean, name: string, email: string) {
  const storage = remember ? localStorage : sessionStorage;
  const otherStorage = remember ? sessionStorage : localStorage;
  storage.setItem(AUTH_KEY, "1");
  storage.setItem(USER_KEY, JSON.stringify({ name, email }));
  storage.setItem(REMEMBER_KEY, remember ? "1" : "0");
  otherStorage.removeItem(AUTH_KEY);
  otherStorage.removeItem(USER_KEY);
  otherStorage.removeItem(REMEMBER_KEY);
  isAuthenticated.value = true;
}

function clearAuth() {
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(REMEMBER_KEY);
  sessionStorage.removeItem(AUTH_KEY);
  sessionStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(REMEMBER_KEY);
  isAuthenticated.value = false;
}

function setScreen(next: Screen) {
  if (screen.value !== next) {
    screenHistory.value.push(screen.value);
  }
  screen.value = next;
  localStorage.setItem(SCREEN_KEY, next);
}

function openAuth(returnTo: Screen | null = null) {
  pendingAuthScreen.value = returnTo;
  authMode.value = "login";
  auth.error = "";
  auth.hint = "";
  setScreen("auth");
}

function afterAuth(defaultScreen: Screen = "market") {
  const nextScreen = pendingAuthScreen.value ?? defaultScreen;
  pendingAuthScreen.value = null;
  setScreen(nextScreen);
}

function requireAuth(nextScreen: Screen) {
  if (isAuthenticated.value) {
    setScreen(nextScreen);
    return true;
  }

  openAuth(nextScreen);
  return false;
}

function openListing(id: string) {
  selectedListingId.value = id;
  setScreen("detail");
}

function openPublicProfile(ownerName: string) {
  viewedPublicProfile.value = ownerName;
  setScreen("public-profile");
}

function scrollToPublicReviews() {
  publicReviewsSection.value?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function openProfileListPage(tab: "offers" | "requests") {
  profileListTab.value = tab;
  setScreen("profile-list");
}

function openPublicProfileListPage(tab: "offers" | "requests") {
  publicProfileListTab.value = tab;
  setScreen("public-profile-list");
}

function openPendingRequest(request: {
  id: string;
  statusLabel: string;
}) {
  pendingRequest.listingId = request.id;
  pendingRequest.statusLabel = request.statusLabel;
  setScreen("pending-request");
}

function openRequest(id?: string) {
  if (id) selectedListingId.value = id;
  requestStep.value = 1;
  requireAuth("request");
}

function openProfile() {
  requireAuth("profile");
}

function openFavorites() {
  setScreen("favorites");
}

function openRules() {
  setScreen("rules");
}

function openPayment() {
  setScreen("payment");
}

function openPaymentBank() {
  setScreen("payment-bank");
}

function openStatus() {
  requireAuth("status");
}

function submitAuth() {
  const email = auth.email.trim();
  const password = auth.password.trim();
  const name = auth.name.trim();

  if (authMode.value === "login") {
    if (!email || !password) {
      auth.error = "Vyplň email i heslo.";
      return;
    }
    auth.error = "";
    auth.hint = "";
    user.email = email;
    user.name = name || "Demo uživatel";
    persistAuth(auth.remember, user.name, email);
    afterAuth();
    return;
  }

  if (!name || !email || !password || !auth.confirmPassword.trim()) {
    auth.error = "Vyplň všechna pole registrace.";
    return;
  }

  const passwordChecks = passwordRules.value;
  const failedRule = passwordChecks.find((rule) => !rule.ok);
  if (failedRule) {
    auth.error = `Heslo nesplňuje požadavek: ${failedRule.label.toLowerCase()}.`;
    return;
  }

  if (password !== auth.confirmPassword.trim()) {
    auth.error = "Hesla se neshodují.";
    return;
  }

  if (!auth.terms) {
    auth.error = "Musíš souhlasit s podmínkami, abys mohl pokračovat.";
    return;
  }

  auth.error = "";
  auth.hint = "";
  user.name = name;
  user.email = email;
  persistAuth(true, name, email);
  afterAuth();
}

function useDemoProfile(profile: { name: string; email: string; password: string }) {
  authMode.value = "login";
  auth.name = profile.name;
  auth.email = profile.email;
  auth.password = profile.password;
  auth.confirmPassword = "";
  auth.terms = false;
  auth.error = "";
  auth.hint = `Demo profil ${profile.name} je připravený.`;
  showPassword.value = false;
  submitAuth();
}

function togglePasswordVisibility() {
  showPassword.value = !showPassword.value;
}

function switchAuthMode(mode: AuthMode) {
  authMode.value = mode;
  auth.error = "";
  auth.hint = "";
  showPassword.value = false;
}

function handleHelp() {
  auth.error = "";
  auth.hint = "Použij demo vstup, nebo pokračuj přes formulář bez backendu.";
}

function logout() {
  clearAuth();
  pendingAuthScreen.value = null;
  authMode.value = "login";
  auth.password = "";
  auth.confirmPassword = "";
  auth.terms = false;
  auth.error = "";
  auth.hint = "";
  setScreen("market");
}

function goBack() {
  if (screenHistory.value.length > 0) {
    const previous = screenHistory.value.pop() ?? "market";
    screen.value = previous;
    localStorage.setItem(SCREEN_KEY, previous);
    return;
  }

  if (screen.value === "auth") {
    pendingAuthScreen.value = null;
    screen.value = "market";
    localStorage.setItem(SCREEN_KEY, "market");
  }
}

function completeRequest() {
  requestStatus.value = "Čeká na schválení";
  setScreen("status");
}

function nextRequestStep() {
  if (requestStep.value === 1 && !requestDate.value.trim()) {
    return;
  }
  requestStep.value = (requestStep.value + 1) as 1 | 2 | 3;
}

function prevRequestStep() {
  requestStep.value = (requestStep.value - 1) as 1 | 2 | 3;
}

function handleDateInput() {
}

function openDatePicker() {
  const input = datePickerInput.value;
  if (!input) return;
  if (typeof input.showPicker === "function") {
    input.showPicker();
    return;
  }
  input.focus();
}

function handlePrimaryCTA() {
  if (!requestDate.value.trim()) {
    detailDateRow.value?.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }
  openPayment();
}

function selectCalendarDay(day: number) {
  const month = calendarInfo.value.month + 1;
  const formatted = `${calendarInfo.value.year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  requestDate.value = formatted;
  showCalendar.value = false;
}

function submitReservation() {
  requestStatus.value = "Žádost odeslána!";
  setScreen("confirmation");
}

function approveRequest() {
  requestStatus.value = requestStatus.value === "Schváleno" ? "Čeká na schválení" : "Schváleno";
}

function noteCategorySelected(id: string) {
  category.value = id;
}

function toggleFilters() {
  filtersOpen.value = !filtersOpen.value;
}

function openSearchFilters() {
  if (window.matchMedia("(max-width: 720px)").matches) {
    filtersOpen.value = true;
  }
}

function toggleAdvancedFilters() {
  filtersAdvancedOpen.value = !filtersAdvancedOpen.value;
}

function resetFilters() {
  search.value = "";
  category.value = "all";
  filters.location = "";
  filters.minPrice = 0;
  filters.maxPrice = 1000;
  filters.maxDistance = 15;
  filters.deposit = "all";
  filters.minRating = 0;
  filters.date = "";
}

function applyFilters() {
  filtersOpen.value = false;
}

if (typeof window !== "undefined") {
  const storedScreen = localStorage.getItem(SCREEN_KEY) as Screen | null;
  if (hasStoredAuth() && storedScreen && storedScreen !== "auth") {
    screen.value = storedScreen;
  } else {
    screen.value = "market";
  }
}
</script>

<template>
  <div class="app-shell">
    <div class="backdrop backdrop-a" />
    <div class="backdrop backdrop-b" />

    <header
      v-if="
        screen !== 'auth' &&
        screen !== 'market' &&
        screen !== 'detail' &&
        screen !== 'public-profile' &&
        screen !== 'pending-request' &&
        screen !== 'rules' &&
        screen !== 'payment' &&
        screen !== 'payment-bank' &&
        screen !== 'confirmation'
      "
      class="topbar topbar-app"
    >
      <div class="topbar-inner">
        <button class="icon-button" type="button" aria-label="Zpět" @click="goBack">
          <i class="pi pi-arrow-left"></i>
        </button>
        <div class="topbar-title">
          <strong>Vercajkovna</strong>
          <span>{{ screenLabels[screen] }}</span>
        </div>
        <div class="topbar-actions">
          <button
            v-if="isAuthenticated"
            class="icon-button"
            type="button"
            aria-label="Profil"
            @click="openProfile"
          >
            <i class="pi pi-user"></i>
          </button>
          <button
            v-else
            class="icon-button"
            type="button"
            aria-label="Přihlásit se"
            @click="openAuth()"
          >
            <i class="pi pi-sign-in"></i>
          </button>
          <button v-if="isAuthenticated" class="icon-button" type="button" aria-label="Odhlásit se" @click="logout">
            <i class="pi pi-sign-out"></i>
          </button>
        </div>
      </div>
    </header>

    <header v-if="screen === 'auth'" class="auth-topbar">
      <button class="auth-back-button" type="button" aria-label="Zpět" @click="goBack">
        <i class="pi pi-arrow-left"></i>
      </button>
    </header>

    <main class="frame">
      <section v-if="screen === 'auth'" class="auth-shell">
        <div class="auth-page" :class="{ 'is-login': authMode === 'login', 'is-register': authMode === 'register' }">
          <div class="auth-brand-row auth-brand-row-center">
            <div class="auth-brand-mark auth-brand-mark-inline">V</div>
            <div class="auth-brand-copy auth-brand-copy-inline">
              <strong>Vercajkovna</strong>
              <span>Půjčujte chytře</span>
            </div>
          </div>

          <div class="auth-panel" :class="{ 'is-login': authMode === 'login', 'is-register': authMode === 'register' }">
            <div class="auth-panel-head">
              <span class="auth-page-kicker">{{ authMode === 'login' ? "Přihlášení" : "Registrace" }}</span>
              <h1>{{ authMode === 'login' ? "Přihlas se do účtu" : "Vytvoř si účet" }}</h1>
              <p>
                {{
                  authMode === "login"
                    ? "Pokračuj tam, kde jsi skončil."
                    : "Začni během minuty a přidej se k lidem, kteří sdílí věci."
                }}
              </p>
            </div>

            <div class="auth-tabs" aria-label="Volba přístupu">
              <button
                class="auth-tab"
                :class="{ 'is-active': authMode === 'login' }"
                type="button"
                @click="switchAuthMode('login')"
              >
                Přihlášení
              </button>
              <button
                class="auth-tab"
                :class="{ 'is-active': authMode === 'register' }"
                type="button"
                @click="switchAuthMode('register')"
              >
                Registrace
              </button>
            </div>

            <form class="auth-form" @submit.prevent="submitAuth">
              <div v-if="authMode === 'register'" class="field">
                <label for="authName">Jméno</label>
                <div class="input-shell">
                  <i class="pi pi-user input-icon"></i>
                  <PvInputText
                    id="authName"
                    v-model="auth.name"
                    class="auth-input"
                    autocomplete="name"
                    placeholder="Jan Novák"
                  />
                </div>
              </div>

              <div class="field">
                <label for="authEmail">Email</label>
                <div class="input-shell">
                  <i class="pi pi-envelope input-icon"></i>
                  <PvInputText
                    id="authEmail"
                    v-model="auth.email"
                    class="auth-input"
                    autocomplete="email"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div class="field">
                <div class="field-row">
                  <label for="authPassword">Heslo</label>
                  <button class="field-link" type="button" @click="handleHelp">Zapomenuté heslo?</button>
                </div>
                <div class="input-shell">
                  <i class="pi pi-lock input-icon"></i>
                  <input
                    id="authPassword"
                    v-model="auth.password"
                    class="auth-input native-input"
                    :type="showPassword ? 'text' : 'password'"
                    autocomplete="current-password"
                    placeholder="••••••••"
                  />
                  <button class="input-action" type="button" :aria-label="showPassword ? 'Skrýt heslo' : 'Zobrazit heslo'" @click="togglePasswordVisibility">
                    <i :class="['pi', showPassword ? 'pi-eye-slash' : 'pi-eye']"></i>
                  </button>
                </div>
                <div v-if="authMode === 'register'" class="password-rules" aria-label="Požadavky na heslo">
                  <div
                    v-for="rule in passwordRules"
                    :key="rule.label"
                    class="password-rule"
                    :class="{ 'is-ok': rule.ok }"
                  >
                    <span class="password-rule-dot" />
                    <span>{{ rule.label }}</span>
                  </div>
                </div>
              </div>

              <div v-if="authMode === 'register'" class="field">
                <label for="authConfirm">Potvrzení hesla</label>
                <div class="input-shell">
                  <i class="pi pi-lock input-icon"></i>
                  <input
                    id="authConfirm"
                    v-model="auth.confirmPassword"
                    class="auth-input native-input"
                    :type="showPassword ? 'text' : 'password'"
                    autocomplete="new-password"
                    placeholder="••••••••"
                  />
                  <button class="input-action" type="button" :aria-label="showPassword ? 'Skrýt heslo' : 'Zobrazit heslo'" @click="togglePasswordVisibility">
                    <i :class="['pi', showPassword ? 'pi-eye-slash' : 'pi-eye']"></i>
                  </button>
                </div>
                <div class="field-status" :class="{ 'is-ok': passwordsMatch }">
                  {{ passwordsMatch ? "Hesla se shodují." : "Hesla se musí shodovat." }}
                </div>
              </div>

              <div class="auth-meta-row">
                <label v-if="authMode === 'login'" class="checkbox-row auth-remember-row">
                  <PvCheckbox v-model="auth.remember" binary />
                  <span>Zapamatovat si mě</span>
                </label>

                <label v-if="authMode === 'register'" class="checkbox-row terms-row">
                  <PvCheckbox v-model="auth.terms" binary />
                  <span>{{ registerTermsLabel }}</span>
                </label>
              </div>

              <PvButton class="auth-submit auth-submit-primary" type="submit">
                {{ authHeading.submitLabel }}
              </PvButton>

              <div v-if="authMode === 'login'" class="auth-demo-group">
                <span class="auth-demo-label">Demo profily</span>
                <div class="auth-demo-grid">
                  <button
                    v-for="profile in demoProfiles"
                    :key="profile.id"
                    class="auth-demo-card"
                    type="button"
                    @click="useDemoProfile(profile)"
                  >
                    <span class="auth-demo-name">{{ profile.name }}</span>
                    <span class="auth-demo-email">{{ profile.email }}</span>
                  </button>
                </div>
                <div class="auth-demo-hint">Klikni a rovnou přihlásíme vybraný profil.</div>
              </div>

              <div class="auth-divider">
                <span>Nebo pokračujte přes</span>
              </div>

              <div class="auth-social">
                <button class="social-button" type="button" aria-label="Google">
                  <span class="social-mark social-google">G</span>
                </button>
                <button class="social-button" type="button" aria-label="Apple">
                  <span class="social-mark social-apple"></span>
                </button>
                <button class="social-button" type="button" aria-label="Facebook">
                  <span class="social-mark social-facebook">f</span>
                </button>
              </div>

              <div v-if="auth.hint" class="auth-support">{{ auth.hint }}</div>

              <div class="auth-support">
                Máte potíže s přihlášením? <strong>Kontaktujte podporu</strong>
              </div>

              <div v-if="auth.error" class="auth-error" role="alert">{{ auth.error }}</div>
            </form>
          </div>
        </div>
      </section>

      <section v-else class="main-panel">
        <div v-if="screen === 'market'" class="screen-inner market-shell market-page">
          <header class="market-hero-card">
            <div class="market-topbar market-desktop-header">
              <button class="market-brand" type="button" aria-label="Vercajkovna">
                <span class="market-brand-mark">V</span>
                <span class="market-brand-word">Vercajkovna</span>
              </button>
              <div class="market-topbar-actions">
                <button class="market-avatar-btn" type="button" aria-label="Profil">
                  {{ user.name.charAt(0).toUpperCase() }}
                </button>
              </div>
            </div>

            <div class="market-page-header">
              <div class="market-page-header-copy">
                <span class="market-page-kicker">Marketplace</span>
                <h1>
                  <span>Co si dnes</span>
                  <span>chceš půjčit?</span>
                </h1>
                <p>Nejbližší věci, které si můžeš dnes půjčit nebo rezervovat.</p>
              </div>
            </div>

            <div class="market-page-controls">
              <div class="market-search-shell market-search-shell-hero" @click="openSearchFilters">
                <i class="pi pi-search"></i>
                <PvInputText
                  v-model="search"
                  class="market-search"
                  autocomplete="off"
                  placeholder="Bosch, žebřík, Praha..."
                />
              </div>
            </div>

            <div class="market-primary-filters" aria-label="Hlavní filtry">
              <label class="market-primary-field">
                <span>Lokalita</span>
                <div class="market-primary-input">
                  <i class="pi pi-map-marker"></i>
                  <input v-model="filters.location" class="native-input" type="text" placeholder="Praha, Brno..." />
                </div>
              </label>

              <label class="market-primary-field">
                <span>Termín</span>
                <div class="market-primary-input">
                  <i class="pi pi-calendar"></i>
                  <input v-model="filters.date" class="native-input" type="date" />
                </div>
              </label>

              <button class="market-primary-more" type="button" @click="toggleFilters">
                <span>Více možností</span>
                <span class="market-filter-toggle-badge" :class="{ 'is-active': activeFilterCount > 0 }">
                  {{ activeFilterCount || "0" }}
                </span>
              </button>
            </div>
          </header>

          <div class="market-icons">
            <button
              v-for="item in categoryButtons"
              :key="item.id"
              class="market-icon-chip"
              :class="{ 'is-active': category === item.id }"
              type="button"
              @click="noteCategorySelected(item.id)"
            >
              <span class="market-icon-circle">
                <i :class="['pi', item.icon]"></i>
              </span>
              <span>{{ item.label }}</span>
            </button>
          </div>

            <div class="market-filter-shell">
            <div class="market-filter-panel" :class="{ 'is-open': filtersOpen }">
              <div class="market-filter-panel-mobile-top">
                <div class="market-search-shell market-search-shell-overlay">
                  <i class="pi pi-search"></i>
                  <PvInputText
                    v-model="search"
                    class="market-search"
                    autocomplete="off"
                    placeholder="Bosch, žebřík, Praha..."
                  />
                </div>
                <button
                  class="market-filter-panel-close"
                  type="button"
                  aria-label="Zavřít filtry"
                  @click="filtersOpen = false"
                >
                  <i class="pi pi-times"></i>
                </button>
              </div>

              <div class="market-filter-panel-head">
                <div>
                  <span class="market-filter-kicker">Filtry</span>
                  <strong>Upřesni nabídky</strong>
                </div>
                <div class="market-filter-panel-head-actions">
                  <button class="market-filter-reset" type="button" @click="toggleAdvancedFilters">
                    {{ filtersAdvancedOpen ? "Méně" : "Více možností" }}
                  </button>
                  <button class="market-filter-reset" type="button" @click="resetFilters">Resetovat</button>
                </div>
              </div>

              <div class="market-filter-quick">
                <button
                  v-for="item in categoryButtons"
                  :key="`filter-${item.id}`"
                  class="market-filter-chip"
                  :class="{ 'is-active': category === item.id }"
                  type="button"
                  @click="noteCategorySelected(item.id)"
                >
                  {{ item.label }}
                </button>
              </div>

              <div class="market-filter-grid">
                <label class="field filter-field">
                  <span>Cena za den</span>
                  <div class="filter-range-input">
                    <div class="filter-inline-input">
                      <span>od</span>
                      <input v-model.number="filters.minPrice" class="native-input filter-input" type="number" min="0" step="50" />
                      <span>Kč</span>
                    </div>
                    <div class="filter-inline-input">
                      <span>do</span>
                      <input v-model.number="filters.maxPrice" class="native-input filter-input" type="number" min="0" step="50" />
                      <span>Kč</span>
                    </div>
                  </div>
                </label>

                <label class="field filter-field">
                  <span>Lokalita</span>
                  <input v-model="filters.location" class="native-input filter-input" type="text" placeholder="Praha, Brno..." />
                </label>

                <label class="field filter-field filter-range-field">
                  <div class="field-row">
                    <span>Max. vzdálenost</span>
                    <span>V okruhu {{ filters.maxDistance }} km</span>
                  </div>
                  <input v-model.number="filters.maxDistance" class="filter-range" type="range" min="0" max="15" step="0.5" />
                </label>

                <label class="field filter-field">
                  <span>Termín vypůjčení</span>
                  <div class="filter-inline-input">
                    <input v-model="filters.date" class="native-input filter-input" type="date" />
                  </div>
                </label>
              </div>

              <div class="market-filter-groups" :class="{ 'is-open': filtersAdvancedOpen }">
                <div class="market-filter-group">
                  <span class="market-filter-group-label">Vyžadovat depozit</span>
                  <div class="market-filter-segment">
                    <button
                      class="market-filter-segment-btn"
                      :class="{ 'is-active': filters.deposit === 'all' }"
                      type="button"
                      @click="filters.deposit = 'all'"
                    >
                      Vše
                    </button>
                    <button
                      class="market-filter-segment-btn"
                      :class="{ 'is-active': filters.deposit === 'yes' }"
                      type="button"
                      @click="filters.deposit = 'yes'"
                    >
                      Ano
                    </button>
                    <button
                      class="market-filter-segment-btn"
                      :class="{ 'is-active': filters.deposit === 'no' }"
                      type="button"
                      @click="filters.deposit = 'no'"
                    >
                      Ne
                    </button>
                  </div>
                </div>

                <div class="market-filter-group">
                  <span class="market-filter-group-label">Hodnocení majitele</span>
                  <div class="market-filter-rating">
                    <button
                      v-for="star in 5"
                      :key="star"
                      class="market-filter-star"
                      :class="{ 'is-active': filters.minRating >= star }"
                      type="button"
                      @click="filters.minRating = star"
                    >
                      <i class="pi pi-star"></i>
                    </button>
                  </div>
                </div>
              </div>

              <button class="market-filter-more" type="button" @click="toggleAdvancedFilters">
                <span>{{ filtersAdvancedOpen ? "Skrýt další možnosti" : "Více možností" }}</span>
                <i :class="['pi', filtersAdvancedOpen ? 'pi-chevron-up' : 'pi-chevron-down']"></i>
              </button>

              <div class="market-filter-actions">
                <button class="market-filter-apply" type="button" @click="applyFilters">
                  Zobrazit {{ marketResultsCount }} výsledků
                </button>
              </div>
            </div>
          </div>

          <section class="market-section">
            <div class="market-section-head">
              <h2>Nejbližší nabídky</h2>
            </div>
            <div class="market-card-grid market-card-grid-top">
              <div
                v-for="listing in featuredListings"
                :key="listing.id"
                class="market-item-card"
                @click="openListing(listing.id)"
              >
                <div class="market-item-thumb" aria-hidden="true"></div>
                <button
                  class="market-item-favorite"
                  :class="{ 'is-active': isFavorite(listing.id) }"
                  type="button"
                  :aria-label="isFavorite(listing.id) ? 'Odebrat z oblíbených' : 'Přidat do oblíbených'"
                  @click.stop="toggleFavorite(listing.id)"
                >
                  <i :class="['pi', isFavorite(listing.id) ? 'pi-heart-fill' : 'pi-heart']"></i>
                </button>
                <div class="market-item-copy">
                  <div class="market-item-copy-head">
                    <h3>{{ listing.title }}</h3>
                  </div>
                  <p class="market-item-location">{{ listing.location }} • {{ listing.distance }}</p>
                  <div class="market-item-meta">
                    <span class="market-item-price">{{ listing.price }}</span>
                    <span class="market-item-status" :class="{ 'is-green': !listing.depositRequired }">
                      {{ listing.depositRequired ? "Záloha" : "Bez zálohy" }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section class="market-section">
            <div class="market-section-head market-section-head-row">
              <h2>Všechny nabídky</h2>
              <div class="market-section-actions">
                <button class="market-filter-btn" type="button">Řadit</button>
              </div>
            </div>
            <div class="market-card-grid">
              <div
                v-for="listing in allMarketplaceListings"
                :key="listing.id"
                class="market-item-card"
                @click="openListing(listing.id)"
              >
                <div class="market-item-thumb" aria-hidden="true"></div>
                <button
                  class="market-item-favorite"
                  :class="{ 'is-active': isFavorite(listing.id) }"
                  type="button"
                  :aria-label="isFavorite(listing.id) ? 'Odebrat z oblíbených' : 'Přidat do oblíbených'"
                  @click.stop="toggleFavorite(listing.id)"
                >
                  <i :class="['pi', isFavorite(listing.id) ? 'pi-heart-fill' : 'pi-heart']"></i>
                </button>
                <div class="market-item-copy">
                  <div class="market-item-copy-head">
                    <h3>{{ listing.title }}</h3>
                  </div>
                  <p class="market-item-location">{{ listing.location }} • {{ listing.distance }}</p>
                  <div class="market-item-meta">
                    <span class="market-item-price">{{ listing.price }}</span>
                    <span class="market-item-status" :class="{ 'is-green': !listing.depositRequired }">
                      {{ listing.depositRequired ? "Záloha" : "Bez zálohy" }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>

        <div v-else-if="screen === 'favorites'" class="screen-inner">
          <div class="detail-hero">
            <div class="detail-hero-copy">
              <span class="eyebrow">Oblíbené</span>
              <h1>Uložený vercajk</h1>
              <p>Věci, které sis označil a chceš se k nim vrátit později.</p>
            </div>
          </div>

          <div v-if="favoriteListings.length" class="market-card-grid">
            <div
              v-for="listing in favoriteListings"
              :key="listing.id"
              class="market-item-card"
              @click="openListing(listing.id)"
            >
              <div class="market-item-thumb" aria-hidden="true"></div>
              <button
                class="market-item-favorite is-active"
                type="button"
                aria-label="Odebrat z oblíbených"
                @click.stop="toggleFavorite(listing.id)"
              >
                <i class="pi pi-heart-fill"></i>
              </button>
              <div class="market-item-copy">
                <div class="market-item-copy-head">
                  <h3>{{ listing.title }}</h3>
                </div>
                <p class="market-item-location">{{ listing.location }} • {{ listing.distance }}</p>
                <div class="market-item-meta">
                  <span class="market-item-price">{{ listing.price }}</span>
                  <span class="market-item-status" :class="{ 'is-green': !listing.depositRequired }">
                    {{ listing.depositRequired ? "Záloha" : "Bez zálohy" }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <PvCard v-else class="profile-card">
            <span class="eyebrow">Prázdné</span>
            <h1>Ještě nic nemáš uložené</h1>
            <p>Klikni na srdíčko u nabídky a tady se objeví.</p>
            <div class="profile-actions">
              <PvButton class="button-primary" @click="setScreen('market')">Prohlížet nabídky</PvButton>
            </div>
          </PvCard>
        </div>

        <div v-else-if="screen === 'detail'" class="screen-inner detail-page">
          <div class="detail-hero-media">
            <div class="detail-hero-actions">
              <button class="detail-action-btn" type="button" aria-label="Zpět" @click="goBack">
                <i class="pi pi-arrow-left"></i>
              </button>
              <div class="detail-action-group">
                <button class="detail-action-btn" type="button" aria-label="Sdílet">
                  <i class="pi pi-share-alt"></i>
                </button>
                <button
                  class="detail-action-btn"
                  type="button"
                  :class="{ 'is-active': isFavorite(selectedListing.id) }"
                  :aria-label="isFavorite(selectedListing.id) ? 'Odebrat z oblíbených' : 'Přidat do oblíbených'"
                  @click="toggleFavorite(selectedListing.id)"
                >
                  <i :class="['pi', isFavorite(selectedListing.id) ? 'pi-heart-fill' : 'pi-heart']"></i>
                </button>
              </div>
            </div>
            <div class="detail-hero-placeholder" aria-hidden="true"></div>
            <div class="detail-hero-dots">
              <span class="is-active"></span>
              <span></span>
              <span></span>
            </div>
          </div>

          <div class="detail-head">
            <div class="detail-pill-row">
              <span class="detail-pill">Elektronářadí</span>
            </div>
            <h1>{{ selectedListing.title }}</h1>
            <div class="detail-price-row">
              <strong>{{ selectedListing.priceValue }} Kč</strong>
              <span>/ den</span>
            </div>
          </div>

          <div class="detail-info-stack">
            <div class="detail-card">
              <div class="detail-card-head">
                <span>Dostupnost</span>
                <span class="detail-availability">
                  <span class="detail-availability-dot"></span>
                  Dnes k dispozici
                </span>
              </div>
              <div ref="detailDateRow" class="detail-date-row" @click="openDatePicker">
                <div class="detail-date-left">
                  <i class="pi pi-calendar"></i>
                  <div>
                    <strong>Vyberte datum</strong>
                    <small>Např. 12.–15. března</small>
                  </div>
                </div>
                <i class="pi pi-chevron-right"></i>
                <input
                  ref="datePickerInput"
                  v-model="requestDate"
                  type="date"
                  @input="handleDateInput"
                  aria-label="Vyberte datum"
                />
              </div>
            </div>

            <div class="detail-card">
              <div class="detail-owner-row">
                <div class="detail-owner-avatar">{{ selectedListing.owner.charAt(0) }}</div>
                <div>
                  <strong>{{ selectedListing.owner }}</strong>
                  <small>{{ selectedListing.ownerSince }}</small>
                </div>
                <div class="detail-owner-rating">
                  <i class="pi pi-star-fill"></i>
                  4.8
                  <span>(24)</span>
                </div>
                <button class="detail-owner-action" type="button" @click="openPublicProfile(selectedListing.owner)">
                  Profil
                </button>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <div class="detail-section-head">
              <strong>Popis vercajku</strong>
            </div>
            <p class="detail-description" :class="{ 'is-clamped': !descriptionExpanded }">
              {{ selectedListing.description }}
              <button
                v-if="selectedListing.description.length"
                class="detail-more"
                type="button"
                @click="descriptionExpanded = !descriptionExpanded"
              >
                {{ descriptionExpanded ? "Méně" : "Více" }}
              </button>
            </p>
          </div>

          <div class="detail-section detail-section-card">
            <div class="detail-section-head">
              <strong>Technické parametry</strong>
              <button
                class="detail-section-toggle"
                type="button"
                :aria-label="techSpecsOpen ? 'Sbalit technické parametry' : 'Rozbalit technické parametry'"
                @click="techSpecsOpen = !techSpecsOpen"
              >
                <i :class="['pi', techSpecsOpen ? 'pi-chevron-up' : 'pi-chevron-down']"></i>
              </button>
            </div>
            <div v-if="techSpecsOpen" class="detail-spec-list">
              <div>
                <span>Značka</span>
                <strong>Bosch</strong>
              </div>
              <div>
                <span>Výkon</span>
                <strong>50 Nm</strong>
              </div>
              <div>
                <span>Hmotnost</span>
                <strong>1.1 kg</strong>
              </div>
              <div>
                <span>Příslušenství</span>
                <strong>2x baterie, kufr</strong>
              </div>
            </div>
          </div>

          <div class="detail-section detail-section-card">
            <div class="detail-section-head">
              <strong>Podmínky pronájmu</strong>
              <button
                class="detail-section-toggle"
                type="button"
                :aria-label="rentalTermsOpen ? 'Sbalit podmínky pronájmu' : 'Rozbalit podmínky pronájmu'"
                @click="rentalTermsOpen = !rentalTermsOpen"
              >
                <i :class="['pi', rentalTermsOpen ? 'pi-chevron-up' : 'pi-chevron-down']"></i>
              </button>
            </div>
            <div v-if="rentalTermsOpen" class="detail-spec-list">
              <div>
                <span>Vratná kauce</span>
                <strong>2 000 Kč</strong>
              </div>
              <div>
                <span>Způsob předání</span>
                <strong>Osobně</strong>
              </div>
              <div>
                <span>Pravidla užívání</span>
                <button class="detail-link-row" type="button" @click="openRules" aria-label="Otevřít pravidla užívání">
                  <i class="pi pi-chevron-right"></i>
                </button>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <div class="detail-section-head detail-section-head-row">
              <strong>Lokalita</strong>
              <small>{{ selectedListing.location }} ({{ selectedListing.distance }})</small>
            </div>
            <div class="detail-map-placeholder">
              <span class="detail-map-pin"><i class="pi pi-map-marker"></i></span>
            </div>
          </div>

          <div class="detail-sticky-cta">
            <button class="detail-floating-cta" type="button" @click="handlePrimaryCTA">
              <span>{{ isAuthenticated ? "Půjčit si vercajk" : "Přihlásit a půjčit" }}</span>
              <i class="pi pi-arrow-right"></i>
            </button>
          </div>
        </div>

        <div v-else-if="screen === 'rules'" class="screen-inner rules-page">
          <div class="rules-hero">
            <button class="rules-back" type="button" aria-label="Zpět" @click="goBack">
              <i class="pi pi-arrow-left"></i>
            </button>
            <div class="rules-title">
              <strong>Pravidla užívání</strong>
            </div>
          </div>

          <div class="rules-section">
            <span class="rules-section-label">Předání a vrácení</span>
            <div class="rules-card-grid">
              <div class="rules-card">
                <small>Vyzvednutí</small>
                <strong>Po 14:00</strong>
              </div>
              <div class="rules-card">
                <small>Vrácení</small>
                <strong>Do 11:00</strong>
              </div>
            </div>
            <div class="rules-card rules-card-block">
              <small>Způsob předání</small>
              <div class="rules-chip-row">
                <span class="rules-chip is-active">Osobně</span>
                <span class="rules-chip">Garáž s kódem</span>
                <span class="rules-chip">Dovezu k vám</span>
              </div>
            </div>
          </div>

          <div class="rules-section">
            <span class="rules-section-label">Pravidla zacházení</span>
            <div class="rules-card rules-card-block">
              <strong>Stav věci</strong>
              <p>Vrátit v původním a čistém stavu</p>
            </div>
            <div class="rules-card rules-card-block">
              <strong>Omezení užívání</strong>
              <ul class="rules-list">
                <li>Zákaz úprav a modifikací</li>
                <li>Určeno jen k běžnému účelu</li>
                <li>Zákaz půjčení 3. osobě</li>
              </ul>
            </div>
          </div>

          <div class="rules-section">
            <span class="rules-section-label">Poškození a sankce</span>
            <div class="rules-card rules-card-block">
              <strong>Při porušení pravidel</strong>
              <div class="rules-row">
                <span>Ztráta nároku na zálohu</span>
                <strong>Ano</strong>
              </div>
              <div class="rules-row">
                <span>Smluvní sankce</span>
                <strong>Dle smlouvy</strong>
              </div>
            </div>
            <div class="rules-card rules-card-block">
              <strong>Pozdní vrácení</strong>
              <p>Poplatek 100 Kč za každou započatou hodinu prodlení</p>
            </div>
          </div>
        </div>

        <div v-else-if="screen === 'payment'" class="screen-inner payment-page">
          <div class="detail-hero">
            <div class="detail-hero-copy">
              <span class="eyebrow">Platba</span>
              <h1>Vyber způsob platby</h1>
              <p>Jen pro interní test flow. Vybereme, kudy půjde platba.</p>
            </div>
          </div>

          <div class="payment-grid">
            <button
              class="payment-card"
              :class="{ 'is-active': paymentMethod === 'bank' }"
              type="button"
              @click="paymentMethod = 'bank'"
            >
              <div class="payment-card-head">
                <strong>Platba převodem / QR</strong>
                <span>Rychlé potvrzení</span>
              </div>
              <div class="payment-card-body">
                <span class="payment-pill">QR kód</span>
                <span class="payment-pill">Bankovní převod</span>
              </div>
            </button>

            <button
              class="payment-card"
              :class="{ 'is-active': paymentMethod === 'card' }"
              type="button"
              @click="paymentMethod = 'card'"
            >
              <div class="payment-card-head">
                <strong>Platba kartou</strong>
                <span>Online karta</span>
              </div>
              <div class="payment-card-body">
                <span class="payment-pill">Visa / MC</span>
                <span class="payment-pill">Apple Pay</span>
              </div>
            </button>
          </div>

          <div class="profile-actions">
            <PvButton class="button-secondary" @click="goBack">Zpět</PvButton>
            <PvButton
              class="button-primary"
              :disabled="!paymentMethod"
              @click="paymentMethod === 'bank' ? openPaymentBank() : openRequest(selectedListing.id)"
            >
              Pokračovat
              <i class="pi pi-arrow-right"></i>
            </PvButton>
          </div>
        </div>

        <div v-else-if="screen === 'payment-bank'" class="screen-inner payment-page">
          <div class="reservation-header">
            <button class="reservation-back" type="button" aria-label="Zpět" @click="goBack">
              <i class="pi pi-arrow-left"></i>
            </button>
            <strong>Rezervace</strong>
          </div>

          <div class="reservation-card">
            <div class="reservation-thumb" aria-hidden="true"></div>
            <div>
              <strong>{{ selectedListing.title }}</strong>
              <span>{{ selectedListing.priceValue }} Kč / den</span>
            </div>
          </div>

          <div class="reservation-section">
            <strong>Vybrané datum</strong>
            <div class="calendar-summary" v-if="!showCalendar">
              <div class="calendar-summary-row">
                <span>{{ requestDate || "Nevybráno" }}</span>
                <button class="calendar-change" type="button" @click="showCalendar = true">Změnit</button>
              </div>
            </div>
            <div v-else class="calendar-shell">
              <div class="calendar-head">
                <span>{{ calendarInfo.label.toUpperCase() }}</span>
              </div>
              <div class="calendar-weekdays">
                <span>Po</span>
                <span>Út</span>
                <span>St</span>
                <span>Čt</span>
                <span>Pá</span>
                <span>So</span>
                <span>Ne</span>
              </div>
              <div class="calendar-grid">
                <button
                  v-for="(day, idx) in calendarInfo.cells"
                  :key="`day-${idx}`"
                  class="calendar-day"
                  :class="{ 'is-selected': day && selectedDay === day, 'is-empty': !day }"
                  type="button"
                  :disabled="!day"
                  @click="day && selectCalendarDay(day)"
                >
                  {{ day || "" }}
                </button>
              </div>
            </div>
          </div>

          <div class="reservation-summary">
            <div>
              <span>Cena za den</span>
              <strong>{{ priceSummary.daily }} Kč</strong>
            </div>
            <div>
              <span>Počet dní</span>
              <strong>{{ priceSummary.days }} dny</strong>
            </div>
            <div>
              <span>Servisní poplatek</span>
              <strong>{{ priceSummary.serviceFee }} Kč</strong>
            </div>
            <div>
              <span>Vratná kauce</span>
              <strong>{{ priceSummary.deposit }} Kč</strong>
            </div>
            <div class="reservation-total">
              <span>Celkem</span>
              <strong>{{ priceSummary.total }} Kč</strong>
            </div>
          </div>

          <label class="reservation-terms">
            <PvCheckbox v-model="agreeTerms" binary />
            <span>Souhlasím s pravidly užívání a obchodními podmínkami.</span>
          </label>

          <button class="reservation-submit" type="button" :disabled="!agreeTerms" @click="submitReservation">
            Odeslat žádost
          </button>
        </div>

        <div v-else-if="screen === 'confirmation'" class="screen-inner confirmation-page">
          <div class="confirmation-icon">
            <i class="pi pi-check"></i>
          </div>
          <h1>Žádost odeslána!</h1>
          <p>Majitel má nyní 24 hodin na potvrzení vaší žádosti. O výsledku vás budeme informovat v notifikacích.</p>
          <button class="confirmation-button" type="button" @click="setScreen('market')">
            Zpět na hlavní stránku
          </button>
        </div>

        <div v-else-if="screen === 'cancel-confirmation'" class="screen-inner confirmation-page">
          <div class="confirmation-icon is-cancel">
            <i class="pi pi-times"></i>
          </div>
          <h1>Žádost zrušena</h1>
          <p>Rezervace byla zrušena. Kdykoliv můžeš vytvořit novou žádost.</p>
          <button class="confirmation-button" type="button" @click="openProfileRequestsList">
            Zpět na moje poptávky
          </button>
        </div>

        <div v-else-if="screen === 'payment-confirmation'" class="screen-inner confirmation-page">
          <div class="confirmation-icon is-payment">
            <i class="pi pi-check"></i>
          </div>
          <h1>Platba odeslána</h1>
          <p>Majitel dostal informaci o úhradě a potvrdí ji co nejdříve.</p>
          <button class="confirmation-button" type="button" @click="openProfileRequestsList">
            Zpět na moje poptávky
          </button>
        </div>

        <div v-else-if="screen === 'public-profile'" class="screen-inner profile-page public-profile-page">
          <div class="profile-hero public-profile-hero">
            <div class="profile-avatar">{{ viewedPublicProfile.charAt(0).toUpperCase() }}</div>
            <div class="profile-hero-copy">
              <span class="profile-public-kicker">Veřejný profil</span>
              <strong>{{ viewedPublicProfile }}</strong>
              <div class="profile-rating">
                <i class="pi pi-star-fill"></i>
                {{ currentPublicProfile.rating }}
                <button class="profile-review-link" type="button" @click="scrollToPublicReviews">
                  · {{ currentPublicProfile.reviews }}
                </button>
              </div>
            </div>
          </div>

          <div class="profile-summary">
            <div class="profile-panel">
              <div class="profile-panel-head">
                <strong>O majiteli</strong>
              </div>
              <p class="public-profile-bio">
                {{ currentPublicProfile.bio }}
              </p>
              <div class="public-profile-metrics">
                <div>
                  <span>Lokace</span>
                  <strong>{{ currentPublicProfile.location }}</strong>
                </div>
                <div>
                  <span>Odpověď</span>
                  <strong>{{ currentPublicProfile.response }}</strong>
                </div>
              </div>
            </div>

            <div class="profile-panel">
              <div class="profile-panel-head">
                <strong>Veřejné položky</strong>
                <span class="profile-count">{{ currentPublicProfile.listings.length }}</span>
              </div>
              <div class="profile-panel-list">
                <button
                  v-for="listingId in currentPublicProfile.listings"
                  :key="`public-${listingId}`"
                  class="profile-item"
                  type="button"
                  @click="openListing(listingId)"
                >
                  <div class="profile-item-copy">
                    <span class="profile-item-title">
                      {{ listings.find((item) => item.id === listingId)?.title ?? "Nabídka" }}
                    </span>
                    <span class="profile-item-meta">
                      {{ listings.find((item) => item.id === listingId)?.priceValue ?? 0 }} Kč / den ·
                      {{ listings.find((item) => item.id === listingId)?.location ?? "Neuvedeno" }}
                    </span>
                  </div>
                  <span class="profile-item-status is-brown">Veřejné</span>
                </button>
                <div v-if="!currentPublicProfile.listings.length" class="profile-empty">
                  Tento profil zatím nemá veřejné nabídky.
                </div>
                <button
                  class="profile-panel-link profile-panel-link-inline"
                  type="button"
                  @click="openPublicProfileListPage('offers')"
                >
                  Zobrazit vše
                </button>
              </div>
            </div>
          </div>

          <div ref="publicReviewsSection" class="profile-section">
            <span class="profile-section-label">Recenze</span>
            <div class="profile-review-scroll">
              <article
                v-for="review in currentPublicProfile.feedback"
                :key="`${review.author}-${review.date}`"
                class="profile-review-card"
              >
                <div class="profile-review-head">
                  <div class="profile-review-author">
                    <div class="profile-review-avatar">{{ review.avatar }}</div>
                    <div class="profile-review-author-copy">
                      <strong>{{ review.author }}</strong>
                      <span>{{ review.role }}</span>
                    </div>
                  </div>
                  <span class="profile-review-date">{{ review.date }}</span>
                </div>
                <div class="profile-review-stars" :aria-label="`Hodnocení ${review.stars} z 5`">
                  <i v-for="star in 5" :key="star" :class="['pi', star <= review.stars ? 'pi-star-fill' : 'pi-star']"></i>
                </div>
                <p>{{ review.text }}</p>
              </article>
            </div>
          </div>
        </div>

        <div v-else-if="screen === 'public-profile-list'" class="screen-inner profile-page profile-list-page public-profile-list-page">
          <div class="profile-list-tabs">
            <button
              class="profile-list-tab"
              :class="{ 'is-active': publicProfileListTab === 'offers' }"
              type="button"
              @click="publicProfileListTab = 'offers'"
            >
              Nabídky
            </button>
            <button
              class="profile-list-tab"
              :class="{ 'is-active': publicProfileListTab === 'requests' }"
              type="button"
              @click="publicProfileListTab = 'requests'"
            >
              Poptávky
            </button>
          </div>
          <div class="profile-list-body">
            <div v-if="publicProfileListTab === 'offers'" class="profile-panel-list">
              <button
                v-for="listingId in currentPublicProfile.listings"
                :key="`public-page-offer-${listingId}`"
                class="profile-item"
                type="button"
                @click="openListing(listingId)"
              >
                <div class="profile-item-copy">
                  <span class="profile-item-title">
                    {{ listings.find((item) => item.id === listingId)?.title ?? "Nabídka" }}
                  </span>
                  <span class="profile-item-meta">
                    {{ listings.find((item) => item.id === listingId)?.priceValue ?? 0 }} Kč / den ·
                    {{ listings.find((item) => item.id === listingId)?.location ?? "Neuvedeno" }}
                  </span>
                </div>
                <span class="profile-item-status is-brown">Veřejné</span>
              </button>
              <div v-if="!currentPublicProfile.listings.length" class="profile-empty">
                Tento profil zatím nemá veřejné nabídky.
              </div>
            </div>
            <div v-else class="profile-panel-list">
              <button
                v-for="listingId in currentPublicProfile.requests"
                :key="`public-page-request-${listingId}`"
                class="profile-item"
                type="button"
                @click="openListing(listingId)"
              >
                <div class="profile-item-copy">
                  <span class="profile-item-title">
                    {{ listings.find((item) => item.id === listingId)?.title ?? "Poptávka" }}
                  </span>
                  <span class="profile-item-meta">
                    {{ listings.find((item) => item.id === listingId)?.priceValue ?? 0 }} Kč / den ·
                    {{ listings.find((item) => item.id === listingId)?.location ?? "Neuvedeno" }}
                  </span>
                </div>
                <span class="profile-item-status is-muted">Poptávka</span>
              </button>
              <div v-if="!currentPublicProfile.requests.length" class="profile-empty">
                Tento profil zatím nemá veřejné poptávky.
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="screen === 'pending-request'" class="screen-inner pending-request-page">
          <div class="pending-request-header">
            <button class="pending-request-back" type="button" aria-label="Zpět" @click="goBack">
              <i class="pi pi-arrow-left"></i>
            </button>
            <strong>Rezervace</strong>
          </div>

          <div
            class="pending-request-status"
            :class="{
              'is-waiting': pendingRequest.statusLabel === 'Čeká na schválení',
              'is-approved': pendingRequest.statusLabel === 'Schváleno - čeká na platbu',
              'is-payment-waiting':
                pendingRequest.statusLabel === 'Platba odeslána – čeká na potvrzení',
              'is-payment-confirmed':
                pendingRequest.statusLabel === 'Platba potvrzena - od majitele',
              'is-pickup-waiting': pendingRequest.statusLabel === 'Vyzvednutí – čeká na potvrzení',
              'is-pickup-done': pendingRequest.statusLabel === 'Vyzvednutí potvrzeno',
              'is-return-waiting': pendingRequest.statusLabel === 'Vrácení – čeká na potvrzení',
              'is-return-done': pendingRequest.statusLabel === 'Vrácení potvrzeno',
              'is-rejected': pendingRequest.statusLabel === 'Zamítnuto',
              'is-canceled': pendingRequest.statusLabel === 'Zrušeno',
            }"
          >
            <select v-model="pendingRequest.statusLabel" class="pending-request-select">
              <option v-for="option in pendingStatusOptions" :key="option" :value="option">
                {{ option }}
              </option>
            </select>
          </div>

          <div class="pending-request-card">
            <div class="pending-request-thumb" aria-hidden="true"></div>
            <div class="pending-request-card-copy">
              <strong>{{ pendingListing.title }}</strong>
              <span>{{ pendingListing.priceValue }} Kč / den</span>
            </div>
          </div>

          <div class="pending-request-info">
            <div>
              <span>Termín</span>
              <strong>{{ pendingRequest.dateRange }}</strong>
            </div>
            <div>
              <span>Počet dní</span>
              <strong>{{ pendingRequest.days }} dny</strong>
            </div>
          </div>

          <div class="pending-request-summary">
            <div>
              <span>Cena za zapůjčení</span>
              <strong>{{ pendingSummary.rental }} Kč</strong>
            </div>
            <div>
              <span>Servisní poplatek</span>
              <strong>{{ pendingRequest.serviceFee }} Kč</strong>
            </div>
            <div>
              <span>Vratná kauce</span>
              <strong>{{ pendingRequest.deposit }} Kč</strong>
            </div>
            <div class="pending-request-total">
              <span>Celkem</span>
              <strong>{{ pendingSummary.total }} Kč</strong>
            </div>
          </div>

          <div
            v-if="pendingRequest.statusLabel === 'Schváleno - čeká na platbu'"
            class="pending-payment-card"
          >
            <strong>Platební údaje</strong>
            <div class="pending-payment-row">
              <span>Číslo účtu</span>
              <div class="pending-payment-value">
                <strong>{{ pendingRequest.accountNumber }}</strong>
                <button type="button" class="pending-payment-copy">Kopírovat</button>
              </div>
            </div>
            <div class="pending-payment-row">
              <span>Částka k úhradě</span>
              <div class="pending-payment-value">
                <strong>{{ pendingSummary.total }} Kč</strong>
              </div>
            </div>
            <div class="pending-payment-row">
              <span>Poznámka pro příjemce</span>
              <div class="pending-payment-value">
                <strong>{{ pendingRequest.paymentNote }}</strong>
                <button type="button" class="pending-payment-copy">Kopírovat</button>
              </div>
            </div>
            <div class="pending-payment-hint">
              Po odeslání platby potvrďte akci tlačítkem níže. Majitel bude o platbě informován.
            </div>
          </div>

          <div
            v-if="pendingRequest.statusLabel === 'Platba odeslána – čeká na potvrzení'"
            class="pending-payment-wait"
          >
            Majitel má 24 hodin na potvrzení platby. O výsledku budete informováni v notifikacích.
          </div>

          <div class="pending-request-owner">
            <div class="pending-owner-avatar">{{ pendingRequest.ownerName.charAt(0) }}</div>
            <div>
              <strong>{{ pendingRequest.ownerName }}</strong>
              <span>Majitel</span>
            </div>
            <div class="pending-owner-actions">
              <button
                type="button"
                aria-label="Telefon"
                :disabled="pendingRequestActionsDisabled"
                :class="{ 'is-disabled': pendingRequestActionsDisabled }"
              >
                <i class="pi pi-phone"></i>
              </button>
              <button
                type="button"
                aria-label="WhatsApp"
                :disabled="pendingRequestActionsDisabled"
                :class="{ 'is-disabled': pendingRequestActionsDisabled }"
              >
                <i class="pi pi-whatsapp"></i>
              </button>
              <button
                type="button"
                aria-label="Zpráva"
                :disabled="pendingRequestActionsDisabled"
                :class="{ 'is-disabled': pendingRequestActionsDisabled }"
              >
                <i class="pi pi-send"></i>
              </button>
            </div>
          </div>

          <div class="pending-request-delivery">
            <strong>Způsob předání</strong>
            <p>{{ pendingRequest.pickupNote }}</p>
          </div>

          <div
            v-if="
              pendingRequest.statusLabel === 'Platba potvrzena - od majitele' ||
              pendingRequest.statusLabel === 'Vyzvednutí – čeká na potvrzení' ||
              pendingRequest.statusLabel === 'Vyzvednutí potvrzeno'
            "
            class="pending-handover-card"
          >
            <strong>Vyzvednutí</strong>
            <div class="pending-handover-actions">
              <button type="button" class="pending-handover-primary" @click="confirmPickupOpen = true">
                Potvrdit převzetí
              </button>
            </div>
            <button type="button" class="pending-handover-link">Nahlásit problém</button>
          </div>
          <div v-if="confirmPickupOpen" class="confirm-modal">
            <button
              class="confirm-modal-backdrop"
              type="button"
              @click="closeConfirmPickupModal"
              aria-label="Zavřít potvrzení"
            ></button>
            <div class="confirm-modal-card">
              <p class="confirm-modal-title">Potvrdit převzetí vercajku?</p>
              <p class="confirm-modal-copy">
                Opravdu jste si zařízení převzali? Tímto se potvrdí zahájení nájmu.
              </p>
              <div class="confirm-modal-actions">
                <button type="button" class="confirm-modal-primary" @click="confirmPickup">
                  Ano, převzato
                </button>
                <button type="button" class="confirm-modal-ghost" @click="closeConfirmPickupModal">
                  Zpět
                </button>
              </div>
            </div>
          </div>

          <div
            v-if="
              pendingRequest.statusLabel === 'Vrácení – čeká na potvrzení' ||
              pendingRequest.statusLabel === 'Vrácení potvrzeno'
            "
            class="pending-return-card"
          >
            <strong>Vrácení</strong>
            <div class="pending-handover-actions">
              <button type="button" class="pending-handover-primary" @click="confirmReturnOpen = true">
                Potvrdit vrácení
              </button>
            </div>
            <button type="button" class="pending-handover-link">Nahlásit problém</button>
          </div>
          <div v-if="confirmReturnOpen" class="confirm-modal">
            <button
              class="confirm-modal-backdrop"
              type="button"
              @click="closeConfirmReturnModal"
              aria-label="Zavřít potvrzení"
            ></button>
            <div class="confirm-modal-card">
              <p class="confirm-modal-title">Potvrdit vrácení vercajku?</p>
              <p class="confirm-modal-copy">
                Opravdu jste zařízení vrátili? Tímto se uzavře pronájem.
              </p>
              <div class="confirm-modal-actions">
                <button type="button" class="confirm-modal-primary" @click="confirmReturn">
                  Ano, vráceno
                </button>
                <button type="button" class="confirm-modal-ghost" @click="closeConfirmReturnModal">
                  Zpět
                </button>
              </div>
            </div>
          </div>

          <button
            v-if="pendingRequest.statusLabel === 'Schváleno - čeká na platbu'"
            class="pending-payment-submit"
            type="button"
            @click="confirmPaymentOpen = true"
          >
            Potvrdit odeslání platby
          </button>
          <div v-if="confirmPaymentOpen" class="confirm-modal">
            <button
              class="confirm-modal-backdrop"
              type="button"
              @click="closeConfirmPaymentModal"
              aria-label="Zavřít potvrzení"
            ></button>
            <div class="confirm-modal-card">
              <p class="confirm-modal-title">Potvrdit odeslání platby?</p>
              <p class="confirm-modal-copy">
                Opravdu jste platbu odeslali? Po potvrzení informujeme majitele o úhradě.
              </p>
              <div class="confirm-modal-actions">
                <button type="button" class="confirm-modal-primary" @click="confirmPendingPayment">
                  Ano, platba odeslána
                </button>
                <button type="button" class="confirm-modal-ghost" @click="closeConfirmPaymentModal">
                  Zpět
                </button>
              </div>
            </div>
          </div>
          <button
            class="pending-request-cancel"
            type="button"
            @click="cancelPendingRequestOpen = true"
          >
            Zrušit žádost
          </button>
          <div v-if="cancelPendingRequestOpen" class="confirm-modal">
            <button
              class="confirm-modal-backdrop"
              type="button"
              @click="closePendingCancelModal"
              aria-label="Zavřít potvrzení"
            ></button>
            <div class="confirm-modal-card">
              <p class="confirm-modal-title">Opravdu chceš zrušit rezervaci?</p>
              <p class="confirm-modal-copy">
                Po zrušení žádosti bude rezervace ukončena a věc se uvolní dalším zájemcům.
              </p>
              <div class="confirm-modal-actions">
                <button type="button" class="confirm-modal-primary" @click="closePendingCancelModal">
                  Nechat rezervaci
                </button>
                <button type="button" class="confirm-modal-ghost" @click="confirmCancelPendingRequest">
                  Zrušit žádost
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="screen === 'profile-list'" class="screen-inner profile-page profile-list-page">
          <div class="profile-list-tabs">
            <button
              class="profile-list-tab"
              :class="{ 'is-active': profileListTab === 'offers' }"
              type="button"
              @click="profileListTab = 'offers'"
            >
              Nabídky
            </button>
            <button
              class="profile-list-tab"
              :class="{ 'is-active': profileListTab === 'requests' }"
              type="button"
              @click="profileListTab = 'requests'"
            >
              Poptávky
            </button>
          </div>

          <div class="profile-list-body">
            <div v-if="profileListTab === 'offers'" class="profile-panel-list">
              <button
                v-for="offer in profileOffers"
                :key="`page-offer-${offer.id}`"
                class="profile-item"
                type="button"
                @click="openListing(offer.id)"
              >
                <div class="profile-item-copy">
                  <span class="profile-item-title">{{ offer.title }}</span>
                  <span class="profile-item-meta">{{ offer.priceValue }} Kč / den · {{ offer.location }}</span>
                </div>
                <span class="profile-item-status" :class="offer.statusTone">{{ offer.statusLabel }}</span>
              </button>
              <div v-if="!profileOffers.length" class="profile-empty">Zatím nic nenabízíš.</div>
            </div>
            <div v-else class="profile-panel-list">
              <button
                v-for="request in profileRequests"
                :key="`page-request-${request.id}`"
                class="profile-item"
                type="button"
                @click="isRequestReservationStatus(request.statusLabel) ? openPendingRequest(request) : openListing(request.id)"
              >
                <div class="profile-item-copy">
                  <span class="profile-item-title">{{ request.title }}</span>
                  <span class="profile-item-meta">{{ request.priceValue }} Kč / den · {{ request.location }}</span>
                </div>
                <span class="profile-item-status" :class="request.statusTone">{{ request.statusLabel }}</span>
              </button>
              <div v-if="!profileRequests.length" class="profile-empty">Zatím nic nepoptáváš.</div>
            </div>
          </div>
        </div>

        <div v-else-if="screen === 'request'" class="screen-inner">
          <PvCard class="request-card">
            <span class="eyebrow">Žádost o půjčení</span>
            <h1>{{ selectedListing.title }}</h1>
            <p>{{ selectedListing.location }} · {{ selectedListing.price }}</p>

            <div class="request-steps">
              <button class="request-step" :class="{ 'is-active': requestStep === 1 }" type="button">
                <span>1</span>
                Termín
              </button>
              <button class="request-step" :class="{ 'is-active': requestStep === 2 }" type="button">
                <span>2</span>
                Poznámka
              </button>
              <button class="request-step" :class="{ 'is-active': requestStep === 3 }" type="button">
                <span>3</span>
                Kontrola
              </button>
            </div>

            <div v-if="requestStep === 1" class="request-grid">
              <label class="field" :class="{ 'is-error': requestDateError }">
                <span>Datum</span>
                <input v-model="requestDate" class="native-input" type="date" @input="handleDateInput" />
              </label>
              <label class="field">
                <span>Počet dní</span>
                <input v-model="requestDuration" class="native-input" type="number" min="1" />
              </label>
            </div>

            <div v-else-if="requestStep === 2" class="request-grid">
              <label class="field field-full">
                <span>Poznámka</span>
                <textarea v-model="requestNote" class="native-input native-textarea" rows="5"></textarea>
              </label>
            </div>

            <div v-else class="request-summary">
              <div>
                <span>Termín</span>
                <strong>{{ requestDate }}</strong>
              </div>
              <div>
                <span>Délka</span>
                <strong>{{ requestDuration }} dní</strong>
              </div>
              <div>
                <span>Poznámka</span>
                <strong>{{ requestNote || "Bez poznámky" }}</strong>
              </div>
            </div>

            <div class="request-actions">
              <PvButton v-if="requestStep > 1" class="button-secondary" @click="prevRequestStep">
                Zpět
              </PvButton>
              <PvButton v-if="requestStep < 3" class="button-primary" @click="nextRequestStep">
                Pokračovat
                <i class="pi pi-arrow-right"></i>
              </PvButton>
              <PvButton v-else class="button-primary" @click="completeRequest">
                Odeslat žádost
                <i class="pi pi-send"></i>
              </PvButton>
            </div>
          </PvCard>
        </div>

        <div v-else-if="screen === 'status'" class="screen-inner">
          <PvCard class="status-card">
            <span class="eyebrow">Stav žádosti</span>
            <h1>{{ requestStatus }}</h1>
            <p>Předání, schválení i timeline se budou dál rozšiřovat v dalších obrazovkách.</p>
            <div class="status-actions">
              <PvButton class="button-primary" @click="approveRequest">
                Přepnout stav
              </PvButton>
              <PvButton class="button-secondary" @click="openProfile">
                Otevřít profil
              </PvButton>
            </div>
          </PvCard>
        </div>

        <div v-else class="screen-inner profile-page">
          <div class="profile-hero">
            <div class="profile-avatar">{{ user.name.charAt(0).toUpperCase() }}</div>
            <div class="profile-hero-copy">
              <strong>{{ user.name }}</strong>
              <div class="profile-rating">
                <i class="pi pi-star-fill"></i>
                4.8
              </div>
              <button class="profile-public-button" type="button" @click="openPublicProfile(user.name)">
                Zobrazit veřejný profil
              </button>
            </div>
          </div>

          <div class="profile-summary">
            <div class="profile-panel">
              <div class="profile-panel-head">
                <strong>Moje nabídky</strong>
                <span class="profile-count">{{ profileOffers.length }}</span>
              </div>
              <div class="profile-panel-list">
                <button
                  v-for="offer in profileOffers"
                  :key="offer.id"
                  class="profile-item"
                  type="button"
                  @click="openListing(offer.id)"
                >
                  <div class="profile-item-copy">
                    <span class="profile-item-title">{{ offer.title }}</span>
                    <span class="profile-item-meta">{{ offer.priceValue }} Kč / den · {{ offer.location }}</span>
                  </div>
                  <span class="profile-item-status" :class="offer.statusTone">{{ offer.statusLabel }}</span>
                </button>
                <button
                  class="profile-panel-link profile-panel-link-inline"
                  type="button"
                  @click="openProfileListPage('offers')"
                >
                  Zobrazit vše
                </button>
                <div v-if="!profileOffers.length" class="profile-empty">Zatím nic nenabízíš.</div>
              </div>
            </div>

            <div class="profile-panel">
              <div class="profile-panel-head">
                <strong>Moje poptávky</strong>
                <span class="profile-count">{{ profileRequests.length }}</span>
              </div>
              <div class="profile-panel-list">
                <button
                v-for="request in profileRequests"
                :key="request.id"
                class="profile-item"
                type="button"
                @click="isRequestReservationStatus(request.statusLabel) ? openPendingRequest(request) : openListing(request.id)"
              >
                  <div class="profile-item-copy">
                    <span class="profile-item-title">{{ request.title }}</span>
                    <span class="profile-item-meta">{{ request.priceValue }} Kč / den · {{ request.location }}</span>
                  </div>
                  <span class="profile-item-status" :class="request.statusTone">{{ request.statusLabel }}</span>
                </button>
                <button
                  class="profile-panel-link profile-panel-link-inline"
                  type="button"
                  @click="openProfileListPage('requests')"
                >
                  Zobrazit vše
                </button>
                <div v-if="!profileRequests.length" class="profile-empty">Zatím nic nepoptáváš.</div>
              </div>
            </div>
          </div>

          <div class="profile-section">
            <span class="profile-section-label">Správa profilu</span>
            <div class="profile-list">
              <button class="profile-list-item" type="button">
                <i class="pi pi-user"></i>
                <span>Osobní údaje</span>
                <i class="pi pi-chevron-right"></i>
              </button>
              <button class="profile-list-item" type="button">
                <i class="pi pi-tag"></i>
                <span>Moje nabídky</span>
                <i class="pi pi-chevron-right"></i>
              </button>
              <button class="profile-list-item" type="button">
                <i class="pi pi-inbox"></i>
                <span>Moje poptávky</span>
                <i class="pi pi-chevron-right"></i>
              </button>
              <button class="profile-list-item" type="button">
                <i class="pi pi-clock"></i>
                <span>Historie</span>
                <i class="pi pi-chevron-right"></i>
              </button>
              <button class="profile-list-item" type="button">
                <i class="pi pi-credit-card"></i>
                <span>Platební metody</span>
                <i class="pi pi-chevron-right"></i>
              </button>
            </div>
          </div>

          <div class="profile-section">
            <span class="profile-section-label">Nastavení</span>
            <div class="profile-list">
              <button class="profile-list-item" type="button">
                <i class="pi pi-bell"></i>
                <span>Oznámení</span>
                <i class="pi pi-chevron-right"></i>
              </button>
              <button class="profile-list-item" type="button">
                <i class="pi pi-shield"></i>
                <span>Zabezpečení</span>
                <i class="pi pi-chevron-right"></i>
              </button>
              <button class="profile-list-item" type="button">
                <i class="pi pi-globe"></i>
                <span>Jazyk</span>
                <i class="pi pi-chevron-right"></i>
              </button>
              <button class="profile-list-item" type="button">
                <i class="pi pi-question-circle"></i>
                <span>Nápověda</span>
                <i class="pi pi-chevron-right"></i>
              </button>
            </div>
          </div>

          <div class="profile-actions">
            <PvButton class="button-secondary" @click="logout">Odhlásit se</PvButton>
          </div>
        </div>
      </section>
    </main>

    <footer class="bottom-nav" aria-label="Spodní navigace">
      <button class="bottom-nav-item" :class="{ 'is-active': screen === 'market' }" type="button" @click="setScreen('market')">
        <i class="pi pi-home"></i>
        <span>Domů</span>
      </button>
      <button class="bottom-nav-item" :class="{ 'is-active': screen === 'favorites' }" type="button" @click="openFavorites">
        <i class="pi pi-heart"></i>
        <span>Oblíbené</span>
      </button>
      <button class="bottom-nav-item bottom-nav-center" type="button" @click="openRequest(selectedListing.id)">
        <i class="pi pi-plus"></i>
      </button>
      <button class="bottom-nav-item" :class="{ 'is-active': screen === 'status' }" type="button" @click="openStatus">
        <i class="pi pi-comment"></i>
        <span>Chat</span>
      </button>
      <button
        class="bottom-nav-item"
        :class="{ 'is-active': screen === 'profile' || screen === 'auth' }"
        type="button"
        @click="openProfile"
      >
        <span v-if="notificationCount > 0" class="bottom-nav-badge">{{ notificationCount }}</span>
        <i class="pi pi-user"></i>
        <span>Profil</span>
      </button>
    </footer>
  </div>
</template>
