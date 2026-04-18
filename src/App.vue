<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { categories, listings, type Listing } from "@/data/mockData";

type Screen =
  | "auth"
  | "market"
  | "favorites"
  | "detail"
  | "add-listing"
  | "add-listing-confirmation"
  | "public-profile"
  | "profile-personal"
  | "profile-payments"
  | "profile-security"
  | "profile-language"
  | "help"
  | "help-detail"
  | "help-contact"
  | "profile-list"
  | "public-profile-list"
  | "rules"
  | "payment"
  | "payment-bank"
  | "payment-card"
  | "confirmation"
  | "cancel-confirmation"
  | "payment-confirmation"
  | "return-confirmation"
  | "rating-confirmation"
  | "pending-request"
  | "request"
  | "status"
  | "profile";
type AuthMode = "login" | "register";

const AUTH_KEY = "vercajkovna-authenticated";
const USER_KEY = "vercajkovna-user";
const PERSONAL_KEY = "vercajkovna-personal";
const SCREEN_KEY = "vercajkovna-screen";
const REMEMBER_KEY = "vercajkovna-remember";
const FAVORITES_KEY = "vercajkovna-favorites";

function readStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY) ?? sessionStorage.getItem(USER_KEY);
    return raw
      ? (JSON.parse(raw) as {
          name?: string;
          email?: string;
          phone?: string;
          location?: string;
          firstName?: string;
          lastName?: string;
          address?: string;
          emailVerified?: boolean;
          phoneVerified?: boolean;
          photo?: string;
        })
      : null;
  } catch {
    return null;
  }
}

function readStoredPersonal() {
  try {
    const raw = localStorage.getItem(PERSONAL_KEY) ?? sessionStorage.getItem(PERSONAL_KEY);
    return raw
      ? (JSON.parse(raw) as {
          phone?: string;
          location?: string;
          firstName?: string;
          lastName?: string;
          address?: string;
          email?: string;
          emailVerified?: boolean;
          phoneVerified?: boolean;
          photo?: string;
        })
      : null;
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
const rememberedPersonal = readStoredPersonal();
const MOCK_PROFILE = {
  firstName: "Tomáš",
  lastName: "Novák",
  email: "tomas@vercajkovna.cz",
  phone: "+420 777 123 456",
  address: "Dlouhá 123, Praha 1",
};
const rememberedNameParts = (rememberedUser?.name ?? "Demo uživatel").trim().split(/\s+/);
const rememberedFirstName =
  rememberedUser?.firstName ??
  rememberedPersonal?.firstName ??
  rememberedNameParts[0] ??
  MOCK_PROFILE.firstName;
const rememberedLastName =
  rememberedUser?.lastName ??
  rememberedPersonal?.lastName ??
  rememberedNameParts.slice(1).join(" ") ??
  MOCK_PROFILE.lastName;

const user = reactive({
  name: rememberedUser?.name ?? "Demo uživatel",
  email: rememberedUser?.email ?? "demo@vercajkovna.cz",
});

const personal = reactive({
  firstName: rememberedFirstName,
  lastName: rememberedLastName || MOCK_PROFILE.lastName,
  email: rememberedUser?.email ?? rememberedPersonal?.email ?? user.email ?? MOCK_PROFILE.email,
  phone: rememberedUser?.phone ?? rememberedPersonal?.phone ?? MOCK_PROFILE.phone,
  address: rememberedUser?.address ?? rememberedPersonal?.address ?? MOCK_PROFILE.address,
  emailVerified: rememberedUser?.emailVerified ?? rememberedPersonal?.emailVerified ?? true,
  phoneVerified: rememberedUser?.phoneVerified ?? rememberedPersonal?.phoneVerified ?? false,
  photo: rememberedUser?.photo ?? rememberedPersonal?.photo ?? MOCK_PROFILE.firstName.charAt(0),
  saved: false,
});
const personalEditOpen = ref(false);
const personalEditField = ref<"firstName" | "lastName" | "email" | "phone" | "address" | null>(null);
const personalEditValue = ref("");
const personalPhotoOpen = ref(false);

const helpQuery = ref("");
const helpSelectedId = ref<string | null>(null);
const helpFeedback = ref<"yes" | "no" | null>(null);

const helpFaq = [
  {
    id: "how-it-works",
    title: "Jak funguje půjčování?",
    body: [
      "Půjčování na naší platformě je navrženo tak, aby bylo co nejjednodušší a nejbezpečnější pro obě strany.",
      "Celý proces začíná vyhledáním věci, kterou právě potřebujete. Jakmile najdete vhodný předmět, zvolíte si termín a odešlete žádost majiteli.",
      "Majitel má 24 hodin na to, aby vaši žádost schválil nebo zamítl. Po schválení provedete platbu dle instrukcí a domluvíte si předání.",
      "Po skončení výpůjčky věc vrátíte majiteli ve stejném stavu a oba můžete přidat vzájemné hodnocení.",
    ],
  },
  {
    id: "payments",
    title: "Platební metody",
    body: [
      "Platbu lze uhradit převodem/QR nebo kartou (dle dostupnosti v budoucí verzi).",
      "U převodu vždy uvidíte číslo účtu, částku a poznámku pro příjemce. Po odeslání platby potvrdíte akci v aplikaci.",
      "Majitel poté platbu potvrdí. Pokud platba není potvrzená do 24 hodin, zobrazí se upozornění a můžete kontaktovat podporu.",
    ],
  },
  {
    id: "security",
    title: "Bezpečnost",
    body: [
      "Doporučujeme komunikovat a domlouvat předání přímo v aplikaci.",
      "Při předání si věc prohlédněte a potvrďte převzetí až v momentě, kdy je vše v pořádku.",
      "Kdykoliv můžete nahlásit problém a podpora vám pomůže situaci dořešit.",
    ],
  },
];

const filteredHelpFaq = computed(() => {
  const q = helpQuery.value.trim().toLowerCase();
  if (!q) return helpFaq;
  return helpFaq.filter((item) => item.title.toLowerCase().includes(q));
});

const selectedHelpFaq = computed(
  () => helpFaq.find((item) => item.id === helpSelectedId.value) ?? null,
);

const personalEditMeta = computed(() => {
  const field = personalEditField.value;
  if (field === "firstName") return { label: "Jméno", type: "text", placeholder: "Např. Tomáš" };
  if (field === "lastName") return { label: "Příjmení", type: "text", placeholder: "Např. Novák" };
  if (field === "email") return { label: "E-mail", type: "email", placeholder: "tomas@email.cz" };
  if (field === "phone") return { label: "Telefon", type: "tel", placeholder: "+420 777 123 456" };
  if (field === "address") return { label: "Adresa", type: "text", placeholder: "Dlouhá 123, Praha 1" };
  return { label: "Údaj", type: "text", placeholder: "" };
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
];
const demoProfileMatrix: Record<string, { offers: string[]; requests: string[] }> = {
  "tomas@vercajkovna.cz": {
    offers: ["festool-ts55", "karcher-wash", "makita-drill", "bosch-drill", "hilti-breaker"],
    requests: ["festool-ts55", "karcher-wash", "laser-level", "bosch-drill", "hilti-breaker"],
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
const searchExpanded = ref(false);
const filters = reactive({
  location: "",
  minPrice: 0,
  maxPrice: 1000,
  maxDistance: 15,
  deposit: "all" as "all" | "yes" | "no",
  minRating: 0,
  date: "",
  sortBy: "newest" as "newest" | "price_asc" | "price_desc" | "rating",
});
const selectedListingId = ref(listings[0].id);
const favoriteListingIds = ref<string[]>(readStoredFavorites());
const requestDate = ref("2026-03-29");
const requestDuration = ref("7");
const requestNote = ref("Potřebuji ji na víkendový projekt.");
const requestStatus = ref("Čeká na schválení");
const requestStep = ref<1 | 2 | 3>(1);

type AddListingPhoto = { file: File; url: string };
type AddListingDraft = {
  photoSlots: Array<AddListingPhoto | null>;
  title: string;
  categoryId: string;
  pricePerDay: number;
  depositEnabled: boolean;
  depositAmount: number;
  availabilityDays: string[];
  locationMode: "profile" | "custom";
  customAddress: {
    street: string;
    city: string;
    zip: string;
  };
  brand: string;
  model: string;
  power: string;
  weight: string;
  accessories: string;
  condition: "new" | "like_new" | "used_good" | "used_ok" | "worn" | "damaged";
  additionalParams: string;
  pickupMethods: {
    mode: "personal" | "other";
    otherPickupDescription: string;
  };
  rules: {
    noModifications: boolean;
    purposeOnly: boolean;
    noThirdParty: boolean;
    depositForfeit: boolean;
    other: boolean;
    otherDescription: string;
  };
};

const addListingStep = ref<1 | 2 | 3>(1);
const addListingProceedAttempt = ref(false);
const availabilityMonth = reactive({ year: new Date().getFullYear(), month: new Date().getMonth() }); // 0-indexed
const availabilityRangeStart = ref<string | null>(null);
const addListingPhotoInput = ref<HTMLInputElement | null>(null);
const pendingPhotoSlotIndex = ref(0);
const draggingPhotoIndex = ref<number | null>(null);
const dragOverPhotoIndex = ref<number | null>(null);
const conditionOptions = [
  { id: "new", label: "Nové", note: "Bez známek použití" },
  { id: "like_new", label: "Jako nové", note: "Použité minimálně" },
  { id: "used_good", label: "Velmi dobrý", note: "Běžné použití" },
  { id: "used_ok", label: "Dobrý", note: "Viditelné známky" },
  { id: "worn", label: "Opotřebené", note: "Funguje, ale je znát" },
  { id: "damaged", label: "Poškozené", note: "Jen se slevou / popisem" },
] as const satisfies ReadonlyArray<{
  id: AddListingDraft["condition"];
  label: string;
  note: string;
}>;
const addListingDraft = reactive<AddListingDraft>({
  photoSlots: Array.from({ length: 4 }, () => null),
  title: "",
  categoryId: categories.find((item) => item.id !== "all")?.id ?? "stavba",
  pricePerDay: 0,
  depositEnabled: false,
  depositAmount: 0,
  availabilityDays: [],
  locationMode: "profile",
  customAddress: { street: "", city: "", zip: "" },
  brand: "",
  model: "",
  power: "",
  weight: "",
  accessories: "",
  condition: "new",
  additionalParams: "",
  pickupMethods: { mode: "personal", otherPickupDescription: "" },
  rules: { noModifications: false, purposeOnly: false, noThirdParty: false, depositForfeit: false, other: false, otherDescription: "" },
  });const publishedListingId = ref<string | null>(null);
const paymentMethod = ref<"bank" | "card" | null>(null);
const cardForm = reactive({
  subMethod: "card" as "card" | "apple" | "google",
  savedCards: [
    { id: "c1", brand: "Visa", last4: "4242", expiry: "12/26", isDefault: true },
    { id: "c2", brand: "Mastercard", last4: "8888", expiry: "09/25", isDefault: false },
  ],
  selectedCardId: "c1",
  isSelectorOpen: false,
  isProcessing: false,
  number: "",
  expiry: "",
  cvc: "",
  name: "",
});

function openPaymentCard() {
  cardForm.isProcessing = false;
  setScreen("payment-card");
}

function fillTestData() {
  cardForm.number = "4242 4242 4242 4242";
  cardForm.expiry = "12/26";
  cardForm.cvc = "123";
  cardForm.name = "TOMÁŠ TESTER";
}

function submitCardPayment() {
  cardForm.isProcessing = true;
  // Simulace zpracování platby
  setTimeout(() => {
    cardForm.isProcessing = false;
    pendingRequest.statusLabel = "Platba potvrzena - od majitele";
    setScreen("payment-confirmation");
  }, 2000);
}

const agreeTerms = ref(false);
const showCalendar = ref(false);
const cancelPendingRequestOpen = ref(false);
const confirmPaymentOpen = ref(false);
const confirmApprovalOpen = ref(false);
const confirmRejectOpen = ref(false);
const rejectReason = ref("");
const confirmPickupOpen = ref(false);
const confirmReturnOpen = ref(false);
const ratingSubmitted = ref(false);
const requestStatusFilter = ref<"active" | "inactive">("active");
const offerStatusFilter = ref<"active" | "inactive">("active");
const problemReportOpen = ref(false);
const problemReportType = ref("Nepředáno");
const problemReportNote = ref("");
const problemReported = ref(false);
const pendingRole = ref<"tenant" | "owner">("tenant");
const requestStatusOptions = [
  { label: "Aktivní", value: "active" },
  { label: "Neaktivní", value: "inactive" },
] as const;
const setRequestStatusFilter = (value: "active" | "inactive") => {
  requestStatusFilter.value = value;
};
const setOfferStatusFilter = (value: "active" | "inactive") => {
  offerStatusFilter.value = value;
};
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
const lastListScreen = ref<Screen | null>(null);
const pendingRequest = reactive({
  listingId: "festool-ts55",
  statusLabel: "Čeká na schválení",
  dateRange: "12. 10. – 15. 10. 2023",
  days: 3,
  serviceFee: 80,
  deposit: 2000,
  ownerName: "Petr S.",
  renterName: "Lucie K.",
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
  "add-listing": "Nová nabídka",
  "add-listing-confirmation": "Hotovo",
  "public-profile": "Veřejný profil",
  "profile-personal": "Osobní údaje",
  "profile-payments": "Platební metody",
  "profile-security": "Zabezpečení",
  "profile-language": "Jazyk a měna",
  help: "Nápověda",
  "help-detail": "Nápověda",
  "help-contact": "Napište nám",
  "profile-list": "Moje nabídky a poptávky",
  "public-profile-list": "Veřejné položky",
  rules: "Pravidla užívání",
  payment: "Platba",
  "payment-bank": "Platba převodem",
  "payment-card": "Platba kartou",
  confirmation: "Potvrzení",
  "cancel-confirmation": "Zrušení žádosti",
  "payment-confirmation": "Platba odeslána",
  "return-confirmation": "Pronájem ukončen",
  "rating-confirmation": "Hodnocení odesláno",
  "pending-request": "Rezervace",
  request: "Žádost",
  status: "Stav",
  profile: "Profil",
};

const selectedListing = computed<Listing>(
  () => listings.find((listing) => listing.id === selectedListingId.value) ?? listings[0],
);
const requestDateError = computed(() => requestStep.value === 1 && !requestDate.value.trim());
const addListingTitleError = computed(
  () => addListingStep.value === 1 && !addListingDraft.title.trim(),
);
const addListingCategoryError = computed(
  () => addListingStep.value === 1 && !addListingDraft.categoryId.trim(),
);
const addListingPhotosError = computed(
  () => addListingStep.value === 1 && addListingDraft.photoSlots.every((slot) => !slot),
);
const addListingPriceError = computed(
  () => addListingStep.value === 2 && (!Number.isFinite(addListingDraft.pricePerDay) || addListingDraft.pricePerDay <= 0),
);
const addListingDepositError = computed(
  () =>
    addListingStep.value === 2 &&
    addListingDraft.depositEnabled &&
    (!Number.isFinite(addListingDraft.depositAmount) || addListingDraft.depositAmount <= 0),
);
const addListingAvailabilityError = computed(
  () =>
    addListingStep.value === 2 &&
    addListingDraft.availabilityDays.length === 0,
);
const addListingOtherRuleError = computed(
  () =>
    addListingStep.value === 3 &&
    addListingDraft.rules.other &&
    !addListingDraft.rules.otherDescription.trim(),
);
const addListingOtherPickupError = computed(
  () =>
    addListingStep.value === 3 &&
    addListingDraft.pickupMethods.mode === "other" &&
    !addListingDraft.pickupMethods.otherPickupDescription.trim(),
);
const selectedConditionNote = computed(() => {
  const hit = conditionOptions.find((item) => item.id === addListingDraft.condition);
  return hit?.note ?? "";
});
const selectedConditionLabel = computed(() => {
  const hit = conditionOptions.find((item) => item.id === addListingDraft.condition);
  return hit?.label ?? "Vyber stav";
});
const selectedConditionDisplay = computed(() => {
  const label = selectedConditionLabel.value;
  const note = selectedConditionNote.value;
  return note ? `${label} - ${note}` : label;
});
const conditionDropdownOpen = ref(false);
const conditionDropdownEl = ref<HTMLElement | null>(null);
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
const approvePendingRequest = () => {
  confirmApprovalOpen.value = true;
};
const closeConfirmApprovalModal = () => {
  confirmApprovalOpen.value = false;
};
const confirmApproval = () => {
  confirmApprovalOpen.value = false;
  pendingRequest.statusLabel = "Schváleno - čeká na platbu";
};
const rejectPendingRequest = () => {
  confirmRejectOpen.value = true;
};
const closeConfirmRejectModal = () => {
  confirmRejectOpen.value = false;
  rejectReason.value = "";
};
const confirmReject = () => {
  confirmRejectOpen.value = false;
  rejectReason.value = "";
  pendingRequest.statusLabel = "Zamítnuto";
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
  ratingSubmitted.value = false;
  setScreen("return-confirmation");
};
const confirmRating = () => {
  ratingSubmitted.value = true;
  setScreen("rating-confirmation");
};
const openProblemReport = () => {
  problemReportOpen.value = true;
};
const closeProblemReport = () => {
  problemReportOpen.value = false;
};
const submitProblemReport = () => {
  problemReported.value = true;
  problemReportOpen.value = false;
};
const openRatingFlow = (role: "tenant" | "owner") => {
  pendingRole.value = role;
  ratingSubmitted.value = false;
  setScreen("return-confirmation");
};
const openProfileRequestsList = () => {
  profileListTab.value = "requests";
  setScreen("profile-list");
};
const openProfileOffersList = () => {
  profileListTab.value = "offers";
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
    listings: ["festool-ts55", "karcher-wash", "makita-drill", "bosch-drill", "hilti-breaker"],
    requests: ["laser-level", "bosch-drill"],
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
  "laser-level": { label: "Pronájem ukončen", tone: "is-green" },
  "bosch-drill": { label: "Pronájem ukončen", tone: "is-green" },
  "hilti-breaker": { label: "Čeká na hodnocení", tone: "is-muted" },
};

const requestDateRanges: Record<string, string> = {
  "festool-ts55": "15. 10. – 18. 10. 2023",
  "karcher-wash": "08. 11. – 12. 11. 2023",
  "laser-level": "18. 10. – 20. 10. 2023",
  "makita-drill": "29. 10. – 05. 11. 2023",
  "bosch-drill": "28. 09. – 02. 10. 2023",
  "hilti-breaker": "22. 10. – 28. 10. 2023",
};

const requestStatusMap: Record<string, { label: string; tone: string }> = {
  "festool-ts55": { label: "Čeká na schválení", tone: "is-brown" },
  "karcher-wash": { label: "Schváleno - čeká na platbu", tone: "is-green" },
  "laser-level": { label: "Pronájem ukončen", tone: "is-green" },
  "makita-drill": { label: "Zamítnutí", tone: "is-muted" },
  "bosch-drill": { label: "Pronájem ukončen", tone: "is-green" },
  "hilti-breaker": { label: "Čeká na hodnocení", tone: "is-muted" },
};

const profileOffers = computed(() => {
  const bucket = demoProfileMatrix[user.email] ?? demoProfileMatrix["demo@vercajkovna.cz"];
  return bucket.offers
    .map((id) => {
      const listing = listings.find((item) => item.id === id);
      if (!listing) return null;
      const status = offerStatusMap[id] ?? { label: "Čeká na schválení", tone: "is-brown" };
      const dateRange = requestDateRanges[id] ?? "—";
      return {
        id,
        title: listing.title,
        priceValue: listing.priceValue,
        location: listing.location,
        statusLabel: status.label,
        statusTone: status.tone,
        dateRange,
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
      const dateRange = requestDateRanges[id] ?? "—";
      if (id === pendingRequest.listingId && pendingRequest.statusLabel === "Vrácení potvrzeno") {
        return {
          id,
          title: listing.title,
          priceValue: listing.priceValue,
          location: listing.location,
          statusLabel: ratingSubmitted.value ? "Pronájem ukončen" : "Čeká na hodnocení",
          statusTone: ratingSubmitted.value ? "is-green" : "is-muted",
          dateRange,
        };
      }
      if (id === pendingRequest.listingId && problemReported.value) {
        return {
          id,
          title: listing.title,
          priceValue: listing.priceValue,
          location: listing.location,
          statusLabel: "Problém nahlášen",
          statusTone: "is-rejected",
          dateRange,
        };
      }
      return {
        id,
        title: listing.title,
        priceValue: listing.priceValue,
        location: listing.location,
        statusLabel: status.label,
        statusTone: status.tone,
        dateRange,
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
});

const filteredProfileRequests = computed(() => {
  let items = [...profileRequests.value];
  const inactiveStatuses = ["Pronájem ukončen", "Zamítnutí", "Zrušeno"];
  if (requestStatusFilter.value === "active") {
    items = items.filter((item) => !inactiveStatuses.includes(item.statusLabel));
  } else {
    items = items.filter((item) => inactiveStatuses.includes(item.statusLabel));
  }
  return items;
});

const filteredProfileOffers = computed(() => {
  let items = [...profileOffers.value];
  const inactiveStatuses = ["Pronájem ukončen", "Zamítnutí", "Zrušeno"];
  if (offerStatusFilter.value === "active") {
    items = items.filter((item) => !inactiveStatuses.includes(item.statusLabel));
  } else {
    items = items.filter((item) => inactiveStatuses.includes(item.statusLabel));
  }
  return items;
});

const activeProfileOffers = computed(() =>
  profileOffers.value.filter(
    (item) =>
      !["Pronájem ukončen", "Zamítnutí", "Zrušeno"].includes(item.statusLabel),
  ),
);

const activeProfileRequests = computed(() =>
  profileRequests.value.filter(
    (item) =>
      !["Pronájem ukončen", "Zamítnutí", "Zrušeno"].includes(item.statusLabel),
  ),
);

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
  let result = listings.filter((listing) => {
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

  if (filters.sortBy === "price_asc") {
    result.sort((a, b) => a.priceValue - b.priceValue);
  } else if (filters.sortBy === "price_desc") {
    result.sort((a, b) => b.priceValue - a.priceValue);
  } else if (filters.sortBy === "rating") {
    result.sort((a, b) => b.rating - a.rating);
  }

  return result;
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

const featuredListings = computed(() => filteredListings.value.slice(0, 6));
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
  authMode.value === "login" ? { submitLabel: "Přihlas se do účtu" } : { submitLabel: "Registrovat se" },
);

function persistAuth(remember: boolean, name: string, email: string) {
  const storage = remember ? localStorage : sessionStorage;
  const otherStorage = remember ? sessionStorage : localStorage;
  storage.setItem(AUTH_KEY, "1");
  storage.setItem(
    USER_KEY,
    JSON.stringify({
      name,
      email,
      phone: personal.phone,
      location: personal.address,
      firstName: personal.firstName,
      lastName: personal.lastName,
      address: personal.address,
      emailVerified: personal.emailVerified,
      phoneVerified: personal.phoneVerified,
      photo: personal.photo,
    }),
  );
  storage.setItem(REMEMBER_KEY, remember ? "1" : "0");
  otherStorage.removeItem(AUTH_KEY);
  otherStorage.removeItem(USER_KEY);
  otherStorage.removeItem(REMEMBER_KEY);
  isAuthenticated.value = true;
}

function clearAuth() {
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(PERSONAL_KEY);
  localStorage.removeItem(REMEMBER_KEY);
  sessionStorage.removeItem(AUTH_KEY);
  sessionStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(PERSONAL_KEY);
  sessionStorage.removeItem(REMEMBER_KEY);
  isAuthenticated.value = false;
}

function userStorage() {
  if (localStorage.getItem(AUTH_KEY)) return localStorage;
  if (sessionStorage.getItem(AUTH_KEY)) return sessionStorage;
  return localStorage;
}

function persistPersonal() {
  const storage = userStorage();
  storage.setItem(
    PERSONAL_KEY,
    JSON.stringify({
      firstName: personal.firstName,
      lastName: personal.lastName,
      email: personal.email,
      phone: personal.phone,
      location: personal.address,
      address: personal.address,
      emailVerified: personal.emailVerified,
      phoneVerified: personal.phoneVerified,
      photo: personal.photo,
    }),
  );
  storage.setItem(
    USER_KEY,
    JSON.stringify({
      name: user.name,
      email: user.email,
      phone: personal.phone,
      location: personal.address,
      firstName: personal.firstName,
      lastName: personal.lastName,
      address: personal.address,
      emailVerified: personal.emailVerified,
      phoneVerified: personal.phoneVerified,
      photo: personal.photo,
    }),
  );
  personal.saved = true;
  window.setTimeout(() => {
    personal.saved = false;
  }, 1200);
}

function openPersonalEdit(field: "firstName" | "lastName" | "email" | "phone" | "address") {
  personalEditField.value = field;
  if (field === "firstName") personalEditValue.value = personal.firstName;
  else if (field === "lastName") personalEditValue.value = personal.lastName;
  else if (field === "email") personalEditValue.value = personal.email;
  else if (field === "phone") personalEditValue.value = personal.phone;
  else personalEditValue.value = personal.address;
  personalEditOpen.value = true;
}

function closePersonalEdit() {
  personalEditOpen.value = false;
  personalEditField.value = null;
  personalEditValue.value = "";
}

function savePersonalEdit() {
  const field = personalEditField.value;
  if (!field) return;
  const value = personalEditValue.value.trim();
  if (field === "firstName") personal.firstName = value;
  if (field === "lastName") personal.lastName = value;
  if (field === "email") {
    personal.email = value;
    personal.emailVerified = false;
  }
  if (field === "phone") personal.phone = value;
  if (field === "address") personal.address = value;
  if (field === "phone") personal.phoneVerified = false;
  closePersonalEdit();
}

function savePersonalChanges() {
  const fullName = `${personal.firstName} ${personal.lastName}`.trim();
  user.name = fullName || user.name;
  user.email = personal.email.trim() || user.email;
  personal.email = user.email;
  persistPersonal();
}

function verifyEmail() {
  personal.emailVerified = true;
}

function verifyPhone() {
  personal.phoneVerified = true;
}

function openPersonalPhotoEditor() {
  personalPhotoOpen.value = true;
}

function closePersonalPhotoEditor() {
  personalPhotoOpen.value = false;
}

function setPhotoFromInitial() {
  const initial = (personal.firstName || user.name || "U").charAt(0).toUpperCase();
  personal.photo = initial;
  personalPhotoOpen.value = false;
}

function clearPhoto() {
  personal.photo = "";
  personalPhotoOpen.value = false;
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
  pendingRole.value = "tenant";
  if (screen.value === "profile-list" || screen.value === "profile") {
    lastListScreen.value = "profile-list";
  }
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
  lastListScreen.value = "profile-list";
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
  pendingRole.value = "tenant";
  setScreen("pending-request");
}

function openPendingOffer(offer: {
  id: string;
  statusLabel: string;
}) {
  pendingRequest.listingId = offer.id;
  pendingRequest.statusLabel = offer.statusLabel;
  pendingRole.value = "owner";
  setScreen("pending-request");
}

function openRequest(id?: string) {
  if (id) selectedListingId.value = id;
  requestStep.value = 1;
  requireAuth("request");
}

function resetAddListingDraft() {
  addListingDraft.photoSlots.forEach((photo) => {
    if (photo) URL.revokeObjectURL(photo.url);
  });
  addListingDraft.photoSlots = Array.from({ length: 4 }, () => null);
  addListingDraft.title = "";
  addListingDraft.categoryId = categories.find((item) => item.id !== "all")?.id ?? "stavba";
  addListingDraft.pricePerDay = 0;
  addListingDraft.depositEnabled = false;
  addListingDraft.depositAmount = 0;
  addListingDraft.availabilityDays = [];
  addListingDraft.locationMode = "profile";
  addListingDraft.customAddress.street = "";
  addListingDraft.customAddress.city = "";
  addListingDraft.customAddress.zip = "";
  addListingDraft.brand = "";
  addListingDraft.model = "";
  addListingDraft.power = "";
  addListingDraft.weight = "";
  addListingDraft.accessories = "";
  addListingDraft.condition = "new";
  addListingDraft.additionalParams = "";
  addListingDraft.pickupMethods.mode = "personal";
  addListingDraft.pickupMethods.otherPickupDescription = "";
  addListingDraft.rules.noModifications = false;
  addListingDraft.rules.purposeOnly = false;
  addListingDraft.rules.noThirdParty = false;
  addListingDraft.rules.depositForfeit = false;
  addListingDraft.rules.other = false;
  publishedListingId.value = null;
}

function openAddListing() {
  if (!requireAuth("add-listing")) return;
  addListingStep.value = 1;
  addListingProceedAttempt.value = false;
  pendingPhotoSlotIndex.value = 0;
  draggingPhotoIndex.value = null;
  dragOverPhotoIndex.value = null;
  resetAddListingDraft();
}

function nextAddListingStep() {
  addListingProceedAttempt.value = true;
  if (addListingStep.value === 1) {
    if (addListingPhotosError.value || addListingTitleError.value || addListingCategoryError.value) return;
  }
  if (addListingStep.value === 2) {
    if (addListingPriceError.value || addListingDepositError.value || addListingAvailabilityError.value) return;
  }
  if (addListingStep.value === 3) {
    if (addListingOtherRuleError.value || addListingOtherPickupError.value) return;
    submitAddListing();
    return;
  }
  addListingProceedAttempt.value = false;
  addListingStep.value = (addListingStep.value + 1) as 1 | 2 | 3;
}

function prevAddListingStep() {
  addListingProceedAttempt.value = false;
  if (addListingStep.value === 1) {
    goBack();
    return;
  }
  addListingStep.value = (addListingStep.value - 1) as 1 | 2 | 3;
}

const availabilityCalendar = computed(() => {
  const year = availabilityMonth.year;
  const month = availabilityMonth.month;
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
  return { year, month, label: `${monthNames[month]} ${year}`, cells };
});

function setAvailabilityMonth(delta: number) {
  const next = new Date(availabilityMonth.year, availabilityMonth.month + delta, 1);
  availabilityMonth.year = next.getFullYear();
  availabilityMonth.month = next.getMonth();
  availabilityRangeStart.value = null;
}

function toggleAvailabilityDay(day: number) {
  const month = availabilityMonth.month + 1;
  const formatted = `${availabilityMonth.year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  if (!availabilityRangeStart.value) {
    const idx = addListingDraft.availabilityDays.indexOf(formatted);
    if (idx >= 0) {
      // Single-day toggle off should not arm range selection.
      addListingDraft.availabilityDays.splice(idx, 1);
      return;
    }
    availabilityRangeStart.value = formatted;
    addListingDraft.availabilityDays.push(formatted);
    return;
  }

  const [sy, sm, sd] = availabilityRangeStart.value.split("-").map((part) => Number(part));
  const start = new Date(sy, (sm || 1) - 1, sd || 1);
  const end = new Date(availabilityMonth.year, availabilityMonth.month, day);
  const from = start <= end ? start : end;
  const to = start <= end ? end : start;

  const set = new Set(addListingDraft.availabilityDays);
  for (let cursor = new Date(from); cursor <= to; cursor.setDate(cursor.getDate() + 1)) {
    const y = cursor.getFullYear();
    const m = cursor.getMonth() + 1;
    const d = cursor.getDate();
    set.add(`${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
  }
  const merged = Array.from(set).sort();
  addListingDraft.availabilityDays.splice(0, addListingDraft.availabilityDays.length, ...merged);
  availabilityRangeStart.value = null;
}

function isAvailabilitySelected(day: number) {
  const month = availabilityMonth.month + 1;
  const formatted = `${availabilityMonth.year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  return addListingDraft.availabilityDays.includes(formatted);
}

function handleAddListingFiles(event: Event) {
  const input = event.target as HTMLInputElement | null;
  const files = input?.files ? Array.from(input.files) : [];
  if (!files.length) return;
  const images = files.filter((file) => file.type.startsWith("image/"));
  if (!images.length) return;

  let slotIndex = Math.min(3, Math.max(0, pendingPhotoSlotIndex.value));
  images.forEach((file) => {
    if (slotIndex > 3) return;
    const url = URL.createObjectURL(file);
    const nextPhoto: AddListingPhoto = { file, url };
    const existing = addListingDraft.photoSlots[slotIndex];
    if (existing) URL.revokeObjectURL(existing.url);
    addListingDraft.photoSlots[slotIndex] = nextPhoto;
    slotIndex += 1;
  });
  if (input) input.value = "";
}

function removeAddListingPhoto(index: number) {
  const photo = addListingDraft.photoSlots[index];
  if (!photo) return;
  URL.revokeObjectURL(photo.url);
  addListingDraft.photoSlots[index] = null;
}

function openAddListingPhotoPicker(index: number) {
  pendingPhotoSlotIndex.value = Math.min(3, Math.max(0, index));
  addListingPhotoInput.value?.click();
}

function openAddListingPhotoPickerForFirstEmpty() {
  const idx = addListingDraft.photoSlots.findIndex((slot) => !slot);
  openAddListingPhotoPicker(idx === -1 ? 0 : idx);
}

function setMainAddListingPhoto(index: number) {
  if (index === 0) return;
  const photo = addListingDraft.photoSlots[index];
  if (!photo) return;
  const first = addListingDraft.photoSlots[0];
  addListingDraft.photoSlots[0] = photo;
  addListingDraft.photoSlots[index] = first;
}

function handlePhotoDragStart(event: DragEvent, index: number) {
  if (!addListingDraft.photoSlots[index]) return;
  draggingPhotoIndex.value = index;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(index));
  }
}

function handlePhotoDragOver(event: DragEvent, index: number) {
  if (draggingPhotoIndex.value === null) return;
  dragOverPhotoIndex.value = index;
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = "move";
  }
}

function handlePhotoDrop(index: number) {
  const from = draggingPhotoIndex.value;
  if (from === null || from === index) return;
  const fromPhoto = addListingDraft.photoSlots[from];
  if (!fromPhoto) return;
  const toPhoto = addListingDraft.photoSlots[index];
  addListingDraft.photoSlots[index] = fromPhoto;
  addListingDraft.photoSlots[from] = toPhoto;
  draggingPhotoIndex.value = null;
  dragOverPhotoIndex.value = null;
}

function handlePhotoDragEnd() {
  draggingPhotoIndex.value = null;
  dragOverPhotoIndex.value = null;
}

function slugifyId(value: string) {
  const slug = value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return slug || `listing-${Math.random().toString(16).slice(2, 8)}`;
}

function submitAddListing() {
  if (addListingPhotosError.value || addListingTitleError.value || addListingCategoryError.value) return;
  if (addListingPriceError.value || addListingDepositError.value || addListingAvailabilityError.value) return;
  if (addListingOtherRuleError.value || addListingOtherPickupError.value) return;
  if (!requireAuth("add-listing")) return;

  const baseId = slugifyId(addListingDraft.title);
  let id = baseId;
  let counter = 2;
  while (listings.some((item) => item.id === id)) {
    id = `${baseId}-${counter}`;
    counter += 1;
  }

  const priceValue = Math.round(Number(addListingDraft.pricePerDay) || 0);
  const location =
    addListingDraft.locationMode === "custom"
      ? [addListingDraft.customAddress.city, addListingDraft.customAddress.street]
          .filter(Boolean)
          .join(", ") || "—"
      : (personal.address || "—");

  const newListing: Listing = {
    id,
    title: addListingDraft.title.trim(),
    price: `${priceValue} Kč / den`,
    priceValue,
    location,
    distance: "0.0 km",
    distanceValue: 0,
    rating: 0,
    category: addListingDraft.categoryId,
    availability: "Nově přidáno",
    depositRequired: Boolean(addListingDraft.depositEnabled),
    description: addListingDraft.additionalParams.trim() || "Nová nabídka vytvořená v demo flow.",
    owner: personal.firstName || user.name || "Já",
    ownerSince: "nově",
    badges: ["Novinka"],
  };

  listings.unshift(newListing);
  const bucket = demoProfileMatrix[user.email] ?? demoProfileMatrix["demo@vercajkovna.cz"];
  bucket.offers.unshift(id);
  publishedListingId.value = id;
  setScreen("add-listing-confirmation");
}

onBeforeUnmount(() => {
  addListingDraft.photoSlots.forEach((photo) => {
    if (photo) URL.revokeObjectURL(photo.url);
  });
});

function selectCondition(value: AddListingDraft["condition"]) {
  addListingDraft.condition = value;
  conditionDropdownOpen.value = false;
}

function toggleConditionDropdown() {
  conditionDropdownOpen.value = !conditionDropdownOpen.value;
}

onMounted(() => {
  document.addEventListener("pointerdown", onDocPointerDown);
});

function onDocPointerDown(event: PointerEvent) {
  const root = conditionDropdownEl.value;
  if (!root) return;
  const target = event.target as Node | null;
  if (target && root.contains(target)) return;
  conditionDropdownOpen.value = false;
}

onBeforeUnmount(() => {
  document.removeEventListener("pointerdown", onDocPointerDown);
});

function openProfile() {
  requireAuth("profile");
}

function openProfilePersonal() {
  if (!requireAuth("profile-personal")) return;
  const currentParts = user.name.trim().split(/\s+/);
  personal.firstName = personal.firstName || currentParts[0] || "";
  personal.lastName = personal.lastName || currentParts.slice(1).join(" ");
  personal.email = user.email;
}

function openProfilePayments() {
  if (!requireAuth("profile-payments")) return;
  setScreen("profile-payments");
}

const cardToDelete = ref<string | null>(null);
const confirmLogoutAllOpen = ref(false);

function requestLogoutAll() {
  confirmLogoutAllOpen.value = true;
}

function confirmLogoutAll() {
  confirmLogoutAllOpen.value = false;
  logout();
}

function requestRemoveCard(cardId: string) {
  cardToDelete.value = cardId;
}

function confirmRemoveCard() {
  if (cardToDelete.value) {
    removeCard(cardToDelete.value);
    cardToDelete.value = null;
  }
}

function removeCard(cardId: string) {
  cardForm.savedCards = cardForm.savedCards.filter(c => c.id !== cardId);
  if (cardForm.selectedCardId === cardId && cardForm.savedCards.length > 0) {
    cardForm.selectedCardId = cardForm.savedCards[0].id;
  }
}

const isAddingCard = ref(false);
const newCardData = reactive({
  number: "",
  expiry: "",
  cvc: ""
});

function addNewCard() {
  if (!newCardData.number || !newCardData.expiry) return;
  const brand = newCardData.number.startsWith('4') ? 'Visa' : 'Mastercard';
  const last4 = newCardData.number.slice(-4);
  const id = 'c' + Date.now();
  
  cardForm.savedCards.push({
    id,
    brand,
    last4,
    expiry: newCardData.expiry,
    isDefault: cardForm.savedCards.length === 0
  });
  
  newCardData.number = "";
  newCardData.expiry = "";
  newCardData.cvc = "";
  isAddingCard.value = false;
}

function openProfileSecurity() {
  if (!requireAuth("profile-security")) return;
  setScreen("profile-security");
}

const securityForm = reactive({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
  twoFactorEnabled: false,
  twoFactorStep: 1, // 1: password, 2: method, 3: setup, 4: success
  twoFactorMethod: "app" as "app" | "sms",
  twoFactorPassword: "",
  twoFactorPhone: "",
  twoFactorCode: "",
  isSetupOpen: false,
  isChangingPassword: false
});
const showSecurityPasswords = ref(false);

const securityPasswordRules = computed(() => {
  const value = securityForm.newPassword;
  return [
    { label: "Min. 8 znaků", ok: value.length >= 8 },
    { label: "Velké písmeno", ok: /[A-Z]/.test(value) },
    { label: "Malé písmeno", ok: /[a-z]/.test(value) },
    { label: "Číslice", ok: /[0-9]/.test(value) },
  ];
});

function changePassword() {
  const failedRule = securityPasswordRules.value.find((rule) => !rule.ok);
  if (failedRule || !securityForm.newPassword || securityForm.newPassword !== securityForm.confirmPassword) {
    alert("Heslo nesplňuje všechny požadavky nebo se neshoduje s potvrzením.");
    return;
  }
  securityForm.isChangingPassword = true;
  setTimeout(() => {
    securityForm.isChangingPassword = false;
    securityForm.currentPassword = "";
    securityForm.newPassword = "";
    securityForm.confirmPassword = "";
    alert("Heslo bylo úspěšně změněno.");
  }, 1500);
}

function start2FASetup() {
  securityForm.twoFactorStep = 1;
  securityForm.twoFactorPassword = "";
  securityForm.twoFactorPhone = "";
  securityForm.twoFactorCode = "";
  securityForm.isSetupOpen = true;
}

function verify2FAPassword() {
  if (securityForm.twoFactorPassword === "demo1234") {
    securityForm.twoFactorStep = 2;
  } else {
    alert("Nesprávné heslo (zkuste demo1234)");
  }
}

function select2FAMethod(method: "app" | "sms") {
  securityForm.twoFactorMethod = method;
  securityForm.twoFactorStep = 3;
}

function complete2FASetup() {
  if (securityForm.twoFactorCode.length === 6) {
    securityForm.twoFactorStep = 4;
    securityForm.twoFactorEnabled = true;
  } else {
    alert("Zadejte platný 6místný kód.");
  }
}

function close2FASetup() {
  securityForm.isSetupOpen = false;
}

function disable2FA() {
  securityForm.twoFactorEnabled = false;
}

function openProfileLanguage() {
  if (!requireAuth("profile-language")) return;
  setScreen("profile-language");
}

const settings = reactive({
  language: "cz",
  currency: "CZK"
});

function openFavorites() {
  requireAuth("favorites");
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

function openHelp() {
  helpQuery.value = "";
  helpSelectedId.value = null;
  helpFeedback.value = null;
  setScreen("help");
}

const contactForm = reactive({
  topic: "Průběh výpůjčky",
  message: "",
  isSending: false
});

function openHelpContact() {
  contactForm.topic = "Průběh výpůjčky";
  contactForm.message = "";
  contactForm.isSending = false;
  setScreen("help-contact");
}

function submitContact() {
  if (!contactForm.message.trim()) return;
  contactForm.isSending = true;
  setTimeout(() => {
    contactForm.isSending = false;
    alert("Vaše zpráva byla odeslána. Brzy se vám ozveme!");
    setScreen("help");
  }, 1500);
}

function openHelpDetail(id: string) {
  helpSelectedId.value = id;
  helpFeedback.value = null;
  setScreen("help-detail");
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
    personal.email = user.email;
    const nameParts = user.name.trim().split(/\s+/);
    personal.firstName = personal.firstName || nameParts[0] || "";
    personal.lastName = personal.lastName || nameParts.slice(1).join(" ");
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
  const nameParts = name.trim().split(/\s+/);
  personal.firstName = nameParts[0] ?? "";
  personal.lastName = nameParts.slice(1).join(" ");
  personal.email = email;
  personal.emailVerified = true;
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

  if (screen.value === "detail" && lastListScreen.value) {
    screen.value = lastListScreen.value;
    localStorage.setItem(SCREEN_KEY, lastListScreen.value);
    return;
  }

  if (screen.value === "auth") {
    pendingAuthScreen.value = null;
  }

  if (screen.value !== "market") {
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
  searchExpanded.value = true;
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
        screen !== 'confirmation'
      "
      class="topbar topbar-app"
    >
      <div class="topbar-inner">
        <button
          class="icon-button"
          type="button"
          aria-label="Zpět"
          @click="screen === 'add-listing' ? prevAddListingStep() : goBack()"
        >
          <i class="pi pi-arrow-left"></i>
        </button>
        <div class="topbar-title">
          <strong>Vercajkovna</strong>
          <span>{{ screenLabels[screen] }}</span>
        </div>
        <div class="topbar-actions">
          <button
            v-if="isAuthenticated"
            class="icon-button icon-button-initials"
            type="button"
            aria-label="Profil"
            @click="openProfile"
          >
            {{ user.name.charAt(0).toUpperCase() }}
          </button>
          <button
            v-else
            class="icon-button"
            type="button"
            aria-label="Přihlas se"
            @click="openAuth()"
          >
            <i class="pi pi-sign-in"></i>
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
                <label for="authEmail">E-MAIL</label>
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
                <div class="auth-demo-hint">Klikni a rovnou přihlasíme vybraný profil.</div>
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
              <div class="market-search-shell market-search-shell-hero" @mousedown.capture="openSearchFilters" @click.capture="openSearchFilters">
                <i class="pi pi-search"></i>
                <PvInputText
                  v-model="search"
                  class="market-search"
                  autocomplete="off"
                  placeholder="Bosch, žebřík, Praha..."
                />
              </div>
            </div>

            <div v-show="searchExpanded" class="market-primary-filters" aria-label="Hlavní filtry">
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

            <div v-show="searchExpanded" class="market-filter-shell">
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

              <div class="market-filter-panel-head" style="display:flex; align-items:center; justify-content:space-between;">
                <strong>Upřesni nabídky</strong>
                <button class="market-filter-reset" type="button" @click="resetFilters">Resetovat</button>
              </div>

              <div class="market-filter-section">
                <span class="market-filter-group-label">Řadit podle</span>
                <div class="input-shell" style="margin-top: 8px; display: grid; grid-template-columns: 1fr auto; align-items: center;">
                  <select v-model="filters.sortBy" class="auth-input" style="appearance: none; background: transparent; border: 0; width: 100%; font-weight: 600; color: var(--brand); grid-column: 1;">
                    <option value="newest">Nejnovější</option>
                    <option value="price_asc">Nejlevnější</option>
                    <option value="price_desc">Nejdražší</option>
                    <option value="rating">Nejlépe hodnocené</option>
                  </select>
                  <i class="pi pi-chevron-down" style="font-size: 0.8rem; opacity: 0.5; grid-column: 2;"></i>
                </div>
              </div>

              <div class="market-filter-section">
                <span class="market-filter-group-label">Kategorie</span>
                <div class="market-filter-quick">
                  <button
                    v-for="item in categoryButtons"
                    :key="item.id"
                    class="market-filter-chip"
                    :class="{ 'is-active': category === item.id }"
                    type="button"
                    @click="category = item.id"
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
                <div class="market-item-thumb" aria-hidden="true">
                  <span v-if="!listing.depositRequired" class="market-item-thumb-badge">Bez zálohy</span>
                </div>
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
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section class="market-section">
            <div class="market-section-head market-section-head-row">
              <h2>Všechny nabídky</h2>
            </div>
            <div class="market-card-grid">
              <div
                v-for="listing in allMarketplaceListings"
                :key="listing.id"
                class="market-item-card"
                @click="openListing(listing.id)"
              >
                <div class="market-item-thumb" aria-hidden="true">
                  <span v-if="!listing.depositRequired" class="market-item-thumb-badge">Bez zálohy</span>
                </div>
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
            <template #content>
              <span class="eyebrow">Prázdné</span>
              <h1>Ještě nic nemáš uložené</h1>
              <p>Klikni na srdíčko u nabídky a tady se objeví.</p>
              <div class="profile-actions">
                <PvButton class="button-primary" @click="setScreen('market')">Prohlížet nabídky</PvButton>
              </div>
            </template>
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
              <span>{{ isAuthenticated ? "Půjčit si vercajk" : "Přihlas se a půjčit" }}</span>
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
              <h1>Zvolte platbu</h1>
              <p>Slouží pro interní účely, pro flow procesu</p>
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
              @click="paymentMethod === 'bank' ? openPaymentBank() : openPaymentCard()"
            >
              Pokračovat
              <i class="pi pi-arrow-right"></i>
            </PvButton>
          </div>
        </div>

        <div v-else-if="screen === 'payment-card'" class="screen-inner payment-page">
          <!-- Identický přehled jako u převodu -->
          <div class="reservation-card">
            <div class="reservation-thumb" aria-hidden="true"></div>
            <div>
              <strong>{{ selectedListing.title }}</strong>
              <span>{{ selectedListing.priceValue }} Kč / den</span>
            </div>
          </div>

          <div class="reservation-section">
            <strong>Vybrané datum</strong>
            <div class="calendar-summary">
              <div class="calendar-summary-row">
                <span>{{ requestDate || "Nevybráno" }}</span>
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

          <!-- Volba konkrétní metody -->
          <div class="reservation-section" style="margin-top: 24px;">
            <strong>Způsob platby kartou</strong>
            <div class="payment-method-selector" style="margin-top: 12px;">
              <button 
                type="button" 
                class="method-pill" 
                :class="{ 'is-active': cardForm.subMethod === 'card' }"
                @click="cardForm.subMethod = 'card'"
              >
                <i class="pi pi-credit-card"></i>
                Karta
              </button>
              <button 
                type="button" 
                class="method-pill" 
                :class="{ 'is-active': cardForm.subMethod === 'apple' }"
                @click="cardForm.subMethod = 'apple'"
              >
                <i class="pi pi-apple"></i>
                Apple Pay
              </button>
              <button 
                type="button" 
                class="method-pill" 
                :class="{ 'is-active': cardForm.subMethod === 'google' }"
                @click="cardForm.subMethod = 'google'"
              >
                <i class="pi pi-google"></i>
                Google Pay
              </button>
            </div>
          </div>

          <!-- Dynamický formulář podle volby -->
          <div class="card-checkout-form" style="margin-top: 10px;">
            <template v-if="cardForm.subMethod === 'card'">
              <div class="saved-card-selector">
                <!-- Selected Card (Trigger) -->
                <button 
                  type="button" 
                  class="selected-card-display" 
                  @click="cardForm.isSelectorOpen = !cardForm.isSelectorOpen"
                >
                  <div class="card-info-main">
                    <i :class="['pi', cardForm.savedCards.find(c => c.id === cardForm.selectedCardId)?.brand === 'Visa' ? 'pi-credit-card' : 'pi-credit-card']" style="font-size: 1.2rem;"></i>
                    <div class="card-text">
                      <strong>{{ cardForm.savedCards.find(c => c.id === cardForm.selectedCardId)?.brand }} •••• {{ cardForm.savedCards.find(c => c.id === cardForm.selectedCardId)?.last4 }}</strong>
                      <span>Platnost {{ cardForm.savedCards.find(c => c.id === cardForm.selectedCardId)?.expiry }}</span>
                    </div>
                  </div>
                  <i class="pi" :class="cardForm.isSelectorOpen ? 'pi-chevron-up' : 'pi-chevron-down'"></i>
                </button>

                <!-- Expanded List -->
                <div v-if="cardForm.isSelectorOpen" class="card-options-list">
                  <button 
                    v-for="card in cardForm.savedCards" 
                    :key="card.id"
                    type="button"
                    class="card-option-item"
                    :class="{ 'is-selected': cardForm.selectedCardId === card.id }"
                    @click="cardForm.selectedCardId = card.id; cardForm.isSelectorOpen = false;"
                  >
                    <div class="card-option-info">
                       <i class="pi pi-credit-card"></i>
                       <span>{{ card.brand }} •••• {{ card.last4 }}</span>
                    </div>
                    <i v-if="cardForm.selectedCardId === card.id" class="pi pi-check" style="color: var(--brand-2);"></i>
                  </button>
                  
                  <button type="button" class="add-new-card-link" @click="openProfilePersonal">
                    <i class="pi pi-plus-circle"></i>
                    <span>Spravovat karty v profilu</span>
                  </button>
                </div>
              </div>
            </template>
            <template v-else>
              <div class="express-payment-placeholder" style="padding: 24px;">
                <div class="express-icon">
                  <i :class="['pi', cardForm.subMethod === 'apple' ? 'pi-apple' : 'pi-google']"></i>
                </div>
                <p>Platba bude potvrzena pomocí {{ cardForm.subMethod === 'apple' ? 'FaceID' : 'Google Pay' }}</p>
              </div>
            </template>
          </div>

          <label class="reservation-terms" style="margin-top: 20px;">
            <PvCheckbox v-model="agreeTerms" binary />
            <span>Souhlasím s pravidly užívání a platbou.</span>
          </label>

          <button
            class="reservation-submit"
            style="height: 56px; display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; margin-top: 16px;"
            :disabled="!agreeTerms || cardForm.isProcessing"
            @click="submitCardPayment"
          >
            <i v-if="cardForm.isProcessing" class="pi pi-spin pi-spinner"></i>
            <span>{{ cardForm.isProcessing ? 'Platba probíhá...' : 'Zaplatit ' + priceSummary.total + ' Kč' }}</span>
          </button>
        </div>

        <div v-else-if="screen === 'payment-bank'" class="screen-inner payment-page">
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
          <h1>
            <span v-if="pendingRole === 'tenant'">Platba odeslána</span>
            <span v-else>Platba potvrzena</span>
          </h1>
          <p v-if="pendingRole === 'tenant'">
            Majitel dostal informaci o úhradě a potvrdí ji co nejdříve.
          </p>
          <p v-else>
            Platbu jste potvrdili. Nájemce byl informován a může si vercajk vyzvednout.
          </p>
          <button
            class="confirmation-button"
            type="button"
            @click="pendingRole === 'tenant' ? openProfileRequestsList() : openProfileOffersList()"
          >
            <span v-if="pendingRole === 'tenant'">Zpět na moje poptávky</span>
            <span v-else>Zpět na moje nabídky</span>
          </button>
        </div>

        <div v-else-if="screen === 'return-confirmation'" class="screen-inner confirmation-page">
          <div class="confirmation-icon is-payment">
            <i class="pi pi-check"></i>
          </div>
          <h1>Pronájem ukončen</h1>
          <p v-if="pendingRole === 'tenant'">
            Vercajk je vrácen a pronájem byl uzavřen. Kauci by měl majitel vercajku vrátit do 2
            pracovních dnů zpět na váš účet.
          </p>
          <p v-else>
            Vercajk je vrácen a pronájem byl uzavřen. Nezapomeňte vrátit kauci nájemci do 2
            pracovních dnů.
          </p>
          <div class="return-rating">
            <span>
              <span v-if="pendingRole === 'tenant'">Ohodnotit majitele</span>
              <span v-else>Ohodnotit nájemce</span>
            </span>
            <div class="return-rating-stars">
              <i class="pi pi-star"></i>
              <i class="pi pi-star"></i>
              <i class="pi pi-star"></i>
              <i class="pi pi-star"></i>
              <i class="pi pi-star"></i>
            </div>
            <textarea class="return-rating-note" rows="3" placeholder="Krátký komentář (volitelné)"></textarea>
            <button type="button" class="confirmation-button" @click="confirmRating">
              Odeslat hodnocení
            </button>
            <button type="button" class="return-rating-skip" @click="openProfileRequestsList">
              Ohodnotit později
            </button>
          </div>
        </div>

        <div v-else-if="screen === 'rating-confirmation'" class="screen-inner confirmation-page">
          <div class="confirmation-icon is-payment">
            <i class="pi pi-check"></i>
          </div>
          <h1>Hodnocení odesláno</h1>
          <p>Děkujeme za zpětnou vazbu. Pomáháte tím zlepšovat komunitu.</p>
          <button
            class="confirmation-button"
            type="button"
            @click="pendingRole === 'tenant' ? openProfileRequestsList() : openProfileOffersList()"
          >
            <span v-if="pendingRole === 'tenant'">Zpět na moje poptávky</span>
            <span v-else>Zpět na moje nabídky</span>
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

          <details class="pending-request-summary" open>
            <summary>Souhrn ceny</summary>
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
          </details>

          <div
            v-if="pendingRole === 'tenant' && pendingRequest.statusLabel === 'Schváleno - čeká na platbu'"
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
              Po odeslání platby potvrdíte akci tlačítkem níže. Majitel bude o platbě informován.
            </div>
          </div>

          <div
            v-if="pendingRequest.statusLabel === 'Platba odeslána – čeká na potvrzení'"
            class="pending-payment-wait"
          >
            <span v-if="pendingRole === 'tenant'">
              Majitel má 24 hodin na potvrzení platby. O výsledku budete informováni v notifikacích.
            </span>
            <span v-else>
              Nájemce odeslal platbu. Potvrďte ji prosím do 24 hodin.
            </span>
          </div>

          <div class="pending-request-owner">
            <div class="pending-owner-avatar">
              {{
                (pendingRole === 'tenant' ? pendingRequest.ownerName : pendingRequest.renterName)
                  .charAt(0)
              }}
            </div>
            <div>
              <strong>{{ pendingRole === 'tenant' ? pendingRequest.ownerName : pendingRequest.renterName }}</strong>
              <span>{{ pendingRole === 'tenant' ? "Majitel" : "Nájemce" }}</span>
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

          <details class="pending-request-delivery" open>
            <summary>Způsob předání</summary>
            <p>{{ pendingRequest.pickupNote }}</p>
          </details>

          <div
            v-if="
              pendingRequest.statusLabel === 'Platba potvrzena - od majitele' ||
              pendingRequest.statusLabel === 'Vyzvednutí – čeká na potvrzení'
            "
            class="pending-handover-card"
          >
            <strong>Vyzvednutí</strong>
            <div class="pending-handover-actions">
              <button
                v-if="pendingRole === 'tenant'"
                type="button"
                class="pending-handover-primary"
                @click="confirmPickupOpen = true"
              >
                Potvrdit převzetí
              </button>
              <button
                v-else
                type="button"
                class="pending-handover-primary"
                @click="confirmPickupOpen = true"
              >
                Potvrdit předání
              </button>
            </div>
            <button type="button" class="pending-handover-link" @click="openProblemReport">
              Nahlásit problém
            </button>
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
              <button
                v-if="pendingRole === 'tenant'"
                type="button"
                class="pending-handover-primary"
                @click="confirmReturnOpen = true"
              >
                Potvrdit vrácení
              </button>
              <button
                v-else
                type="button"
                class="pending-handover-primary"
                @click="confirmReturnOpen = true"
              >
                Potvrdit převzetí zpět
              </button>
            </div>
            <button type="button" class="pending-handover-link" @click="openProblemReport">
              Nahlásit problém
            </button>
          </div>
          <div v-if="problemReportOpen" class="confirm-modal">
            <button
              class="confirm-modal-backdrop"
              type="button"
              @click="closeProblemReport"
              aria-label="Zavřít nahlášení"
            ></button>
            <div class="confirm-modal-card">
              <p class="confirm-modal-title">Nahlásit problém</p>
              <p class="confirm-modal-copy">Co se stalo?</p>
              <div class="problem-report-actions">
                <button
                  v-for="option in ['Nepředáno','Poškozeno','Jiné']"
                  :key="option"
                  type="button"
                  class="problem-report-pill"
                  :class="{ 'is-active': problemReportType === option }"
                  @click="problemReportType = option"
                >
                  {{ option }}
                </button>
              </div>
              <textarea
                v-model="problemReportNote"
                class="problem-report-note"
                rows="3"
                placeholder="Krátký popis (volitelné)"
              ></textarea>
              <div class="confirm-modal-actions">
                <button type="button" class="confirm-modal-primary" @click="submitProblemReport">
                  Odeslat hlášení
                </button>
                <button type="button" class="confirm-modal-ghost" @click="closeProblemReport">
                  Zpět
                </button>
              </div>
            </div>
          </div>
          <div v-if="confirmReturnOpen" class="confirm-modal">
            <button
              class="confirm-modal-backdrop"
              type="button"
              @click="closeConfirmReturnModal"
              aria-label="Zavřít potvrzení"
            ></button>
            <div class="confirm-modal-card">
              <p class="confirm-modal-title">
                <span v-if="pendingRole === 'tenant'">Potvrdit vrácení vercajku?</span>
                <span v-else>Potvrdit převzetí vercajku zpět?</span>
              </p>
              <p class="confirm-modal-copy">
                <span v-if="pendingRole === 'tenant'">
                  Opravdu jste zařízení vrátili? Tímto se uzavře pronájem.
                </span>
                <span v-else>
                  Opravdu potvrzujete, že jste zařízení převzali zpět? Tímto se uzavře pronájem.
                </span>
              </p>
              <div class="confirm-modal-actions">
                <button type="button" class="confirm-modal-primary" @click="confirmReturn">
                  <span v-if="pendingRole === 'tenant'">Ano, vráceno</span>
                  <span v-else>Ano, převzato zpět</span>
                </button>
                <button type="button" class="confirm-modal-ghost" @click="closeConfirmReturnModal">
                  Zpět
                </button>
              </div>
            </div>
          </div>

          <button
            v-if="pendingRole === 'tenant' && pendingRequest.statusLabel === 'Schváleno - čeká na platbu'"
            class="pending-payment-submit"
            type="button"
            @click="confirmPaymentOpen = true"
          >
            Potvrdit odeslání platby
          </button>
          <button
            v-if="pendingRole === 'owner' && pendingRequest.statusLabel === 'Platba odeslána – čeká na potvrzení'"
            class="pending-payment-submit"
            type="button"
            @click="confirmPaymentOpen = true"
          >
            Potvrdit přijetí platby
          </button>
          <button
            v-if="pendingRole === 'tenant' && pendingRequest.statusLabel === 'Čeká na schválení'"
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
          <div v-if="confirmPaymentOpen" class="confirm-modal">
            <button
              class="confirm-modal-backdrop"
              type="button"
              @click="closeConfirmPaymentModal"
              aria-label="Zavřít potvrzení"
            ></button>
            <div class="confirm-modal-card">
              <p class="confirm-modal-title">
                <span v-if="pendingRole === 'tenant'">Potvrdit odeslání platby?</span>
                <span v-else>Potvrdit přijetí platby?</span>
              </p>
              <p class="confirm-modal-copy">
                <span v-if="pendingRole === 'tenant'">
                  Opravdu jste platbu odeslali? Po potvrzení informujeme majitele o úhradě.
                </span>
                <span v-else>
                  Opravdu potvrzujete, že jste platbu přijali? Nájemce bude informován a může si vercajk vyzvednout.
                </span>
              </p>
              <div class="confirm-modal-actions">
                <button type="button" class="confirm-modal-primary" @click="confirmPendingPayment">
                  <span v-if="pendingRole === 'tenant'">Ano, platba odeslána</span>
                  <span v-else>Ano, platba přijata</span>
                </button>
                <button type="button" class="confirm-modal-ghost" @click="closeConfirmPaymentModal">
                  Zpět
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
              <div class="profile-list-controls">
                <button
                  v-for="option in requestStatusOptions"
                  :key="`offer-filter-${option.value}`"
                  type="button"
                  class="profile-list-pill"
                  :class="{ 'is-active': offerStatusFilter === option.value }"
                  @click="setOfferStatusFilter(option.value)"
                >
                  {{ option.label }}
                </button>
              </div>
              <button
                v-for="offer in filteredProfileOffers"
                :key="`page-offer-${offer.id}`"
                class="profile-item"
                :class="{
                  'is-dimmed':
                    offer.statusLabel === 'Pronájem ukončen' ||
                  offer.statusLabel === 'Zamítnutí' ||
                  offer.statusLabel === 'Zrušeno',
                }"
                type="button"
                @click="
                  offer.statusLabel === 'Čeká na hodnocení'
                    ? openRatingFlow('owner')
                    : openPendingOffer(offer)
                "
              >
                <div class="profile-item-copy">
                  <span class="profile-item-title">{{ offer.title }}</span>
                  <span class="profile-item-meta">{{ offer.location }} · {{ offer.dateRange }}</span>
                </div>
                <span class="profile-item-status" :class="offer.statusTone">{{ offer.statusLabel }}</span>
              </button>
              <div v-if="!filteredProfileOffers.length" class="profile-empty">Zatím nic nenabízíš.</div>
            </div>
            <div v-else class="profile-panel-list">
              <div class="profile-list-controls">
                <button
                  v-for="option in requestStatusOptions"
                  :key="option.value"
                  type="button"
                  class="profile-list-pill"
                  :class="{ 'is-active': requestStatusFilter === option.value }"
                  @click="setRequestStatusFilter(option.value)"
                >
                  {{ option.label }}
                </button>
              </div>
              <button
                v-for="request in filteredProfileRequests"
                :key="`page-request-${request.id}`"
                class="profile-item"
                :class="{
                  'is-dimmed':
                    request.statusLabel === 'Pronájem ukončen' ||
                  request.statusLabel === 'Zamítnutí' ||
                  request.statusLabel === 'Zrušeno',
              }"
              type="button"
              @click="
                request.statusLabel === 'Čeká na hodnocení'
                  ? openRatingFlow('tenant')
                  : isRequestReservationStatus(request.statusLabel)
                    ? openPendingRequest(request)
                    : openListing(request.id)
              "
            >
              <div class="profile-item-copy">
                <span class="profile-item-title">{{ request.title }}</span>
                <span class="profile-item-meta">
                  {{ request.location }} · {{ request.dateRange }}
                </span>
              </div>
              <span class="profile-item-status" :class="request.statusTone">{{ request.statusLabel }}</span>
            </button>
              <div v-if="!filteredProfileRequests.length" class="profile-empty">Zatím nic nepoptáváš.</div>
            </div>
          </div>
        </div>

        <div v-else-if="screen === 'add-listing'" class="screen-inner">
          <PvCard class="add-flow">
            <template #content>
              <div class="add-flow-header">
                <div class="add-flow-step-row">
                  <span class="add-flow-step">Krok {{ addListingStep }} z 3</span>
                  <span class="add-flow-step-label">
                    {{
                      addListingStep === 1
                        ? "Základní info"
                        : addListingStep === 2
                          ? "Nastavení pronájmu"
                          : "Pravidla užívání"
                    }}
                  </span>
                </div>
                <div class="add-flow-progress" aria-hidden="true">
                  <div
                    class="add-flow-progress-bar"
                    :style="{ width: `${Math.round((addListingStep / 3) * 100)}%` }"
                  />                </div>
              </div>

              <div v-if="addListingStep === 1" class="add-listing-body">
                <div class="add-flow-section">
                  <div class="add-flow-section-title">Fotografie vercajku</div>

                  <input
                    ref="addListingPhotoInput"
                    class="hidden"
                    type="file"
                    accept="image/*"
                    multiple
                    @change="handleAddListingFiles"
                  />

                  <div class="add-flow-dropzone" :class="{ 'is-error': addListingPhotosError }">
                    <button
                      type="button"
                      class="add-flow-dropzone-inner"
                      aria-label="Přidat fotky"
                      @click="openAddListingPhotoPickerForFirstEmpty"
                    >
                      <template v-if="addListingDraft.photoSlots[0]">
                        <img
                          class="add-flow-dropzone-preview"
                          :src="addListingDraft.photoSlots[0]?.url"
                          alt="Hlavní fotografie"
                          loading="lazy"
                        />
                        <div class="add-flow-dropzone-overlay" aria-hidden="true">
                          <span class="add-flow-dropzone-badge">Hlavní fotka</span>
                          <span class="add-flow-dropzone-plus add-flow-dropzone-plus-inline">
                            <i class="pi pi-plus"></i>
                          </span>
                        </div>
                      </template>
                      <template v-else>
                        <span class="add-flow-dropzone-plus" aria-hidden="true">
                          <i class="pi pi-plus"></i>
                        </span>
                        <div class="add-flow-dropzone-copy">
                          <strong>Přidat fotky</strong>
                          <span>Nahrát alespoň 1 fotografii</span>
                        </div>
                      </template>
                    </button>
                  </div>
                  <div v-if="addListingProceedAttempt && addListingPhotosError" class="add-flow-error">
                    Nahraj alespoň 1 fotografii.
                  </div>

                  <div class="add-flow-thumbs">
                    <div
                      v-for="idx in 4"
                      :key="`add-flow-thumb-${idx}`"
                      class="add-flow-thumb"
                      :class="{
                        'is-empty': !addListingDraft.photoSlots[idx - 1],
                        'is-dragover': dragOverPhotoIndex === idx - 1,
                        'is-main': idx === 1 && Boolean(addListingDraft.photoSlots[0]),
                      }"
                      :draggable="Boolean(addListingDraft.photoSlots[idx - 1])"
                      @dragstart="handlePhotoDragStart($event, idx - 1)"
                      @dragover.prevent="handlePhotoDragOver($event, idx - 1)"
                      @drop.prevent="handlePhotoDrop(idx - 1)"
                      @dragend="handlePhotoDragEnd"
                      @click="openAddListingPhotoPicker(idx - 1)"
                    >
                      <template v-if="addListingDraft.photoSlots[idx - 1]">
                        <img :src="addListingDraft.photoSlots[idx - 1]?.url" alt="Nahraná fotografie" loading="lazy" />
                        <button
                          type="button"
                          class="add-flow-thumb-main"
                          :class="{ 'is-active': idx === 1 }"
                          :aria-label="idx === 1 ? 'Hlavní fotka' : 'Nastavit jako hlavní'"
                          @click.stop="setMainAddListingPhoto(idx - 1)"
                        >
                          <i :class="['pi', idx === 1 ? 'pi-star-fill' : 'pi-star']"></i>
                        </button>
                        <button
                          type="button"
                          class="add-flow-thumb-remove"
                          aria-label="Odebrat fotografii"
                          @click.stop="removeAddListingPhoto(idx - 1)"
                        >
                          <i class="pi pi-times"></i>
                        </button>
                      </template>
                      <template v-else>
                        <i class="pi pi-image" aria-hidden="true"></i>
                      </template>
                    </div>
                  </div>
                </div>

                <div class="add-flow-section">
                  <div class="add-flow-section-title">Název vercajku</div>
                  <div class="add-flow-input" :class="{ 'is-error': addListingTitleError }">
                    <input
                      v-model="addListingDraft.title"
                      class="add-flow-native"
                      type="text"
                      placeholder="Co dnes pronajímáte?"
                    />
                  </div>
                  <div v-if="addListingProceedAttempt && addListingTitleError" class="add-flow-error">
                    Vyplň název vercajku.
                  </div>
                </div>

                <div class="add-flow-section">
                  <div class="add-flow-section-title">Kategorie</div>
                  <div class="add-flow-chips" :class="{ 'is-error': addListingCategoryError }">
                    <button
                      v-for="item in categories.filter((cat) => cat.id !== 'all')"
                      :key="`add-flow-cat-${item.id}`"
                      type="button"
                      class="add-flow-chip"
                      :class="{ 'is-active': addListingDraft.categoryId === item.id }"
                      @click="addListingDraft.categoryId = item.id"
                    >
                      {{ item.label }}
                    </button>
                  </div>
                  <div v-if="addListingProceedAttempt && addListingCategoryError" class="add-flow-error">
                    Vyber kategorii.
                  </div>
                </div>
              </div>

              <div v-else-if="addListingStep === 2" class="add-listing-body add-flow-step2">
                <div class="add-flow-section">
                  <div class="add-flow-section-title">Cena za den</div>
                  <div class="add-flow-input add-flow-input-suffix" :class="{ 'is-error': addListingPriceError }">
                    <input v-model.number="addListingDraft.pricePerDay" class="add-flow-native" type="number" min="0" placeholder="0" />
                    <span class="add-flow-suffix">Kč</span>
                  </div>
                  <div v-if="addListingProceedAttempt && addListingPriceError" class="add-flow-error">
                    Zadej cenu za den (alespoň 1 Kč).
                  </div>
                </div>

                <div class="add-flow-section">
                  <div class="add-flow-toggle-head">
                    <div class="add-flow-section-title">Vratná kauce</div>
                    <label class="add-flow-toggle">
                      <input v-model="addListingDraft.depositEnabled" type="checkbox" />
                      <span aria-hidden="true"></span>
                    </label>
                  </div>
                  <div class="add-flow-input add-flow-input-suffix" :class="{ 'is-error': addListingDepositError }">
                    <input
                      v-model.number="addListingDraft.depositAmount"
                      class="add-flow-native"
                      type="number"
                      min="0"
                      placeholder="0"
                      :disabled="!addListingDraft.depositEnabled"
                    />
                    <span class="add-flow-suffix">Kč</span>
                  </div>
                  <div v-if="addListingProceedAttempt && addListingDepositError" class="add-flow-error">
                    Zadej výši kauce (alespoň 1 Kč), nebo ji vypni.
                  </div>
                </div>

                <div class="add-flow-section">
                  <div class="add-flow-section-title">Dostupnost pro vypůjčení</div>
                  <div class="add-flow-calendar" :class="{ 'is-error': addListingAvailabilityError }">
                    <div class="add-flow-calendar-head">
                      <strong>{{ availabilityCalendar.label }}</strong>
                      <div class="add-flow-calendar-nav">
                        <button type="button" class="add-flow-calendar-btn" aria-label="Předchozí měsíc" @click="setAvailabilityMonth(-1)">
                          <i class="pi pi-chevron-left"></i>
                        </button>
                        <button type="button" class="add-flow-calendar-btn" aria-label="Další měsíc" @click="setAvailabilityMonth(1)">
                          <i class="pi pi-chevron-right"></i>
                        </button>
                      </div>
                    </div>
                    <div class="add-flow-calendar-week">
                      <span>Po</span><span>Út</span><span>St</span><span>Čt</span><span>Pá</span><span>So</span><span>Ne</span>
                    </div>
                    <div class="add-flow-calendar-grid">
                      <button
                        v-for="(cell, idx) in availabilityCalendar.cells"
                        :key="`avail-cell-${idx}`"
                        type="button"
                        class="add-flow-calendar-day"
                        :class="{ 'is-empty': !cell, 'is-selected': cell && isAvailabilitySelected(cell) }"
                        :disabled="!cell"
                        @click="cell && toggleAvailabilityDay(cell)"
                      >
                        {{ cell ?? "" }}
                      </button>
                    </div>
                  </div>
                  <div class="add-flow-help">
                    <span v-if="availabilityRangeStart">Vyberte poslední den rozmezí.</span>
                    <span v-else>Označte dny, nebo rozmezí: klepněte na první a poslední den.</span>
                  </div>
                  <div v-if="addListingProceedAttempt && addListingAvailabilityError" class="add-flow-error">
                    Vyber aspoň jeden den (nebo rozmezí) v kalendáři.
                  </div>
                </div>

                <div class="add-flow-section">
                  <div class="add-flow-section-title">Lokalita vercajku</div>
                  <div class="add-flow-radio">
                    <label class="add-flow-radio-item">
                      <input v-model="addListingDraft.locationMode" type="radio" value="profile" />
                      <span>Stejná jako v profilu</span>
                    </label>
                    <label class="add-flow-radio-item">
                      <input v-model="addListingDraft.locationMode" type="radio" value="custom" />
                      <span>Jiná adresa</span>
                    </label>
                  </div>
                  <div v-if="addListingDraft.locationMode === 'custom'" class="add-flow-address">
                    <div class="add-flow-input">
                      <input v-model="addListingDraft.customAddress.street" class="add-flow-native" type="text" placeholder="Ulice a číslo popisné" />
                    </div>
                    <div class="add-flow-address-row">
                      <div class="add-flow-input">
                        <input v-model="addListingDraft.customAddress.city" class="add-flow-native" type="text" placeholder="Město" />
                      </div>
                      <div class="add-flow-input">
                        <input v-model="addListingDraft.customAddress.zip" class="add-flow-native" type="text" placeholder="PSČ" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div v-else class="add-listing-body add-flow-step3">
                <div class="add-flow-section">
                  <div class="add-flow-section-title">Technické parametry</div>
                  <div class="add-flow-grid">
                    <div class="add-flow-field">
                      <span>Značka</span>
                      <div class="add-flow-input">
                        <input v-model="addListingDraft.brand" class="add-flow-native" type="text" placeholder="Např. Bosch, DeWalt..." />
                      </div>
                    </div>
                    <div class="add-flow-field">
                      <span>Model</span>
                      <div class="add-flow-input">
                        <input v-model="addListingDraft.model" class="add-flow-native" type="text" placeholder="Přesné označení modelu" />
                      </div>
                    </div>
                    <div class="add-flow-field">
                      <span>Výkon</span>
                      <div class="add-flow-input">
                        <input v-model="addListingDraft.power" class="add-flow-native" type="text" placeholder="Např. 1500W, 18V..." />
                      </div>
                    </div>
                    <div class="add-flow-field">
                      <span>Hmotnost</span>
                      <div class="add-flow-input">
                        <input v-model="addListingDraft.weight" class="add-flow-native" type="text" placeholder="Např. 2.5 kg" />
                      </div>
                    </div>
                    <div class="add-flow-field add-flow-field-full">
                      <span>Příslušenství</span>
                      <div class="add-flow-input">
                        <input v-model="addListingDraft.accessories" class="add-flow-native" type="text" placeholder="Např. kufr, náhradní baterie..." />
                      </div>
                    </div>
                    <div class="add-flow-field">
                      <span>Stav</span>
                      <div ref="conditionDropdownEl" class="add-flow-dropdown" :class="{ 'is-open': conditionDropdownOpen }">
                        <button
                          type="button"
                          class="add-flow-input add-flow-dropdown-trigger"
                          aria-label="Stav vercajku"
                          :aria-expanded="conditionDropdownOpen ? 'true' : 'false'"
                          @click="toggleConditionDropdown"
                        >
                          <span class="add-flow-dropdown-value">{{ selectedConditionDisplay }}</span>
                          <i class="pi pi-chevron-down" aria-hidden="true"></i>
                        </button>
                        <div v-if="conditionDropdownOpen" class="add-flow-dropdown-menu" role="listbox" aria-label="Vyber stav">
                          <button
                            v-for="option in conditionOptions"
                            :key="`condition-opt-${option.id}`"
                            type="button"
                            class="add-flow-dropdown-option"
                            :class="{ 'is-active': addListingDraft.condition === option.id }"
                            role="option"
                            @click="selectCondition(option.id)"
                          >
                            {{ option.label }} - {{ option.note }}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div class="add-flow-field add-flow-field-full">
                      <span>Další parametry</span>
                      <div class="add-flow-input add-flow-input-textarea">
                        <textarea v-model="addListingDraft.additionalParams" class="add-flow-native" rows="4" placeholder="Výkon, rozměry, hmotnost nebo jiné důležité specifikace..."></textarea>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="add-flow-section">
                  <div class="add-flow-section-title">Způsob vyzvednutí</div>
                  <div class="add-flow-checklist">
                    <label class="add-flow-check">
                      <input type="radio" v-model="addListingDraft.pickupMethods.mode" value="personal" name="pickup-mode" />
                      <span>Osobní vyzvednutí</span>
                    </label>
                    <label class="add-flow-check">
                      <input type="radio" v-model="addListingDraft.pickupMethods.mode" value="other" name="pickup-mode" />
                      <span>Jiné</span>
                    </label>
                    <div v-if="addListingDraft.pickupMethods.mode === 'other'" class="add-flow-field" style="margin-top: 0.5rem;">
                      <div class="add-flow-input add-flow-input-textarea" :class="{ 'is-invalid': addListingProceedAttempt && !addListingDraft.pickupMethods.otherPickupDescription.trim() }">
                        <textarea
                          v-model="addListingDraft.pickupMethods.otherPickupDescription"
                          class="add-flow-native"
                          placeholder="Upřesněte způsob (např. dovoz, zásilkovna...)"
                          rows="2"
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="add-flow-section">
                  <div class="add-flow-section-title">Pravidla a omezení</div>
                  <div class="add-flow-checklist">
                    <label class="add-flow-check">
                      <input v-model="addListingDraft.rules.noModifications" type="checkbox" />
                      <span>Zákaz provádění jakýchkoliv úprav na vercajku.</span>
                    </label>
                    <label class="add-flow-check">
                      <input v-model="addListingDraft.rules.purposeOnly" type="checkbox" />
                      <span>Užívání pouze pro účely, ke kterým je vercajk určen.</span>
                    </label>
                    <label class="add-flow-check">
                      <input v-model="addListingDraft.rules.noThirdParty" type="checkbox" />
                      <span>Zákaz pronájmu třetím stranám.</span>
                    </label>
                    <label class="add-flow-check">
                      <input v-model="addListingDraft.rules.depositForfeit" type="checkbox" />
                      <span>Propadnutí kauce v případě jakéhokoliv poškození.</span>
                    </label>
                    <label class="add-flow-check">
                      <input v-model="addListingDraft.rules.other" type="checkbox" />
                      <span>Jiné</span>
                    </label>
                    <div v-if="addListingDraft.rules.other" class="add-flow-field" style="margin-top: 0.5rem;">
                      <div class="add-flow-input add-flow-input-textarea" :class="{ 'is-invalid': addListingProceedAttempt && !addListingDraft.rules.otherDescription.trim() }">
                        <textarea
                          v-model="addListingDraft.rules.otherDescription"
                          class="add-flow-native"
                          placeholder="Popište vlastní pravidla (povinné)"
                          rows="3"
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="add-flow-cta">
                <button type="button" class="add-flow-cta-primary" @click="nextAddListingStep">
                  {{ addListingStep === 3 ? "Zveřejnit nabídku" : "Pokračovat" }}
                </button>
                <button type="button" class="add-flow-cta-ghost" @click="prevAddListingStep">Zpět</button>
              </div>
            </template>
          </PvCard>
        </div>

        <div v-else-if="screen === 'add-listing-confirmation'" class="screen-inner">
          <PvCard class="status-card">
            <template #content>
              <button
                class="status-card-eye"
                type="button"
                aria-label="Zobrazit nabídku"
                @click="publishedListingId ? openListing(publishedListingId) : setScreen('market')"
              >
                <i class="pi pi-eye"></i>
              </button>
              <span class="eyebrow">Nabídka zveřejněna</span>
              <h1>Hotovo</h1>
              <p>
                Nabídka je připravená v marketplace a přidali jsme ji i do tvého profilu.
              </p>
              <div class="status-actions">
                <PvButton
                  class="button-primary"
                  @click="publishedListingId ? openListing(publishedListingId) : setScreen('market')"
                >
                  Zobrazit nabídku
                  <i class="pi pi-arrow-right"></i>
                </PvButton>
                <PvButton
                  class="button-secondary"
                  @click="
                    profileListTab = 'offers';
                    setScreen('profile-list');
                  "
                >
                  Do profilu
                </PvButton>
              </div>
            </template>
          </PvCard>
        </div>

        <div v-else-if="screen === 'request'" class="screen-inner">
          <PvCard class="request-card">
            <template #content>
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
            </template>
          </PvCard>
        </div>

        <div v-else-if="screen === 'status'" class="screen-inner">
          <PvCard class="status-card">
            <template #content>
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
            </template>
          </PvCard>
        </div>

        <div v-else-if="screen === 'profile'" class="screen-inner profile-page">
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
            <details class="profile-panel">
              <summary class="profile-panel-head">
                <span class="profile-panel-title">
                  <i class="pi pi-tag"></i>
                  <strong>Moje nabídky</strong>
                </span>
                <span class="profile-count">{{ profileOffers.length }}</span>
              </summary>
              <div class="profile-panel-list">
              <button
                v-for="offer in activeProfileOffers.slice(0, 3)"
                :key="offer.id"
                class="profile-item"
                type="button"
                @click="
                  offer.statusLabel === 'Čeká na hodnocení'
                    ? openRatingFlow('owner')
                    : openPendingOffer(offer)
                "
              >
                <div class="profile-item-copy">
                  <span class="profile-item-title">{{ offer.title }}</span>
                  <span class="profile-item-meta">{{ offer.location }} · {{ offer.dateRange }}</span>
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
                <div v-if="!activeProfileOffers.length" class="profile-empty">Zatím nic nenabízíš.</div>
              </div>
            </details>

            <details class="profile-panel">
              <summary class="profile-panel-head">
                <span class="profile-panel-title">
                  <i class="pi pi-inbox"></i>
                  <strong>Moje poptávky</strong>
                </span>
                <span class="profile-count">{{ profileRequests.length }}</span>
              </summary>
              <div class="profile-panel-list">
                <button
                  v-for="request in activeProfileRequests.slice(0, 3)"
                  :key="request.id"
                  class="profile-item"
                  :class="{
                    'is-dimmed':
                      request.statusLabel === 'Pronájem ukončen' ||
                      request.statusLabel === 'Zamítnutí' ||
                      request.statusLabel === 'Zrušeno',
                  }"
                  type="button"
                  @click="
                    request.statusLabel === 'Čeká na hodnocení'
                      ? openRatingFlow('tenant')
                      : isRequestReservationStatus(request.statusLabel)
                        ? openPendingRequest(request)
                        : openListing(request.id)
                  "
                >
                <div class="profile-item-copy">
                  <span class="profile-item-title">{{ request.title }}</span>
                  <span class="profile-item-meta">
                    {{ request.location }} · {{ request.dateRange }}
                  </span>
                </div>
                <div class="profile-item-side">
                  <span class="profile-item-status" :class="request.statusTone">
                    {{ request.statusLabel }}
                  </span>
                </div>
                </button>
                <button
                  class="profile-panel-link profile-panel-link-inline"
                  type="button"
                  @click="openProfileListPage('requests')"
                >
                  Zobrazit vše
                </button>
                <div v-if="!activeProfileRequests.length" class="profile-empty">Zatím nic nepoptáváš.</div>
              </div>
            </details>
          </div>

          <div class="profile-section">
            <span class="profile-section-label">Správa profilu</span>
            <div class="profile-list">
              <button class="profile-list-item" type="button" @click="openProfilePersonal">
                <i class="pi pi-user"></i>
                <span>Osobní údaje</span>
                <i class="pi pi-chevron-right"></i>
              </button>
              <button class="profile-list-item" type="button" @click="openProfilePayments">
                <i class="pi pi-credit-card"></i>
                <span>Platební metody</span>
                <i class="pi pi-chevron-right"></i>
              </button>
              <button class="profile-list-item" type="button" @click="openProfileSecurity">
                <i class="pi pi-lock"></i>
                <span>Zabezpečení</span>
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
              <button class="profile-list-item" type="button" @click="openProfileLanguage">
                <i class="pi pi-globe"></i>
                <span>Jazyk a měna</span>
                <i class="pi pi-chevron-right"></i>
              </button>
              <button class="profile-list-item" type="button" @click="openHelp">
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

        <div v-else-if="screen === 'profile-language'" class="screen-inner profile-page">
          <div class="profile-section">
            <span class="profile-section-label">Jazyk aplikace</span>
            <div class="profile-list">
              <button 
                v-for="lang in [{id:'cz', label:'Čeština', flag:'🇨🇿'}, {id:'sk', label:'Slovenčina', flag:'🇸🇰'}, {id:'en', label:'English', flag:'🇬🇧'}]" 
                :key="lang.id"
                type="button" 
                class="profile-list-item card-item-static"
                style="cursor: pointer;"
                @click="settings.language = lang.id"
              >
                <div class="card-item-info">
                  <span style="font-size: 1.2rem; width: 24px; display: grid; place-items: center;">{{ lang.flag }}</span>
                  <div class="card-item-text">
                    <strong>{{ lang.label }}</strong>
                  </div>
                </div>
                <i v-if="settings.language === lang.id" class="pi pi-check" style="color: var(--brand-2); font-weight: bold;"></i>
              </button>
            </div>
          </div>

          <div class="profile-section">
            <span class="profile-section-label">Preferovaná měna</span>
            <div class="profile-list">
              <button 
                v-for="curr in [{id:'CZK', label:'Koruna česká (Kč)'}, {id:'EUR', label:'Euro (€)'}]" 
                :key="curr.id"
                type="button" 
                class="profile-list-item card-item-static"
                style="cursor: pointer;"
                @click="settings.currency = curr.id"
              >
                <div class="card-item-info">
                  <i class="pi pi-money-bill" style="font-size: 1.2rem; color: var(--brand);"></i>
                  <div class="card-item-text">
                    <strong>{{ curr.label }}</strong>
                  </div>
                </div>
                <i v-if="settings.currency === curr.id" class="pi pi-check" style="color: var(--brand-2); font-weight: bold;"></i>
              </button>
            </div>
          </div>
          
          <div class="profile-actions" style="margin-top: 12px;">
             <button class="button-primary" @click="goBack">Uložit a zpět</button>
          </div>
        </div>

        <div v-else-if="screen === 'profile-security'" class="screen-inner profile-page">
          <div class="profile-section">
            <span class="profile-section-label">Změna hesla</span>
            <div class="profile-panel">
              <div class="auth-form">
                <div class="field">
                  <label>Současné heslo</label>
                  <div class="input-shell">
                    <i class="pi pi-lock input-icon"></i>
                    <input v-model="securityForm.currentPassword" :type="showSecurityPasswords ? 'text' : 'password'" class="auth-input" placeholder="••••••••" />
                    <button class="input-action" type="button" @click="showSecurityPasswords = !showSecurityPasswords">
                      <i :class="['pi', showSecurityPasswords ? 'pi-eye-slash' : 'pi-eye']"></i>
                    </button>
                  </div>
                </div>
                <div class="field">
                  <label>Nové heslo</label>
                  <div class="input-shell">
                    <i class="pi pi-lock input-icon"></i>
                    <input v-model="securityForm.newPassword" :type="showSecurityPasswords ? 'text' : 'password'" class="auth-input" placeholder="••••••••" />
                    <button class="input-action" type="button" @click="showSecurityPasswords = !showSecurityPasswords">
                      <i :class="['pi', showSecurityPasswords ? 'pi-eye-slash' : 'pi-eye']"></i>
                    </button>
                  </div>
                  <div class="password-rules" style="margin-top: 8px;">
                    <div
                      v-for="rule in securityPasswordRules"
                      :key="rule.label"
                      class="password-rule"
                      :class="{ 'is-ok': rule.ok }"
                    >
                      <span class="password-rule-dot" />
                      <span>{{ rule.label }}</span>
                    </div>
                  </div>
                </div>
                <div class="field">
                  <label>Potvrzení nového hesla</label>
                  <div class="input-shell">
                    <i class="pi pi-lock input-icon"></i>
                    <input v-model="securityForm.confirmPassword" :type="showSecurityPasswords ? 'text' : 'password'" class="auth-input" placeholder="••••••••" />
                    <button class="input-action" type="button" @click="showSecurityPasswords = !showSecurityPasswords">
                      <i :class="['pi', showSecurityPasswords ? 'pi-eye-slash' : 'pi-eye']"></i>
                    </button>
                  </div>
                </div>
                <div class="profile-actions" style="margin-top: 8px;">
                  <button 
                    class="button-primary" 
                    style="height: 48px; width: 100%;" 
                    :disabled="securityForm.isChangingPassword || !securityForm.newPassword"
                    @click="changePassword"
                  >
                    <i v-if="securityForm.isChangingPassword" class="pi pi-spin pi-spinner"></i>
                    {{ securityForm.isChangingPassword ? 'Ukládám...' : 'Aktualizovat heslo' }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="profile-section">
            <span class="profile-section-label">Extra zabezpečení</span>
            <div class="profile-list">
              <button 
                type="button" 
                class="profile-list-item card-item-static" 
                style="width: 100%; text-align: left; background: transparent; cursor: pointer; border: 0;"
                @click="!securityForm.twoFactorEnabled ? start2FASetup() : disable2FA()"
              >
                <div class="card-item-info">
                  <i class="pi pi-shield"></i>
                  <div class="card-item-text">
                    <strong>Dvoufázové ověření (2FA)</strong>
                    <span>{{ securityForm.twoFactorEnabled ? 'Aktivní' : 'Zvýší ochranu tvého účtu' }}</span>
                  </div>
                </div>
                <PvInputSwitch 
                  :modelValue="securityForm.twoFactorEnabled" 
                  style="pointer-events: none;"
                />
              </button>
            </div>
          </div>
          
          <div class="profile-section">
            <span class="profile-section-label">Přístup</span>
            <button class="profile-list-item" type="button" @click="requestLogoutAll" style="color: var(--danger);">
              <i class="pi pi-sign-out"></i>
              <span>Odhlásit se ze všech zařízení</span>
              <i class="pi pi-chevron-right"></i>
            </button>
          </div>
        </div>

        <div v-else-if="screen === 'profile-payments'" class="screen-inner profile-page">
          <div class="profile-section">
            <span class="profile-section-label">Tvoje karty</span>
            <div class="profile-list">
              <div v-for="card in cardForm.savedCards" :key="card.id" class="profile-list-item card-item-static">
                <div class="card-item-info">
                  <i class="pi pi-credit-card"></i>
                  <div class="card-item-text">
                    <strong>{{ card.brand }} •••• {{ card.last4 }}</strong>
                    <span>Platnost {{ card.expiry }}</span>
                  </div>
                </div>
                <button type="button" class="card-remove-btn" @click="requestRemoveCard(card.id)" aria-label="Odstranit kartu">
                  <i class="pi pi-trash"></i>
                </button>
              </div>
              <div v-if="!cardForm.savedCards.length" class="profile-empty">Nemáte žádné uložené karty.</div>
            </div>
          </div>

          <div v-if="!isAddingCard" class="profile-section">
            <button class="button-secondary" type="button" @click="isAddingCard = true">
              <i class="pi pi-plus"></i>
              Přidat novou kartu
            </button>
          </div>

          <div v-else class="profile-section">
            <span class="profile-section-label">Nová karta</span>
            <div class="profile-panel">
              <div class="payment-fields">
                <div class="field">
                  <label>Číslo karty</label>
                  <div class="input-shell">
                    <input v-model="newCardData.number" class="auth-input" placeholder="0000 0000 0000 0000" maxlength="16" />
                  </div>
                </div>
                <div class="field-row">
                  <div class="field">
                    <label>Platnost</label>
                    <div class="input-shell">
                      <input v-model="newCardData.expiry" class="auth-input" placeholder="MM/RR" maxlength="5" />
                    </div>
                  </div>
                  <div class="field">
                    <label>CVC</label>
                    <div class="input-shell">
                      <input v-model="newCardData.cvc" class="auth-input" placeholder="000" maxlength="3" />
                    </div>
                  </div>
                </div>
              </div>
              <div class="profile-actions" style="margin-top: 16px;">
                <PvButton class="button-primary" @click="addNewCard">Uložit kartu</PvButton>
                <PvButton class="button-ghost" @click="isAddingCard = false">Zrušit</PvButton>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="screen === 'profile-personal'" class="screen-inner profile-page">
          <div class="profile-section">
            <div class="personal-photo-wrap">
              <div class="personal-photo-circle">
                <span v-if="personal.photo">{{ personal.photo }}</span>
                <span v-else>FOTO</span>
              </div>
              <button type="button" class="personal-photo-edit" @click="openPersonalPhotoEditor">
                Upravit
              </button>
            </div>
            <div class="profile-personal-form">
              <div class="personal-field">
                <span class="personal-field-label">Jméno</span>
                <div class="personal-field-box">
                  <span class="personal-field-value">{{ personal.firstName || "—" }}</span>
                  <button
                    type="button"
                    class="personal-field-edit"
                    aria-label="Upravit jméno"
                    @click="openPersonalEdit('firstName')"
                  >
                    <i class="pi pi-pencil"></i>
                  </button>
                </div>
              </div>

              <div class="personal-field">
                <span class="personal-field-label">Příjmení</span>
                <div class="personal-field-box">
                  <span class="personal-field-value">{{ personal.lastName || "—" }}</span>
                  <button
                    type="button"
                    class="personal-field-edit"
                    aria-label="Upravit příjmení"
                    @click="openPersonalEdit('lastName')"
                  >
                    <i class="pi pi-pencil"></i>
                  </button>
                </div>
              </div>

              <div class="personal-field">
                <span class="personal-field-label">E-mail</span>
                <div class="personal-field-box">
                  <span class="personal-field-value">{{ personal.email || "—" }}</span>
                  <button
                    type="button"
                    class="personal-field-edit"
                    aria-label="Upravit e-mail"
                    @click="openPersonalEdit('email')"
                  >
                    <i class="pi pi-pencil"></i>
                  </button>
                </div>
                <button
                  v-if="!personal.emailVerified"
                  type="button"
                  class="personal-verify-link"
                  @click="verifyEmail"
                >
                  Ověřit e-mail
                </button>
                <div v-else class="personal-verified-row">
                  <i class="pi pi-check-circle"></i>
                  Ověřeno
                </div>
              </div>

              <div class="personal-field">
                <span class="personal-field-label">Telefon</span>
                <div class="personal-field-box">
                  <span class="personal-field-value">{{ personal.phone || "—" }}</span>
                  <button
                    type="button"
                    class="personal-field-edit"
                    aria-label="Upravit telefon"
                    @click="openPersonalEdit('phone')"
                  >
                    <i class="pi pi-pencil"></i>
                  </button>
                </div>
                <button
                  v-if="!personal.phoneVerified"
                  type="button"
                  class="personal-verify-link"
                  @click="verifyPhone"
                >
                  Ověřit telefon
                </button>
                <div v-else class="personal-verified-row">
                  <i class="pi pi-check-circle"></i>
                  Telefon ověřen
                </div>
              </div>

              <div class="personal-field">
                <span class="personal-field-label">Adresa</span>
                <div class="personal-field-box">
                  <span class="personal-field-value">{{ personal.address || "—" }}</span>
                  <button
                    type="button"
                    class="personal-field-edit"
                    aria-label="Upravit adresu"
                    @click="openPersonalEdit('address')"
                  >
                    <i class="pi pi-pencil"></i>
                  </button>
                </div>
              </div>

              <div class="profile-personal-actions">
                <PvButton class="button-primary" @click="savePersonalChanges">Uložit změny</PvButton>
                <div v-if="personal.saved" class="profile-personal-saved">Uloženo</div>
              </div>
            </div>
          </div>

          <div v-if="personalEditOpen" class="confirm-modal">
            <button
              class="confirm-modal-backdrop"
              type="button"
              @click="closePersonalEdit"
              aria-label="Zavřít úpravu"
            ></button>
            <div class="confirm-modal-card">
              <p class="confirm-modal-title">Upravit {{ personalEditMeta.label.toLowerCase() }}</p>
              <div class="confirm-modal-field">
                <label :for="`personal-edit-${personalEditField ?? 'field'}`">{{ personalEditMeta.label }}</label>
                <input
                  :id="`personal-edit-${personalEditField ?? 'field'}`"
                  v-model="personalEditValue"
                  class="native-input"
                  :type="personalEditMeta.type"
                  :placeholder="personalEditMeta.placeholder"
                />
                <p
                  v-if="personalEditField === 'email' || personalEditField === 'phone'"
                  class="confirm-modal-copy"
                >
                  Při změně
                  {{ personalEditField === "email" ? "e-mailu" : "telefonu" }},
                  proběhne nové ověření.
                </p>
              </div>
              <div class="confirm-modal-actions">
                <button type="button" class="confirm-modal-primary" @click="savePersonalEdit">
                  Uložit
                </button>
                <button type="button" class="confirm-modal-ghost" @click="closePersonalEdit">
                  Zpět
                </button>
              </div>
            </div>
          </div>

          <div v-if="personalPhotoOpen" class="confirm-modal">
            <button
              class="confirm-modal-backdrop"
              type="button"
              @click="closePersonalPhotoEditor"
              aria-label="Zavřít úpravu fotky"
            ></button>
            <div class="confirm-modal-card">
              <p class="confirm-modal-title">Upravit foto</p>
              <p class="confirm-modal-copy">Pro demo můžeš použít iniciálu nebo foto vyčistit.</p>
              <div class="confirm-modal-actions">
                <button type="button" class="confirm-modal-primary" @click="setPhotoFromInitial">
                  Použít iniciálu
                </button>
                <button type="button" class="confirm-modal-ghost" @click="clearPhoto">
                  Odstranit foto
                </button>
                <button type="button" class="confirm-modal-ghost" @click="closePersonalPhotoEditor">
                  Zpět
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="screen === 'help'" class="screen-inner profile-page help-page">
          <div class="help-search">
            <i class="pi pi-search"></i>
            <input
              v-model="helpQuery"
              class="native-input"
              type="text"
              placeholder="Jak ti můžeme pomoci?"
            />
          </div>

          <div class="help-section">
            <span class="help-section-label">Časté dotazy</span>
            <div class="help-faq">
              <button
                v-for="item in filteredHelpFaq"
                :key="item.id"
                type="button"
                class="help-faq-item"
                @click="openHelpDetail(item.id)"
              >
                <span>{{ item.title }}</span>
                <i class="pi pi-chevron-right"></i>
              </button>
            </div>
          </div>

          <div class="help-contact">
            <button type="button" class="help-contact-card" @click="openHelpContact">
              <i class="pi pi-comment"></i>
              <span>Napiš nám</span>
            </button>
            <button type="button" class="help-contact-card">
              <i class="pi pi-phone"></i>
              <span>Zavolej nám</span>
            </button>
          </div>        </div>

        <div v-else-if="screen === 'help-contact'" class="screen-inner profile-page">
          <div class="profile-section">
            <span class="profile-section-label">Napište nám</span>
            <div class="profile-panel">
              <div class="auth-form">
                <div class="field">
                  <label>Téma zprávy</label>
                  <div class="input-shell">
                    <select v-model="contactForm.topic" class="auth-input" style="appearance: none; background: transparent; border: 0;">
                      <option>Průběh výpůjčky</option>
                      <option>Problém s platbou</option>
                      <option>Technická chyba</option>
                      <option>Jiný dotaz</option>
                    </select>
                    <i class="pi pi-chevron-down" style="font-size: 0.8rem; opacity: 0.5;"></i>
                  </div>
                </div>
                <div class="field">
                  <label>Vaše zpráva</label>
                  <div class="add-flow-input add-flow-input-textarea">
                    <textarea 
                      v-model="contactForm.message" 
                      class="add-flow-native" 
                      rows="6" 
                      placeholder="Popište nám, s čím vám můžeme pomoci..."
                    ></textarea>
                  </div>
                </div>
                <div class="profile-actions" style="margin-top: 12px;">
                  <button 
                    class="button-primary" 
                    style="height: 52px; width: 100%;" 
                    :disabled="contactForm.isSending || !contactForm.message.trim()"
                    @click="submitContact"
                  >
                    <i v-if="contactForm.isSending" class="pi pi-spin pi-spinner"></i>
                    {{ contactForm.isSending ? 'Odesílám...' : 'Odeslat zprávu' }}
                  </button>
                  <button class="button-ghost" @click="goBack">Zrušit</button>
                </div>
              </div>
            </div>
          </div>
          
          <div class="profile-section">
            <p style="text-align: center; color: var(--muted); font-size: 0.9rem; line-height: 1.5;">
              Odpovíme vám na e-mailovou adresu, kterou máte registrovanou u svého profilu.
            </p>
          </div>
        </div>

        <div v-else-if="screen === 'help-detail'" class="screen-inner profile-page help-detail-page">
          <div class="help-detail">
            <h1>{{ selectedHelpFaq?.title ?? "Nápověda" }}</h1>
            <div v-if="selectedHelpFaq" class="help-detail-copy">
              <p v-for="(paragraph, idx) in selectedHelpFaq.body" :key="`${selectedHelpFaq.id}-${idx}`">
                {{ paragraph }}
              </p>
            </div>

            <div class="help-detail-feedback">
              <span>Pomohla ti tato odpověď?</span>
              <div class="help-detail-actions">
                <button
                  type="button"
                  class="help-detail-button"
                  :class="{ 'is-active': helpFeedback === 'yes' }"
                  @click="helpFeedback = 'yes'"
                >
                  <i class="pi pi-thumbs-up"></i>
                  Ano
                </button>
                <button
                  type="button"
                  class="help-detail-button"
                  :class="{ 'is-active': helpFeedback === 'no' }"
                  @click="helpFeedback = 'no'"
                >
                  <i class="pi pi-thumbs-down"></i>
                  Ne
                </button>
              </div>
              <button type="button" class="help-detail-link" @click="setScreen('help')">
                Kontaktovat podporu
              </button>
            </div>
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
      <button class="bottom-nav-center" type="button" @click="openAddListing" aria-label="Přidat nabídku">
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

    <div v-if="cardToDelete" class="modal-overlay" @click.self="cardToDelete = null">
      <div class="modal-card">
        <div class="modal-head">
          <h2>Odstranit kartu?</h2>
          <p>Opravdu chcete tuto kartu trvale odstranit?</p>
        </div>
        <div class="modal-footer" style="display: flex; gap: 10px; margin-top: 20px;">
          <button class="button-secondary" style="flex: 1;" @click="cardToDelete = null">Zrušit</button>
          <button class="button-primary" style="flex: 1; background: var(--danger);" @click="confirmRemoveCard">Odstranit</button>
        </div>
      </div>
    </div>

    <!-- 2FA Setup Modal -->
    <div v-if="securityForm.isSetupOpen" class="modal-overlay" @click.self="close2FASetup">
      <div class="modal-card 2fa-setup-card">
        <div class="modal-head">
          <span class="eyebrow" v-if="securityForm.twoFactorStep < 4">Krok {{ securityForm.twoFactorStep }} ze 3</span>
          <h2>Nastavení 2FA</h2>
        </div>

        <!-- Step 1: Password Verification -->
        <div v-if="securityForm.twoFactorStep === 1" class="setup-content">
          <p>Pro pokračování prosím zadejte své heslo.</p>
          <div class="field" style="margin-top: 16px;">
            <div class="input-shell">
              <i class="pi pi-lock input-icon"></i>
              <input v-model="securityForm.twoFactorPassword" type="password" class="auth-input" placeholder="Heslo (demo1234)" />
            </div>
          </div>
          <div class="modal-footer" style="margin-top: 24px;">
            <PvButton class="button-primary w-full" @click="verify2FAPassword">Pokračovat</PvButton>
          </div>
        </div>

        <!-- Step 2: Method Selection -->
        <div v-else-if="securityForm.twoFactorStep === 2" class="setup-content">
          <p>Vyberte metodu druhého faktoru:</p>
          <div class="method-options" style="display: grid; gap: 12px; margin-top: 20px;">
            <button class="method-option-card" @click="select2FAMethod('app')">
              <i class="pi pi-mobile"></i>
              <div class="method-text">
                <strong>Autentizační aplikace</strong>
                <span>Google Authenticator, Authy atd.</span>
              </div>
            </button>
            <button class="method-option-card" @click="select2FAMethod('sms')">
              <i class="pi pi-comment"></i>
              <div class="method-text">
                <strong>SMS zpráva</strong>
                <span>Kód zaslaný na váš telefon</span>
              </div>
            </button>
          </div>
        </div>

        <!-- Step 3: Setup (App or SMS) -->
        <div v-else-if="securityForm.twoFactorStep === 3" class="setup-content">
          <template v-if="securityForm.twoFactorMethod === 'app'">
            <div class="qr-placeholder" style="width: 160px; height: 160px; background: #eee; margin: 0 auto; display: grid; place-items: center; border-radius: 12px;">
              <i class="pi pi-qrcode" style="font-size: 100px; color: #333;"></i>
            </div>
            <p style="text-align: center; margin-top: 16px; font-size: 0.9rem;">Naskenujte QR kód ve své aplikaci a zadejte 6místný kód.</p>
          </template>
          <template v-else>
            <div class="field">
              <label>Telefonní číslo</label>
              <div class="input-shell">
                <input v-model="securityForm.twoFactorPhone" class="auth-input" placeholder="+420 777 666 555" />
              </div>
            </div>
            <p style="margin-top: 12px; font-size: 0.9rem;">Zašleme vám SMS s potvrzovacím kódem.</p>
          </template>

          <div class="field" style="margin-top: 20px;">
            <label>Ověřovací kód</label>
            <div class="input-shell">
              <input v-model="securityForm.twoFactorCode" class="auth-input" placeholder="000 000" maxlength="6" style="text-align: center; letter-spacing: 4px; font-weight: 800;" />
            </div>
          </div>
          
          <div class="modal-footer" style="margin-top: 24px;">
            <button class="button-primary w-full" @click="complete2FASetup">Dokončit nastavení</button>
          </div>
        </div>

        <!-- Step 4: Success -->
        <div v-else-if="securityForm.twoFactorStep === 4" class="setup-content success-view" style="text-align: center;">
          <div class="success-icon" style="width: 64px; height: 64px; background: var(--brand-2); color: #fff; border-radius: 50%; display: grid; place-items: center; margin: 0 auto 20px;">
            <i class="pi pi-check" style="font-size: 2rem;"></i>
          </div>
          <h3>2FA bylo aktivováno</h3>
          <p>Váš účet je nyní lépe chráněn.</p>
          <div class="modal-footer" style="margin-top: 24px;">
            <button class="button-primary w-full" @click="close2FASetup">Hotovo</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirm Logout All Modal -->
    <div v-if="confirmLogoutAllOpen" class="modal-overlay" @click.self="confirmLogoutAllOpen = false">
      <div class="modal-card">
        <div class="modal-head">
          <h2>Odhlásit ze všech zařízení?</h2>
          <p>Budete odhlášeni na tomto i na všech ostatních zařízeních, kde jste přihlášeni.</p>
        </div>
        <div class="modal-footer" style="display: flex; gap: 10px; margin-top: 20px;">
          <button class="button-secondary" style="flex: 1;" @click="confirmLogoutAllOpen = false">Zrušit</button>
          <button class="button-primary" style="flex: 1; background: var(--danger);" @click="confirmLogoutAll">Odhlásit vše</button>
        </div>
      </div>
    </div>
  </div>
</template>
