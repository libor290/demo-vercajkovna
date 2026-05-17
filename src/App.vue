<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, nextTick, reactive, ref, watch } from "vue";
import { categories, listings, conversations as initialConversations, chatStatusMeta, type Listing, type Conversation, type ChatMessage, type ChatStatusType } from "@/data/mockData";

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
  | "profile-notifications"
  | "profile-privacy"
  | "help"
  | "help-detail"
  | "help-contact"
  | "profile-list"
  | "public-profile-list"
  | "public-profile-reviews"
  | "onboarding"
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
  | "chat"
  | "chat-detail"
  | "profile";
type AuthMode = "login" | "register" | "forgot";

const AUTH_KEY = "vercajkovna-authenticated";
const USER_KEY = "vercajkovna-user";
const PERSONAL_KEY = "vercajkovna-personal";
const SCREEN_KEY = "vercajkovna-screen";
const REMEMBER_KEY = "vercajkovna-remember";
const FAVORITES_KEY = "vercajkovna-favorites";
const ONBOARDED_KEY = "vercajkovna-onboarded";

const forgotSuccess = ref(false);
const resendTimer = ref(0);
const registerNameModalOpen = ref(false);
const registerNameConfirmed = ref(false);
let timerInterval: number | null = null;

const startResendTimer = () => {
  resendTimer.value = 30;
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = window.setInterval(() => {
    if (resendTimer.value > 0) {
      resendTimer.value--;
    } else {
      if (timerInterval) clearInterval(timerInterval);
    }
  }, 1000);
};

onBeforeUnmount(() => {
  if (timerInterval) clearInterval(timerInterval);
});

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

const authSubheadingVariations = [
  "aku vrtačku, vozík nebo reproduktor?",
  "laser, lešení nebo pořádné kladivo?",
  "gril, stan nebo vysokotlaký čistič?",
  "přímočarou pilu, žebřík nebo kompresor?",
  "brusku, horkovzdušnou pistoli nebo měřák?",
  "sekačku, křovinořez nebo zahradní nůžky?",
  "střešní box, nosič kol nebo autostan?",
];
const randomAuthIndex = Math.floor(Math.random() * authSubheadingVariations.length);
const selectedAuthSubheading = authSubheadingVariations[randomAuthIndex];

const isAuthReady = computed(() => {
  if (authMode.value === "login") {
    return auth.email.trim() !== "" && auth.password.trim() !== "";
  } else if (authMode.value === "forgot") {
    return auth.email.trim() !== "";
  } else {
    return (
      auth.name.trim() !== "" &&
      auth.email.trim() !== "" &&
      auth.password.trim() !== "" &&
      auth.confirmPassword.trim() !== "" &&
      auth.terms
    );
  }
});

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
  bio: (rememberedPersonal as any)?.bio ?? "",
  saved: false,
});
const personalEditOpen = ref(false);
const personalEditField = ref<"firstName" | "lastName" | "email" | "phone" | "address" | "bio" | null>(null);
const personalSnapshot = reactive({ firstName: personal.firstName, lastName: personal.lastName, bio: personal.bio });
const personalDirty = computed(() =>
  personal.firstName !== personalSnapshot.firstName ||
  personal.lastName !== personalSnapshot.lastName ||
  personal.bio !== personalSnapshot.bio
);
const personalUnsavedOpen = ref(false);
let personalUnsavedTarget: Screen | null = null;
const addressSuggestions = ref<string[]>([]);
const MOCK_ADDRESSES = [
  "Dlouhá 12, Praha 1", "Náměstí Míru 5, Praha 2", "Vinohradská 48, Praha 2",
  "Korunní 32, Praha 2", "Mánesova 18, Praha 2", "Blanická 7, Praha 2",
  "Jugoslávská 14, Praha 2", "Londýnská 26, Praha 2", "Štefánikova 22, Praha 5",
  "Náměstí 14. října 3, Praha 5", "Plzeňská 66, Praha 5", "Radlická 10, Praha 5",
  "Veleslavínská 4, Praha 6", "Evropská 33, Praha 6", "Jugoslávských partyzánů 8, Praha 6",
  "Milady Horákové 19, Praha 7", "Nábřeží Kapitána Jaroše 3, Praha 7", "Letohradská 11, Praha 7",
  "Sokolovská 55, Praha 8", "Zenklova 28, Praha 8", "Ústecká 6, Praha 8",
  "Prosecká 5, Praha 9", "Vysočanská 14, Praha 9", "Kolbenova 34, Praha 9",
  "Příční 8, Brno-střed", "Náměstí Svobody 15, Brno", "Masarykova 23, Brno",
  "Lidická 45, Brno", "Veveří 30, Brno", "Husova 12, Brno",
  "Smetanovo nábřeží 2, Ostrava", "Puchmajerova 7, Ostrava", "Hlavní třída 55, Ostrava",
  "Americká 12, Plzeň", "Klatovská 31, Plzeň", "Husova 10, Plzeň",
  "Smetanovo náměstí 4, Liberec", "Palachova 5, Liberec",
  "Palackého 8, Hradec Králové", "Eliščino nábřeží 12, Hradec Králové",
];
function onAddressInput(val: string) {
  personalEditValue.value = val;
  if (val.length >= 3) {
    const q = val.toLowerCase();
    addressSuggestions.value = MOCK_ADDRESSES
      .filter(a => a.toLowerCase().includes(q))
      .slice(0, 5);
  } else {
    addressSuggestions.value = [];
  }
}
function selectAddress(addr: string) {
  personalEditValue.value = addr;
  addressSuggestions.value = [];
}
function clearAddressSuggestions() {
  window.setTimeout(() => { addressSuggestions.value = []; }, 150);
}
const personalEditValue = ref("");
const personalPhotoOpen = ref(false);

const helpQuery = ref("");
const helpSelectedId = ref<string | null>(null);

const notifCenterOpen = ref(false);
const appNotifications = ref([
  { id: 'n1', icon: 'pi-inbox',        tone: 'orange', text: 'Tomáš chce půjčit tvou Festool TS 55',    group: 'Dnes',       unread: true  },
  { id: 'n2', icon: 'pi-check-circle', tone: 'green',  text: 'Tvoje rezervace Makita 18V byla schválena', group: 'Dnes',     unread: true  },
  { id: 'n3', icon: 'pi-comment',      tone: 'muted',  text: 'Lucie K.: Vrátím ještě dneska do 18',    group: 'Dnes',       unread: true  },
  { id: 'n4', icon: 'pi-credit-card',  tone: 'green',  text: 'Platba 1 350 Kč byla potvrzena',          group: 'Včera',      unread: false },
  { id: 'n5', icon: 'pi-star',         tone: 'yellow', text: 'Pavel ti zanechal hodnocení ★ 4.9',        group: 'Včera',      unread: false },
  { id: 'n6', icon: 'pi-replay',       tone: 'green',  text: 'Vrácení Kärcher K5 potvrzeno',             group: 'Včera',      unread: false },
  { id: 'n7', icon: 'pi-inbox',        tone: 'orange', text: 'Jana chce půjčit tvůj Bosch laser',        group: 'Tento týden', unread: false },
  { id: 'n8', icon: 'pi-times-circle', tone: 'red',    text: 'Žádost o Hilti TE 500 byla zamítnuta',     group: 'Tento týden', unread: false },
  { id: 'n9', icon: 'pi-comment',      tone: 'muted',  text: 'Michal D.: Jsou baterie nabité?',          group: 'Tento týden', unread: false },
]);
const notifGroups = computed(() => {
  const groups = ['Dnes', 'Včera', 'Tento týden'];
  return groups.map(g => ({
    label: g,
    items: appNotifications.value.filter(n => n.group === g),
  })).filter(g => g.items.length > 0);
});
const unreadNotifCount = computed(() => appNotifications.value.filter(n => n.unread).length);
function openNotifCenter() {
  notifCenterOpen.value = true;
  // Badge zmizí hned po otevření
  appNotifications.value.forEach(n => n.unread = false);
}
function closeNotifCenter() { notifCenterOpen.value = false; }
function clearAllNotifs() { appNotifications.value = []; }
function removeNotif(id: string) { appNotifications.value = appNotifications.value.filter(n => n.id !== id); }
const helpExpandedId = ref<string | null>(null);
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
  if (field === "firstName") return { label: "Jméno", type: "text", placeholder: "Např. Tomáš", textarea: false };
  if (field === "lastName") return { label: "Příjmení", type: "text", placeholder: "Např. Novák", textarea: false };
  if (field === "email") return { label: "E-mail", type: "email", placeholder: "tomas@email.cz", textarea: false };
  if (field === "phone") return { label: "Telefon", type: "tel", placeholder: "+420 777 123 456", textarea: false };
  if (field === "address") return { label: "Adresa", type: "text", placeholder: "Dlouhá 123, Praha 1", textarea: false };
  if (field === "bio") return { label: "Bio", type: "text", placeholder: "Pár slov o sobě — co rád/a půjčuješ, kde jsi...", textarea: true };
  return { label: "Údaj", type: "text", placeholder: "", textarea: false };
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
  { id: "tomas", name: "Tomáš", email: "tomas@vercajkovna.cz", password: "demo1234", desc: "Kutil z Letné" },
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

type AddListingPhoto = { file: File | null; url: string };
type AddListingDraft = {
  photoSlots: Array<AddListingPhoto | null>;
  title: string;
  description: string;
  categoryId: string;
  pricePerDay: number;
  depositEnabled: boolean;
  depositAmount: number;
  availabilityMode: 'always' | 'weekdays' | 'weekends' | 'custom';
  availabilityUntil: string;
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
  pickupTimeFrom: string;
  pickupTimeTo: string;
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

const addListingStep = ref<1 | 2 | 3 | 4>(1);
const addListingMode = ref<'create' | 'edit'>('create');
const editingListingId = ref<string | null>(null);
const addListingProceedAttempt = ref(false);
const addListingShowMore = ref(false);
const brandSuggestions = ref<string[]>([]);
const KNOWN_BRANDS = [
  'Bosch', 'DeWalt', 'Makita', 'Festool', 'Hilti', 'Milwaukee', 'Metabo',
  'Ryobi', 'Black+Decker', 'Stanley', 'Kärcher', 'Husqvarna', 'Stihl',
  'AEG', 'Hitachi', 'Parkside', 'Einhell', 'Worx', 'Fiskars', 'Bahco',
  'Gedore', 'Knipex', 'Wera', 'Leica', 'Fluke', 'Dewalt', 'Paslode',
  'Skil', 'Dremel', 'Flex', 'Mafell', 'Trumpf', 'Atlas Copco', 'Snap-on',
  'Irwin', 'Facom', 'Beta', 'Hazet', 'Würth', 'Rothenberger',
];
function onBrandInput(val: string) {
  addListingDraft.brand = val;
  if (val.length >= 3) {
    const q = val.toLowerCase();
    brandSuggestions.value = KNOWN_BRANDS.filter(b => b.toLowerCase().includes(q)).slice(0, 5);
  } else {
    brandSuggestions.value = [];
  }
}
function selectBrand(brand: string) {
  addListingDraft.brand = brand;
  brandSuggestions.value = [];
}
function clearBrandSuggestions() {
  window.setTimeout(() => { brandSuggestions.value = []; }, 150);
}
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
  description: "",
  categoryId: categories.find((item) => item.id !== "all")?.id ?? "stavba",
  pricePerDay: 0,
  depositEnabled: false,
  depositAmount: 0,
  availabilityMode: 'always',
  availabilityUntil: '',
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
  pickupTimeFrom: "",
  pickupTimeTo: "",
  pickupMethods: { mode: "personal", otherPickupDescription: "" },
  rules: { noModifications: false, purposeOnly: false, noThirdParty: false, depositForfeit: false, other: false, otherDescription: "" },
  });const publishedListingId = ref<string | null>(null);
const publishedListingTitle = ref<string>("");
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
const techSpecsMore = ref(false);
const rentalTermsOpen = ref(true);
const rulesInlineOpen = ref(false);
const descriptionExpanded = ref(false);
const profileListTab = ref<"offers" | "requests">("offers");
const publicProfileListTab = ref<"offers" | "requests">("offers");
const publicProfileReviewsTab = ref<"owners" | "renters">("owners");
const onboardingStep = ref(0);
const onboardingRole = ref<"majitel" | "najemce" | null>("majitel");
const onboardingCategories = ref<string[]>([]);
const onboardingLocMode = ref<"gps" | "manual">("gps");
const screenHistory = ref<Screen[]>([]);
const lastListScreen = ref<Screen | null>(null);

// Chat state
const chatConversations = ref<Conversation[]>(initialConversations.map(c => ({ ...c, messages: [...c.messages] })));
const activeChatId = ref<string | null>(null);
const chatInput = ref("");
const activeConversation = computed(() => chatConversations.value.find(c => c.id === activeChatId.value) ?? null);
const unreadChatCount = computed(() => chatConversations.value.reduce((sum, c) => sum + c.unread, 0));
const isChatClosed = computed(() =>
  activeConversation.value?.messages.some(
    m => m.type === "status" && (m.statusType === "reservation-rejected" || m.statusType === "reservation-cancelled")
  ) ?? false
);
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
const screenLabels = computed<Record<Screen, string>>(() => ({
  auth: "Přihlášení",
  market: "Marketplace",
  favorites: "Oblíbené",
  detail: "Detail",
  "add-listing": addListingMode.value === 'edit' ? "Upravit nabídku" : "Nová nabídka",
  "add-listing-confirmation": "Hotovo",
  "public-profile": "Veřejný profil",
  "profile-personal": "Osobní údaje",
  "profile-payments": "Platební metody",
  "profile-security": "Zabezpečení",
  "profile-language": "Jazyk a měna",
  "profile-notifications": "Oznámení",
  "profile-privacy": "Soukromí",
  help: "Nápověda",
  "help-detail": "Nápověda",
  "help-contact": "Napište nám",
  "profile-list": "Moje nabídky a poptávky",
  "public-profile-list": "Veřejné položky",
  "public-profile-reviews": "Hodnocení",
  onboarding: "",
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
  chat: "Zprávy",
  "chat-detail": "Konverzace",
  profile: "Profil",
}));

const selectedListing = computed<Listing>(
  () => listings.find((listing) => listing.id === selectedListingId.value) ?? listings[0],
);
const requestDateError = computed(() => requestStep.value === 1 && !requestDate.value.trim());
const addListingTitleError = computed(
  () => addListingStep.value === 1 && !addListingDraft.title.trim(),
);
const addListingBrandError = computed(
  () => addListingStep.value === 3 && !addListingDraft.brand.trim(),
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
    addListingDraft.availabilityMode === 'custom' &&
    addListingDraft.availabilityDays.length === 0,
);
const addListingOtherRuleError = computed(
  () =>
    addListingStep.value === 4 &&
    addListingDraft.rules.other &&
    !addListingDraft.rules.otherDescription.trim(),
);
const addListingOtherPickupError = computed(
  () =>
    addListingStep.value === 4 &&
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
function fmt(n: number): string {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

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
      listing?: string;
      listingId?: string;
      authorProfile?: string;
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
        listing: "Kompaktní kotoučová pila Festool TS 55",
        listingId: "festool-ts55",
        authorProfile: "Jana",
      },
      {
        author: "Pavel",
        avatar: "P",
        role: "Majitel",
        stars: 4,
        text: "Domluva super, předání přesné a zařízení ve skvělém stavu.",
        date: "Minulý týden",
        listing: "Aku vrtačka Makita 18V",
        listingId: "makita-drill",
        authorProfile: "Pavel",
      },
      {
        author: "Lucie",
        avatar: "L",
        role: "Nájemce",
        stars: 5,
        text: "Půjčení bez stresu, ochotný přístup a jasné instrukce.",
        date: "Před měsícem",
        listing: "Tlaková myčka Kärcher K5",
        listingId: "karcher-wash",
        authorProfile: "Lucie",
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
        listing: "Aku vrtačka Makita 18V",
        listingId: "makita-drill",
        authorProfile: "Tomáš",
      },
      {
        author: "Jana",
        avatar: "J",
        role: "Nájemce",
        stars: 5,
        text: "Vše sedělo podle popisu, určitě půjčím znovu.",
        date: "Před 2 týdny",
        listing: "Aku vrtačka Makita 18V",
        listingId: "makita-drill",
        authorProfile: "Jana",
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
      const canEdit = status.label !== 'Čeká na schválení' && status.label !== 'Schváleno - čeká na platbu';
      return {
        id,
        title: listing.title,
        priceValue: listing.priceValue,
        location: listing.location,
        statusLabel: status.label,
        statusTone: status.tone,
        dateRange,
        canEdit,
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

const featuredListings = computed(() => filteredListings.value.slice(0, 10));
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
const authHeading = computed(() => {
  if (authMode.value === "login") return { submitLabel: "Jdeme na to" };
  if (authMode.value === "forgot") return { submitLabel: "Poslat instrukce" };
  return { submitLabel: "Registrovat se" };
});

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
      bio: personal.bio,
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

function openPersonalEdit(field: "firstName" | "lastName" | "email" | "phone" | "address" | "bio") {
  personalEditField.value = field;
  if (field === "firstName") personalEditValue.value = personal.firstName;
  else if (field === "lastName") personalEditValue.value = personal.lastName;
  else if (field === "email") personalEditValue.value = personal.email;
  else if (field === "phone") personalEditValue.value = personal.phone;
  else if (field === "bio") personalEditValue.value = personal.bio;
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
  if (field === "phone") { personal.phone = value; personal.phoneVerified = false; }
  if (field === "address") personal.address = value;
  if (field === "bio") personal.bio = value;
  closePersonalEdit();
  savePersonalChanges();
}

function savePersonalChanges() {
  const fullName = `${personal.firstName} ${personal.lastName}`.trim();
  user.name = fullName || user.name;
  user.email = personal.email.trim() || user.email;
  personal.email = user.email;
  persistPersonal();
  personalSnapshot.firstName = personal.firstName;
  personalSnapshot.lastName = personal.lastName;
  personalSnapshot.bio = personal.bio;
  personal.saved = true;
  window.setTimeout(() => { personal.saved = false; }, 1200);
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
  if (screen.value === 'profile-personal' && personalDirty.value && next !== 'profile-personal') {
    personalUnsavedTarget = next;
    personalUnsavedOpen.value = true;
    return;
  }
  if (screen.value !== next) {
    screenHistory.value.push(screen.value);
  }
  screen.value = next;
  localStorage.setItem(SCREEN_KEY, next);
}

function confirmPersonalDiscard() {
  personalSnapshot.firstName = personal.firstName;
  personalSnapshot.lastName = personal.lastName;
  personalSnapshot.bio = personal.bio;
  personalUnsavedOpen.value = false;
  const target = personalUnsavedTarget;
  personalUnsavedTarget = null;
  if (target) setScreen(target);
  else goBack();
}

function confirmPersonalSaveAndLeave() {
  savePersonalChanges();
  personalUnsavedOpen.value = false;
  const target = personalUnsavedTarget;
  personalUnsavedTarget = null;
  if (target) setScreen(target);
  else goBack();
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

function openPublishedListing() {
  if (!publishedListingId.value) { setScreen('market'); return; }
  selectedListingId.value = publishedListingId.value;
  pendingRole.value = "owner";
  lastListScreen.value = "market";
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

function openPublicProfileReviews(tab: "owners" | "renters" = "owners") {
  publicProfileReviewsTab.value = tab;
  setScreen("public-profile-reviews");
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

function openEditListing(id: string) {
  if (!requireAuth("add-listing")) return;
  const listing = listings.find((item) => item.id === id);
  if (!listing) return;

  resetAddListingDraft();
  addListingMode.value = 'edit';
  editingListingId.value = id;
  addListingStep.value = 1;
  addListingProceedAttempt.value = false;
  pendingPhotoSlotIndex.value = 0;

  addListingDraft.title = listing.title;
  addListingDraft.categoryId = listing.category;
  addListingDraft.description = listing.description;
  addListingDraft.pricePerDay = listing.priceValue;
  addListingDraft.depositEnabled = listing.depositRequired;
  addListingDraft.pickupTimeFrom = listing.pickupTimeFrom ?? '';
  addListingDraft.pickupTimeTo = listing.pickupTimeTo ?? '';
  addListingDraft.pickupMethods.mode = listing.pickupMode ?? 'personal';
  addListingDraft.pickupMethods.otherPickupDescription = listing.pickupDescription ?? '';
  addListingDraft.depositAmount = listing.depositAmount ?? 0;
  addListingDraft.brand = listing.brand ?? '';
  addListingDraft.model = listing.model ?? '';
  addListingDraft.power = listing.power ?? '';
  addListingDraft.weight = listing.weight ?? '';
  addListingDraft.accessories = listing.accessories ?? '';
  addListingDraft.condition = listing.condition ?? 'used_good';
  addListingDraft.additionalParams = listing.additionalParams ?? '';
  addListingDraft.locationMode = listing.locationMode ?? 'profile';
  if (listing.customAddress) {
    addListingDraft.customAddress.street = listing.customAddress.street;
    addListingDraft.customAddress.city = listing.customAddress.city;
    addListingDraft.customAddress.zip = listing.customAddress.zip;
  }
  if (listing.rules) {
    Object.assign(addListingDraft.rules, listing.rules);
  }
  if (listing.photo) {
    addListingDraft.photoSlots[0] = { file: null, url: listing.photo };
  }
  applyAvailabilityPreset('always');

  setScreen('add-listing');
}

function openRequest(id?: string) {
  if (id) selectedListingId.value = id;
  requestStep.value = 1;
  requireAuth("request");
}

function resetAddListingDraft() {
  addListingDraft.photoSlots.forEach((photo) => {
    if (photo?.file) URL.revokeObjectURL(photo.url);
  });
  addListingDraft.photoSlots = Array.from({ length: 4 }, () => null);
  addListingDraft.title = "";
  addListingDraft.description = "";
  addListingDraft.categoryId = categories.find((item) => item.id !== "all")?.id ?? "stavba";
  addListingDraft.pricePerDay = 0;
  addListingDraft.depositEnabled = false;
  addListingDraft.depositAmount = 0;
  addListingDraft.availabilityMode = 'always';
  addListingDraft.availabilityUntil = '';
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
  addListingDraft.pickupTimeFrom = "";
  addListingDraft.pickupTimeTo = "";
  addListingDraft.pickupMethods.mode = "personal";
  addListingDraft.pickupMethods.otherPickupDescription = "";
  addListingDraft.rules.noModifications = false;
  addListingDraft.rules.purposeOnly = false;
  addListingDraft.rules.noThirdParty = false;
  addListingDraft.rules.depositForfeit = false;
  addListingDraft.rules.other = false;
  publishedListingId.value = null;
}

function completeOnboarding() {
  localStorage.setItem(ONBOARDED_KEY, '1');
  if (onboardingRole.value === 'majitel') {
    screen.value = 'market';
    openAddListing();
  } else {
    screen.value = 'market';
  }
}

function skipOnboarding() {
  localStorage.setItem(ONBOARDED_KEY, '1');
  screen.value = 'market';
}

function goToLoginFromOnboarding() {
  localStorage.setItem(ONBOARDED_KEY, '1');
  switchAuthMode('login');
  setScreen('auth');
}

function resetOnboarding() {
  localStorage.removeItem(ONBOARDED_KEY);
  onboardingStep.value = 0;
  onboardingRole.value = 'majitel';
  onboardingCategories.value = [];
  setScreen('onboarding');
}

function openAddListing() {
  if (!requireAuth("add-listing")) return;
  addListingMode.value = 'create';
  editingListingId.value = null;
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
    if (addListingBrandError.value) return;
  }
  if (addListingStep.value === 4) {
    if (addListingOtherRuleError.value || addListingOtherPickupError.value) return;
    submitAddListing();
    return;
  }
  addListingProceedAttempt.value = false;
  addListingStep.value = (addListingStep.value + 1) as 1 | 2 | 3 | 4;
}

function prevAddListingStep() {
  addListingProceedAttempt.value = false;
  if (addListingStep.value === 1) {
    goBack();
    return;
  }
  addListingStep.value = (addListingStep.value - 1) as 1 | 2 | 3 | 4;
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

function applyAvailabilityPreset(mode: AddListingDraft['availabilityMode']) {
  addListingDraft.availabilityMode = mode;
  availabilityRangeStart.value = null;

  if (mode === 'custom') {
    addListingDraft.availabilityDays = [];
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(today);
  end.setMonth(end.getMonth() + 6);

  const days: string[] = [];
  for (let d = new Date(today); d <= end; d.setDate(d.getDate() + 1)) {
    const dow = d.getDay(); // 0=Ne, 6=So
    const isWeekend = dow === 0 || dow === 6;
    const isWeekday = dow >= 1 && dow <= 5;
    if (
      mode === 'always' ||
      (mode === 'weekends' && isWeekend) ||
      (mode === 'weekdays' && isWeekday)
    ) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      days.push(`${y}-${m}-${day}`);
    }
  }
  addListingDraft.availabilityDays = days;
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
  if (addListingBrandError.value || addListingOtherRuleError.value || addListingOtherPickupError.value) return;
  if (!requireAuth("add-listing")) return;
  if (!addListingDraft.model.trim()) addListingDraft.model = 'Ostatní';

  const priceValueComputed = Math.round(Number(addListingDraft.pricePerDay) || 0);
  const locationComputed =
    addListingDraft.locationMode === "custom"
      ? [addListingDraft.customAddress.city, addListingDraft.customAddress.street]
          .filter(Boolean)
          .join(", ") || "—"
      : (personal.address || "—");

  // --- EDIT MODE ---
  if (addListingMode.value === 'edit' && editingListingId.value) {
    const idx = listings.findIndex((item) => item.id === editingListingId.value);
    if (idx !== -1) {
      const existing = listings[idx];
      listings.splice(idx, 1, {
        ...existing,
        title: addListingDraft.title.trim(),
        price: `${priceValueComputed} Kč / den`,
        priceValue: priceValueComputed,
        location: locationComputed,
        category: addListingDraft.categoryId,
        depositRequired: Boolean(addListingDraft.depositEnabled),
        description: addListingDraft.description.trim() || existing.description,
        pickupMode: addListingDraft.pickupMethods.mode === 'other' ? 'other' : 'personal',
        pickupDescription: addListingDraft.pickupMethods.mode === 'other'
          ? addListingDraft.pickupMethods.otherPickupDescription
          : undefined,
        pickupTimeFrom: addListingDraft.pickupTimeFrom || undefined,
        pickupTimeTo: addListingDraft.pickupTimeTo || undefined,
        depositAmount: addListingDraft.depositEnabled ? addListingDraft.depositAmount : undefined,
        brand: addListingDraft.brand.trim() || undefined,
        model: addListingDraft.model.trim() || undefined,
        power: addListingDraft.power.trim() || undefined,
        weight: addListingDraft.weight.trim() || undefined,
        accessories: addListingDraft.accessories.trim() || undefined,
        condition: addListingDraft.condition,
        additionalParams: addListingDraft.additionalParams.trim() || undefined,
        locationMode: addListingDraft.locationMode,
        customAddress: addListingDraft.locationMode === 'custom' ? { ...addListingDraft.customAddress } : undefined,
        rules: { ...addListingDraft.rules },
      });
    }
    addListingMode.value = 'create';
    editingListingId.value = null;
    setScreen('profile-list');
    return;
  }

  // --- CREATE MODE ---
  const baseId = slugifyId(addListingDraft.title);
  let id = baseId;
  let counter = 2;
  while (listings.some((item) => item.id === id)) {
    id = `${baseId}-${counter}`;
    counter += 1;
  }

  const newListing: Listing = {
    id,
    title: addListingDraft.title.trim(),
    price: `${priceValueComputed} Kč / den`,
    priceValue: priceValueComputed,
    location: locationComputed,
    distance: "0.0 km",
    distanceValue: 0,
    rating: 0,
    category: addListingDraft.categoryId,
    availability: "Nově přidáno",
    depositRequired: Boolean(addListingDraft.depositEnabled),
    description: addListingDraft.description.trim() || addListingDraft.additionalParams.trim() || "Nová nabídka vytvořená v demo flow.",
    owner: personal.firstName || user.name || "Já",
    ownerSince: "nově",
    badges: ["Novinka"],
    pickupMode: addListingDraft.pickupMethods.mode === "other" ? "other" : "personal",
    pickupDescription: addListingDraft.pickupMethods.mode === "other" ? addListingDraft.pickupMethods.otherPickupDescription : undefined,
    pickupTimeFrom: addListingDraft.pickupTimeFrom || undefined,
    pickupTimeTo: addListingDraft.pickupTimeTo || undefined,
    depositAmount: addListingDraft.depositEnabled ? addListingDraft.depositAmount : undefined,
    brand: addListingDraft.brand.trim() || undefined,
    model: addListingDraft.model.trim() || undefined,
    power: addListingDraft.power.trim() || undefined,
    weight: addListingDraft.weight.trim() || undefined,
    accessories: addListingDraft.accessories.trim() || undefined,
    condition: addListingDraft.condition,
    additionalParams: addListingDraft.additionalParams.trim() || undefined,
    locationMode: addListingDraft.locationMode,
    customAddress: addListingDraft.locationMode === 'custom' ? { ...addListingDraft.customAddress } : undefined,
    rules: { ...addListingDraft.rules },
  };

  listings.unshift(newListing);
  const bucket = demoProfileMatrix[user.email] ?? demoProfileMatrix["demo@vercajkovna.cz"];
  bucket.offers.unshift(id);
  publishedListingId.value = id;
  publishedListingTitle.value = addListingDraft.title.trim();
  setScreen("add-listing-confirmation");
}

onBeforeUnmount(() => {
  addListingDraft.photoSlots.forEach((photo) => {
    if (photo?.file) URL.revokeObjectURL(photo.url);
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

watch(screen, (val) => {
  if (val === 'detail') {
    nextTick(() => setTimeout(scrollCarouselToMain, 50));
  }
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
const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

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

function openProfileNotifications() {
  if (!requireAuth("profile-notifications")) return;
  setScreen("profile-notifications");
}

const privacy = reactive({
  contactPhone: true,
  contactEmail: false,
  contactSms: true,
  emailValue: "",
  contactError: false,
  emailModalOpen: false,
  emailModalValue: "",
});

function openProfilePrivacy() {
  if (!requireAuth("profile-privacy")) return;
  if (!privacy.emailValue) privacy.emailValue = personal.email ?? "";
  setScreen("profile-privacy");
}

function togglePrivacyPhone() {
  if (privacy.contactPhone && !privacy.contactSms) {
    privacy.contactError = true;
    setTimeout(() => { privacy.contactError = false; }, 3000);
    return;
  }
  privacy.contactPhone = !privacy.contactPhone;
}

function togglePrivacySms() {
  if (privacy.contactSms && !privacy.contactPhone) {
    privacy.contactError = true;
    setTimeout(() => { privacy.contactError = false; }, 3000);
    return;
  }
  privacy.contactSms = !privacy.contactSms;
}

function openEmailModal() {
  privacy.emailModalValue = privacy.emailValue || personal.email || "";
  privacy.emailModalOpen = true;
}

function confirmEmailModal() {
  privacy.emailValue = privacy.emailModalValue;
  privacy.emailModalOpen = false;
}

function togglePrivacyEmail() {
  if (!privacy.contactEmail) {
    privacy.contactEmail = true;
    openEmailModal();
  } else {
    privacy.contactEmail = false;
  }
}

const settings = reactive({
  language: "cz",
  currency: "CZK"
});

const notifications = reactive({
  pushEnabled: true,
  emailEnabled: true,
  items: {
    chat:                { push: true,  email: false },
    reservationNew:      { push: true,  email: true  },
    reservationStatus:   { push: true,  email: true  },
    reservationReminder: { push: true,  email: false },
    payment:             { push: true,  email: true  },
    deviceStatus:        { push: true,  email: false },
    ratingReceived:      { push: true,  email: false },
    ratingReminder:      { push: true,  email: false },
    nearbyListings:      { push: false, email: false },
    platformNews:        { push: false, email: false },
  } as Record<string, { push: boolean; email: boolean }>,
});

function openFavorites() {
  requireAuth("favorites");
}

function openRules() {
  if (window.innerWidth >= 1280) {
    rulesInlineOpen.value = !rulesInlineOpen.value;
  } else {
    setScreen("rules");
  }
}

function openPayment() {
  setScreen("payment");
}

function openPaymentBank() {
  setScreen("payment-bank");
}

function openStatus() {
  requireAuth("chat");
}

function openChatDetail(id: string) {
  activeChatId.value = id;
  const conv = chatConversations.value.find(c => c.id === id);
  if (conv) conv.unread = 0;
  setScreen("chat-detail");
}

function startChat() {
  const listing = selectedListing.value as Listing;
  // Najdi existující konverzaci k téhle nabídce
  const existing = chatConversations.value.find(c => c.listingId === listing.id);
  if (existing) {
    openChatDetail(existing.id);
    return;
  }
  // Vytvoř novou
  const newConv: Conversation = {
    id: "conv-" + Date.now(),
    contactName: listing.owner,
    listingId: listing.id,
    listingTitle: listing.title,
    unread: 0,
    lastMessage: "",
    lastTime: "teď",
    messages: [],
  };
  chatConversations.value.unshift(newConv);
  openChatDetail(newConv.id);
}

function sendChatMessage() {
  const text = chatInput.value.trim();
  if (!text || !activeConversation.value) return;
  const now = new Date();
  const timeStr = now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0");
  const newMsg: ChatMessage = {
    id: "m" + Date.now(),
    type: "message",
    text,
    sender: "me",
    time: timeStr,
  };
  activeConversation.value.messages.push(newMsg);
  activeConversation.value.lastMessage = text;
  activeConversation.value.lastTime = timeStr;
  chatInput.value = "";
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
  email: "",
  isSending: false,
  isSent: false,
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

function confirmRegisterName() {
  registerNameConfirmed.value = true;
  registerNameModalOpen.value = false;
  submitAuth();
}

function submitAuth() {
  const email = auth.email.trim();
  const password = auth.password.trim();
  const name = auth.name.trim();

  if (authMode.value === "forgot") {
    if (!email) {
      auth.error = "Vyplň e-mail.";
      return;
    }
    forgotSuccess.value = true;
    auth.error = "";
    startResendTimer();
    return;
  }

  if (authMode.value === "login") {
    if (!email || !password) {
      auth.error = "Vyplň e-mail i heslo.";
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

  if (!registerNameConfirmed.value) {
    registerNameModalOpen.value = true;
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
  if (!localStorage.getItem(ONBOARDED_KEY)) {
    onboardingStep.value = 0;
    onboardingRole.value = "majitel";
    onboardingCategories.value = [];
    setScreen("onboarding");
  } else {
    afterAuth();
  }
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
  forgotSuccess.value = false;
}

function handleHelp() {
  forgotSuccess.value = false;
  switchAuthMode("forgot");
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
  if (screen.value === 'profile-personal' && personalDirty.value) {
    personalUnsavedTarget = null;
    personalUnsavedOpen.value = true;
    return;
  }
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
  setScreen("chat");
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

const topListingsRef = ref<HTMLElement | null>(null);
function scrollTopListings(dir: 'left' | 'right') {
  const el = topListingsRef.value;
  if (!el) return;
  el.scrollBy({ left: dir === 'right' ? 340 : -340, behavior: 'smooth' });
}

const detailCarouselRef = ref<HTMLElement | null>(null);
const lightboxSrc = ref<string | null>(null);
const carouselIndex = ref(1); // 1 = první reálná fotka (index 0 je klon posledního)

// Fotky aktivního listingu
const carouselPhotos = computed<string[]>(() => {
  if (!selectedListing.value) return [];
  const l = selectedListing.value;
  if (l.photos && l.photos.length > 0) return l.photos;
  if (l.photo) return [l.photo];
  return [];
});

// Pole s klony: [klon_posledního, ...reálné, klon_prvního]
const carouselItems = computed<(string | null)[]>(() => {
  const photos = carouselPhotos.value;
  if (photos.length === 0) return [null];
  if (photos.length === 1) return [photos[0]];
  return [photos[photos.length - 1], ...photos, photos[0]];
});

function scrollToCarouselIndex(index: number, smooth: boolean) {
  const el = detailCarouselRef.value;
  if (!el) return;
  const item = el.querySelectorAll<HTMLElement>('.detail-carousel-item')[index];
  if (!item) return;
  const itemWidth = item.clientWidth;
  const gap = 8;
  const scrollLeft = index * (itemWidth + gap) - (el.clientWidth - itemWidth) / 2;
  el.scrollTo({ left: scrollLeft, behavior: smooth ? 'smooth' : 'instant' });
}

function scrollCarouselToMain() {
  carouselIndex.value = 1;
  nextTick(() => scrollToCarouselIndex(1, false));
}

let carouselScrollTimer: ReturnType<typeof setTimeout> | null = null;

function scrollCarousel(dir: 'left' | 'right') {
  const photos = carouselPhotos.value;
  if (photos.length <= 1) return;

  const next = dir === 'right' ? carouselIndex.value + 1 : carouselIndex.value - 1;
  carouselIndex.value = next;
  scrollToCarouselIndex(next, true);

  // Po animaci: pokud jsme na klonu, tiše přeskočit na reálnou pozici
  if (carouselScrollTimer) clearTimeout(carouselScrollTimer);
  carouselScrollTimer = setTimeout(() => {
    const realCount = photos.length;
    if (carouselIndex.value <= 0) {
      carouselIndex.value = realCount;
      scrollToCarouselIndex(realCount, false);
    } else if (carouselIndex.value >= realCount + 1) {
      carouselIndex.value = 1;
      scrollToCarouselIndex(1, false);
    }
  }, 380);
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
        screen !== 'help-contact' &&
        screen !== 'onboarding' &&
        screen !== 'public-profile' &&
        screen !== 'pending-request' &&
        screen !== 'rules' &&
        screen !== 'payment' &&
        screen !== 'confirmation'
      "
      :class="['topbar topbar-app', screen === 'market' ? 'topbar-market' : '']"
    >
      <div class="topbar-inner">
        <!-- Zpět — skryté na marketu -->
        <button
          v-if="screen !== 'market'"
          class="icon-button"
          type="button"
          aria-label="Zpět"
          @click="screen === 'add-listing' ? prevAddListingStep() : goBack()"
        >
          <i class="pi pi-arrow-left"></i>
        </button>
        <!-- Placeholder pro symetrii na marketu -->
        <div v-else style="width: 44px; flex-shrink: 0;"></div>

        <div class="topbar-title">
          <template v-if="screen === 'market'">
            <strong style="font-family: var(--font-raw); font-size: 1.1rem;">Vercajkovna</strong>
          </template>
          <template v-else-if="screen === 'chat-detail' && activeConversation">
            <strong>{{ activeConversation.contactName }}</strong>
            <span>{{ activeConversation.listingTitle }}</span>
          </template>
          <template v-else>
            <strong>{{ screenLabels[screen] }}</strong>
          </template>
        </div>

        <!-- DESKTOP only: logo uprostřed (absolutně) -->
        <div class="topbar-desktop-brand">
          <strong>Vercajkovna</strong>
        </div>

        <!-- Pravá strana — placeholder pro symetrii (mobil) -->
        <div style="width: 44px; flex-shrink: 0;"></div>

        <!-- DESKTOP only: profil vpravo -->
        <button class="icon-button topbar-desktop-profile" type="button" aria-label="Profil" @click="openProfile()">
          <i class="pi pi-user"></i>
        </button>
      </div>
    </header>


    <header v-if="screen === 'auth' || screen === 'help-contact'" class="auth-topbar">
      <button class="auth-back-button" type="button" aria-label="Zpět" @click="goBack">
        <i class="pi pi-arrow-left"></i>
      </button>
      <div v-if="screen === 'auth'" class="auth-brand-row">
        <div class="auth-brand-mark auth-brand-mark-inline">V</div>
        <div class="auth-brand-copy auth-brand-copy-inline">
          <strong>vercajkovna</strong>
          <span>Půjčujem si vercajk</span>
        </div>
      </div>
      <div v-else-if="screen === 'help-contact'" class="auth-brand-row" style="flex: 1; justify-content: center; text-align: center; margin-right: 0;">
        <div class="auth-brand-copy auth-brand-copy-inline" style="align-items: center;">
          <strong style="font-size: 1.1rem;">Vercajkovna</strong>
          <span style="font-size: 0.75rem; letter-spacing: 0.05em;">Napište nám</span>
        </div>
      </div>
      <div v-if="screen === 'help-contact'" class="auth-brand-mark auth-brand-mark-inline" style="width: 40px; height: 40px; border-radius: 50%; font-size: 0.9rem;">
        {{ user.name.charAt(0).toUpperCase() }}
      </div>
    </header>

    <main class="frame">
      <section v-if="screen === 'auth'" class="auth-shell">
        <div class="auth-page" :class="{ 'is-login': authMode === 'login', 'is-register': authMode === 'register' }">

          <div class="auth-panel" :class="{ 'is-login': authMode === 'login', 'is-register': authMode === 'register', 'is-forgot': authMode === 'forgot' }">
            <div class="auth-panel-head">
              <h1 class="auth-hero-title">
                <template v-if="authMode === 'forgot'">
                  <span class="auth-hero-line1">Zapomenuté</span>
                  <span class="auth-hero-line2"><span class="auth-hero-accent">heslo</span></span>
                </template>
                <template v-else>
                  <span class="auth-hero-line1">{{ authMode === 'login' ? 'Vítej zpátky' : 'Založ si' }}</span>
                  <span class="auth-hero-line2">{{ authMode === 'login' ? 've ' : '' }}<span class="auth-hero-accent">{{ authMode === 'login' ? 'Vercajkovně.' : 'verštat.' }}</span></span>
                </template>
              </h1>
              <p>
                <template v-if="authMode === 'forgot'">
                  Zadej svůj e-mail a my ti pošleme instrukce, jak si nastavit nové heslo.
                </template>
                <template v-else>
                  {{
                    authMode === "login"
                      ? `Co potřebuješ tentokrát — ${selectedAuthSubheading}`
                      : "Pár údajů a za chvíli si půjčíš první vercajk od souseda."
                  }}
                </template>
              </p>
            </div>

            <div v-if="authMode !== 'forgot'" class="auth-tabs" aria-label="Volba přístupu">
              <button
                class="auth-tab"
                :class="{ 'is-active': authMode === 'login' }"
                type="button"
                @click="switchAuthMode('login')"
              >
                PŘIHLÁŠENÍ
              </button>
              <button
                class="auth-tab"
                :class="{ 'is-active': authMode === 'register' }"
                type="button"
                @click="switchAuthMode('register')"
              >
                REGISTRACE
              </button>
            </div>
            <div v-if="authMode === 'forgot' && forgotSuccess" class="auth-success-panel">
              <div class="auth-success-icon">
                <i class="pi pi-check-circle"></i>
              </div>
              <h2>Instrukce odeslány!</h2>
              <p>Koukni se do e-mailu. Pokud tam nic nenajdeš, zkus se podívat i do spamu.</p>
              
              <div class="auth-resend-box" style="margin-top: 24px;">
                <button 
                  v-if="resendTimer === 0" 
                  class="field-link" 
                  type="button" 
                  @click="startResendTimer"
                >
                  Poslat znovu
                </button>
                <span v-else class="resend-countdown">
                  Poslat znovu za <strong>{{ resendTimer }}s</strong>
                </span>
              </div>

              <PvButton class="button-secondary w-full" style="margin-top: 16px;" @click="switchAuthMode('login')">
                Zpět na přihlášení
              </PvButton>
            </div>

            <form v-else class="auth-form" @submit.prevent="submitAuth">
              <div v-if="authMode === 'register'" class="field">
                <label for="authName">Jméno</label>
                <div class="input-shell">
                  <i class="pi pi-user input-icon"></i>
                  <PvInputText
                    id="authName"
                    v-model="auth.name"
                    class="auth-input"
                    autocomplete="name"
                    placeholder="Jméno a příjmení"
                  />
                </div>
              </div>

              <div class="field">
                <label for="authEmail" :class="{ 'sr-only': authMode === 'login' || authMode === 'forgot' }">E-MAIL</label>
                <div class="input-shell">
                  <i class="pi pi-envelope input-icon"></i>
                  <PvInputText
                    id="authEmail"
                    v-model="auth.email"
                    class="auth-input"
                    autocomplete="email"
                    placeholder="tvuj@email.cz"
                  />
                </div>
              </div>

              <div v-if="authMode !== 'forgot'" class="field">
                <div v-if="authMode === 'register'" class="field-row">
                  <label for="authPassword">Heslo</label>
                </div>
                <label v-else for="authPassword" class="sr-only">Heslo</label>
                <div class="input-shell">
                  <i class="pi pi-lock input-icon"></i>
                  <input
                    id="authPassword"
                    v-model="auth.password"
                    class="auth-input native-input"
                    :type="showPassword ? 'text' : 'password'"
                    autocomplete="current-password"
                    :placeholder="authMode === 'login' ? 'Heslo' : '••••••••'"
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

              <div v-if="authMode !== 'forgot'" class="auth-meta-row" :class="{ 'auth-meta-row-split': authMode === 'login' }">
                <label v-if="authMode === 'login'" class="checkbox-row auth-remember-row">
                  <PvCheckbox v-model="auth.remember" binary />
                  <span>Pamatovat si mě</span>
                </label>
                <button
                  v-if="authMode === 'login'"
                  class="field-link auth-forgot-link"
                  type="button"
                  @click="handleHelp"
                >
                  Hlava děravá?
                </button>

                <label v-if="authMode === 'register'" class="checkbox-row terms-row">
                  <PvCheckbox v-model="auth.terms" binary />
                  <span>{{ registerTermsLabel }}</span>
                </label>
              </div>

              <PvButton
                class="auth-submit auth-submit-primary"
                :class="{ 'is-ready': isAuthReady }"
                type="submit"
              >
                {{ authHeading.submitLabel }}
              </PvButton>

              <button v-if="authMode === 'forgot'" class="field-link w-full" style="margin-top: 16px; text-align: center;" type="button" @click="switchAuthMode('login')">
                Vzpomněl jsem si! Zpět na přihlášení
              </button>

              <div v-if="authMode === 'login'" class="auth-demo-group">
                <div class="auth-demo-divider">
                  <span>nebo skoč rovnou jako demo</span>
                </div>
                <div class="auth-demo-grid">
                  <button
                    v-for="profile in demoProfiles"
                    :key="profile.id"
                    class="auth-demo-card"
                    type="button"
                    @click="useDemoProfile(profile)"
                  >
                    <span class="auth-demo-avatar">{{ profile.name.charAt(0) }}</span>
                    <span class="auth-demo-info">
                      <span class="auth-demo-name">{{ profile.name }}</span>
                      <span class="auth-demo-desc">{{ profile.desc }}</span>
                    </span>
                  </button>
                </div>
              </div>

              <div class="auth-divider">
                <span>NEBO PŘES</span>
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
                <template v-if="authMode === 'register'">
                  Už jsi u nás byl? <strong class="auth-switch-link" @click="switchAuthMode('login')">Přihlaš se.</strong>
                </template>
                <template v-else>
                  Ještě nemáš účet? <strong class="auth-switch-link" @click="switchAuthMode('register')">Zaregistruj se.</strong>
                </template>
              </div>

              <div v-if="auth.error" class="auth-error" role="alert">{{ auth.error }}</div>

              <div v-if="authMode !== 'forgot'" class="auth-support" style="margin-top: 8px;">
                Potřebuješ pomoc? <strong class="auth-switch-link" @click="openHelpContact">Napiš nám.</strong>
              </div>
            </form>
          </div>

          <!-- Modal potvrzení jména při registraci -->
          <div v-if="registerNameModalOpen" class="confirm-modal">
            <button class="confirm-modal-backdrop" type="button" aria-label="Zavřít" @click="registerNameModalOpen = false"></button>
            <div class="confirm-modal-card" @click.stop>
              <p class="confirm-modal-title">Sedí tvoje jméno?</p>
              <p class="confirm-modal-copy">Jméno <strong>{{ auth.name.trim() }}</strong> se zobrazuje ostatním uživatelům a po registraci ho nepůjde změnit.</p>
              <div class="confirm-modal-actions">
                <button class="confirm-modal-primary" type="button" @click="confirmRegisterName">Ano, je správně</button>
                <button class="confirm-modal-ghost" type="button" @click="registerNameModalOpen = false">Zpět — chci opravit</button>
              </div>
            </div>
          </div>

          <div class="auth-ticker" aria-hidden="true">
            <span>TAP · SWIPE · PŮJČ SI VERCAJK</span>
          </div>
        </div>
      </section>

      <section v-else class="main-panel">
        <div v-if="filtersOpen" class="market-filter-backdrop" @click="filtersOpen = false"></div>
        <div v-if="screen === 'market'" class="screen-inner market-shell market-page">
          <header class="market-hero-card">
            <div class="market-topbar market-desktop-header">
              <button class="market-brand" type="button" aria-label="Vercajkovna">
                <span class="market-brand-mark">V</span>
                <span class="market-brand-word">Vercajkovna</span>
              </button>
              <div class="market-topbar-search" @mousedown.capture="openSearchFilters" @click.capture="openSearchFilters">
                <i class="pi pi-search"></i>
                <PvInputText
                  v-model="search"
                  class="market-search"
                  autocomplete="off"
                  placeholder="Bosch, žebřík, Praha..."
                />
                <button class="market-topbar-filter-btn" type="button" @click.stop="toggleFilters" aria-label="Filtry">
                  <i class="pi pi-sliders-h"></i>
                  <span v-if="activeFilterCount > 0" class="market-topbar-filter-badge">{{ activeFilterCount }}</span>
                </button>
              </div>
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

          <section class="market-section market-section-top">
            <div class="market-section-head market-section-head-row">
              <h2>Nejbližší nabídky</h2>
              <div class="market-section-arrows">
                <button class="market-arrow-btn" type="button" aria-label="Předchozí" @click="scrollTopListings('left')">
                  <i class="pi pi-chevron-left"></i>
                </button>
                <button class="market-arrow-btn" type="button" aria-label="Další" @click="scrollTopListings('right')">
                  <i class="pi pi-chevron-right"></i>
                </button>
              </div>
            </div>
            <div class="market-card-grid market-card-grid-top" ref="topListingsRef">
              <div
                v-for="listing in featuredListings"
                :key="listing.id"
                class="market-item-card"
                @click="openListing(listing.id)"
              >
                <div class="market-item-thumb" aria-hidden="true">
                  <img v-if="listing.photo" :src="listing.photo" :alt="listing.title" class="market-item-thumb-img" />
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

          <div class="market-bottom-shell">
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
                    <img v-if="listing.photo" :src="listing.photo" :alt="listing.title" class="market-item-thumb-img" />
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

            <div v-show="searchExpanded" class="market-filter-shell" :class="{ 'is-desktop-open': filtersOpen }">
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
                <label class="field filter-field filter-range-field">
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
          </div>

        </div>

        <div v-else-if="screen === 'favorites'" class="screen-inner">
          <div class="detail-hero">
            <div class="detail-hero-copy">
              <h1>Uložený <span style="color: var(--brand-2)">vercajk</span></h1>
              <p>Věci, které sis označil a chceš se k nim vrátit později.</p>
            </div>
          </div>

          <div v-if="favoriteListings.length" class="market-card-grid" style="margin-top: 24px;">
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

          <!-- Hero foto -->
          <div class="detail-hero-media">
            <div class="detail-carousel-wrap">
              <div class="detail-hero-actions">
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
              <button class="detail-carousel-arrow detail-carousel-arrow--left" type="button" @click="scrollCarousel('left')" aria-label="Předchozí">
                <i class="pi pi-chevron-left"></i>
              </button>
              <div class="detail-carousel" ref="detailCarouselRef">
                <div
                  v-for="(photo, i) in carouselItems"
                  :key="i"
                  class="detail-carousel-item"
                  :class="{ 'detail-carousel-item--main': i === 1 && carouselPhotos.length > 0 }"
                  @click="photo && (lightboxSrc = photo)"
                >
                  <img v-if="photo" :src="photo" :alt="selectedListing.title" class="detail-hero-img" />
                  <div v-else class="detail-carousel-placeholder"></div>
                  <span v-if="i === 1 && carouselPhotos.length > 0" class="detail-carousel-star"><i class="pi pi-star-fill"></i></span>
                </div>
              </div>
              <button class="detail-carousel-arrow detail-carousel-arrow--right" type="button" @click="scrollCarousel('right')" aria-label="Další">
                <i class="pi pi-chevron-right"></i>
              </button>
            </div>
          </div>

          <!-- Hlavička -->
          <div class="detail-head">
            <div class="detail-pill-row">
              <span class="detail-pill">{{ selectedListing.category }}</span>
            </div>
            <h1>{{ selectedListing.title }}</h1>
            <div class="detail-price-row">
              <strong>{{ selectedListing.priceValue }} Kč</strong>
              <span>/ den</span>
            </div>
          </div>

          <!-- Info karty -->
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
                <input ref="datePickerInput" v-model="requestDate" type="date" @input="handleDateInput" aria-label="Vyberte datum" />
              </div>
            </div>

            <div class="detail-owner-card">
              <div class="detail-owner-avatar">{{ selectedListing.owner.charAt(0) }}</div>
              <div class="detail-owner-info">
                <strong>{{ selectedListing.owner }}</strong>
                <small>Na Vercajkovně od 2023 · <i class="pi pi-star-fill"></i> 4.8</small>
              </div>
              <button class="detail-owner-write" type="button" @click="startChat" aria-label="Napsat zprávu">
                <i class="pi pi-comment"></i>
              </button>
            </div>

            <!-- Lokalita + Rezervovat — desktop only (pravý sloupec) -->
            <div class="detail-section detail-desktop-only">
              <div class="detail-section-head detail-section-head-row">
                <strong>Lokalita</strong>
                <small>{{ selectedListing.location }} ({{ selectedListing.distance }})</small>
              </div>
              <div class="detail-map-placeholder">
                <span class="detail-map-pin"><i class="pi pi-map-marker"></i></span>
              </div>
            </div>

            <button class="detail-reserve-cta detail-desktop-only" type="button" @click="handlePrimaryCTA">
              REZERVOVAT
            </button>

            <!-- Placeholder reklamy -->
            <div class="detail-ad-placeholder detail-desktop-only">
              <span>REKLAMA</span>
            </div>
          </div>

          <!-- Popis -->
          <div class="detail-section">
            <div class="detail-section-head"><strong>Popis vercajku</strong></div>
            <p class="detail-description" :class="{ 'is-clamped': !descriptionExpanded }">
              {{ selectedListing.description }}
            </p>
            <button v-if="selectedListing.description.length > 120" class="detail-more" type="button" @click="descriptionExpanded = !descriptionExpanded">
              {{ descriptionExpanded ? "Zobrazit méně" : "Zobrazit více" }}
            </button>
          </div>

          <!-- Technické parametry -->
          <div class="detail-section-card">
            <button class="detail-section-head detail-section-head-btn" type="button" @click="techSpecsOpen = !techSpecsOpen">
              <strong>Technické parametry</strong>
              <span class="detail-section-toggle"><i :class="['pi', techSpecsOpen ? 'pi-chevron-up' : 'pi-chevron-down']"></i></span>
            </button>
            <div v-if="techSpecsOpen" class="detail-spec-list">
              <div><span>Značka</span><strong>{{ selectedListing.brand || '' }}</strong></div>
              <div><span>Stav</span><strong>{{ conditionOptions.find(o => o.id === selectedListing.condition)?.label || '' }}</strong></div>
              <div><span>Příslušenství</span><strong>{{ selectedListing.accessories || '' }}</strong></div>
              <template v-if="techSpecsMore">
                <div><span>Hmotnost</span><strong>{{ selectedListing.weight || '' }}</strong></div>
                <div><span>Výkon</span><strong>{{ selectedListing.power || '' }}</strong></div>
                <div v-if="selectedListing.additionalParams"><span>Poznámka</span><strong>{{ selectedListing.additionalParams }}</strong></div>
              </template>
              <button type="button" class="detail-spec-more" @click="techSpecsMore = !techSpecsMore">
                {{ techSpecsMore ? 'Zobrazit méně' : 'Zobrazit více' }}
              </button>
            </div>
          </div>

          <!-- Podmínky pronájmu -->
          <div class="detail-section-card">
            <div class="detail-section-head detail-section-head-btn" role="button" tabindex="0" @click="rentalTermsOpen = !rentalTermsOpen" @keydown.enter="rentalTermsOpen = !rentalTermsOpen">
              <strong>Podmínky pronájmu</strong>
              <span class="detail-section-toggle"><i :class="['pi', rentalTermsOpen ? 'pi-chevron-up' : 'pi-chevron-down']"></i></span>
            </div>
            <div v-if="rentalTermsOpen" class="detail-spec-list">
              <div><span>Vratná kauce</span><strong>{{ selectedListing.depositAmount ? selectedListing.depositAmount + ' Kč' : '' }}</strong></div>
              <div>
                <span>Způsob předání</span>
                <strong>{{ selectedListing.pickupMode === 'other' ? 'Jiné' : 'Osobně' }}</strong>
              </div>
              <div class="detail-spec-row-link" @click="openRules">
                <span>Pravidla užívání</span>
                <i class="pi pi-chevron-right"></i>
              </div>
            </div>
          </div>

          <!-- Lokalita — mobil only -->
          <div class="detail-section detail-mobile-only">
            <div class="detail-section-head detail-section-head-row">
              <strong>Lokalita</strong>
              <small>{{ selectedListing.location }} ({{ selectedListing.distance }})</small>
            </div>
            <div class="detail-map-placeholder">
              <span class="detail-map-pin"><i class="pi pi-map-marker"></i></span>
            </div>
          </div>

          <!-- Plovoucí rezervovat — mobil only -->
          <div class="detail-sticky-cta detail-mobile-only">
            <button class="detail-reserve-cta" type="button" @click="handlePrimaryCTA">
              REZERVOVAT
            </button>
          </div>

          <!-- Pravidla inline — desktop only -->
          <div v-if="rulesInlineOpen" class="detail-rules-inline detail-desktop-only">
            <div class="rules-section">
              <span class="rules-section-label">Předání a vrácení</span>
              <div class="rules-card-grid">
                <div class="rules-card">
                  <strong>Vyzvednutí</strong>
                  <strong>{{ selectedListing.pickupTimeFrom ? 'Po ' + selectedListing.pickupTimeFrom : '—' }}</strong>
                </div>
                <div class="rules-card">
                  <strong>Vrácení</strong>
                  <strong>{{ selectedListing.pickupTimeTo ? 'Do ' + selectedListing.pickupTimeTo : '—' }}</strong>
                </div>
              </div>
              <div class="rules-card rules-card-block">
                <strong>Způsob předání</strong>
                <div class="rules-chip-row">
                  <span class="rules-chip" :class="{ 'is-active': selectedListing.pickupMode !== 'other' }">Osobně</span>
                  <span class="rules-chip" :class="{ 'is-active': selectedListing.pickupMode === 'other' }">Jiné</span>
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
                  <li v-if="selectedListing.rules?.noModifications">Zákaz úprav a modifikací</li>
                  <li v-if="selectedListing.rules?.purposeOnly">Určeno jen k běžnému účelu</li>
                  <li v-if="selectedListing.rules?.noThirdParty">Zákaz půjčení 3. osobě</li>
                </ul>
              </div>
            </div>

            <div class="rules-section">
              <span class="rules-section-label">Poškození a sankce</span>
              <div class="rules-card rules-card-block">
                <strong>Při porušení pravidel</strong>
                <div class="rules-row">
                  <span>Ztráta nároku na zálohu</span>
                  <strong>{{ selectedListing.rules?.depositForfeit ? 'Ano' : 'Ne' }}</strong>
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

            <button class="detail-rules-close" type="button" @click="rulesInlineOpen = false">
              SKRÝT PRAVIDLA
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
                <strong>{{ selectedListing.pickupTimeFrom ? 'Po ' + selectedListing.pickupTimeFrom : '—' }}</strong>
              </div>
              <div class="rules-card">
                <small>Vrácení</small>
                <strong>{{ selectedListing.pickupTimeTo ? 'Do ' + selectedListing.pickupTimeTo : '—' }}</strong>
              </div>
            </div>
            <div class="rules-card rules-card-block">
              <small>Způsob předání</small>
              <div class="rules-chip-row">
                <span class="rules-chip" :class="{ 'is-active': selectedListing.pickupMode !== 'other' }">Osobně</span>
                <span class="rules-chip" :class="{ 'is-active': selectedListing.pickupMode === 'other' }">Jiné</span>
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
                <li v-if="selectedListing.rules?.noModifications">Zákaz úprav a modifikací</li>
                <li v-if="selectedListing.rules?.purposeOnly">Určeno jen k běžnému účelu</li>
                <li v-if="selectedListing.rules?.noThirdParty">Zákaz půjčení 3. osobě</li>
              </ul>
            </div>
            <div class="rules-card rules-card-block" v-if="selectedListing.rules?.other && selectedListing.rules?.otherDescription">
              <strong>Další pravidlo</strong>
              <p>{{ selectedListing.rules.otherDescription }}</p>
            </div>
          </div>

          <div class="rules-section">
            <span class="rules-section-label">Poškození a sankce</span>
            <div class="rules-card rules-card-block">
              <strong>Při porušení pravidel</strong>
              <div class="rules-row">
                <span>Ztráta nároku na zálohu</span>
                <strong>{{ selectedListing.rules?.depositForfeit ? 'Ano' : 'Ne' }}</strong>
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

        <div v-else-if="screen === 'public-profile'" class="screen-inner public-profile-page" style="overflow-x: hidden;">

          <!-- Sticky header -->
          <div style="position: sticky; top: 0; z-index: 10; background: var(--bg); border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 12px; padding: 12px 16px;">
            <button
              type="button"
              style="width: 36px; height: 36px; border-radius: 999px; border: 1px solid var(--border); background: #fff; display: grid; place-items: center; color: var(--brand); cursor: pointer; flex-shrink: 0;"
              aria-label="Zpět"
              @click="goBack"
            >
              <i class="pi pi-arrow-left" style="font-size: 0.85rem;"></i>
            </button>
            <span style="font-family: var(--font-raw); font-size: 0.75rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--muted-2);">Profil</span>
          </div>

          <!-- Hero -->
          <div style="display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 28px 16px 20px; background: linear-gradient(160deg, rgba(58,37,25,0.03) 0%, rgba(27,84,49,0.04) 100%); border-bottom: 1px solid var(--border);">
            <div style="width: 80px; height: 80px; border-radius: 999px; border: 2px solid rgba(58,37,25,0.18); background: rgba(58,37,25,0.06); display: grid; place-items: center; font-family: var(--font-raw); font-size: 1.8rem; color: var(--brand); flex-shrink: 0;">
              {{ viewedPublicProfile.charAt(0).toUpperCase() }}
            </div>
            <div style="text-align: center; display: grid; gap: 5px; width: 100%;">
              <h2 style="font-family: var(--font-raw); font-size: 1.35rem; color: var(--brand); margin: 0;">{{ viewedPublicProfile }}</h2>
              <button
                type="button"
                style="display: inline-flex; align-items: center; justify-content: center; gap: 6px; background: transparent; border: 0; cursor: pointer; padding: 0; font-size: 0.88rem; color: var(--brand);"
                @click="scrollToPublicReviews"
              >
                <i class="pi pi-star-fill" style="font-size: 0.8rem;"></i>
                <span style="font-weight: 700;">{{ currentPublicProfile.rating }}</span>
                <span style="color: var(--muted);">· {{ currentPublicProfile.reviews }}</span>
              </button>
            </div>

            <!-- Stats — 2×2 grid -->
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; width: 100%; margin-top: 4px;">
              <div style="display: flex; flex-direction: column; align-items: center; gap: 4px; background: #fff; border: 1px solid var(--border); border-radius: 12px; padding: 10px 8px; font-size: 0.76rem; text-align: center;">
                <i class="pi pi-map-marker" style="color: var(--brand-2); font-size: 0.8rem;"></i>
                <span style="color: var(--brand); font-weight: 600; line-height: 1.2;">{{ currentPublicProfile.location }}</span>
              </div>
              <div style="display: flex; flex-direction: column; align-items: center; gap: 4px; background: #fff; border: 1px solid var(--border); border-radius: 12px; padding: 10px 8px; font-size: 0.76rem; text-align: center;">
                <i class="pi pi-clock" style="color: var(--brand-2); font-size: 0.8rem;"></i>
                <span style="color: var(--brand); font-weight: 600; line-height: 1.2;">{{ currentPublicProfile.response }}</span>
              </div>
              <div style="display: flex; flex-direction: column; align-items: center; gap: 4px; background: #fff; border: 1px solid var(--border); border-radius: 12px; padding: 10px 8px; font-size: 0.76rem; text-align: center;">
                <i class="pi pi-wrench" style="color: var(--brand-2); font-size: 0.8rem;"></i>
                <span style="color: var(--brand); font-weight: 600; line-height: 1.2;">{{ currentPublicProfile.listings.length }} nabídek</span>
              </div>
              <div style="display: flex; flex-direction: column; align-items: center; gap: 4px; background: #fff; border: 1px solid var(--border); border-radius: 12px; padding: 10px 8px; font-size: 0.76rem; text-align: center;">
                <i class="pi pi-shopping-bag" style="color: var(--brand-2); font-size: 0.8rem;"></i>
                <span style="color: var(--brand); font-weight: 600; line-height: 1.2;">{{ currentPublicProfile.requests.length }} půjčení</span>
              </div>
            </div>
          </div>

          <!-- Bio -->
          <div v-if="currentPublicProfile.bio" style="padding: 16px; border-bottom: 1px solid var(--border);">
            <span class="profile-section-label" style="display: block; margin-bottom: 8px;">O majiteli</span>
            <p style="margin: 0; color: var(--muted); line-height: 1.6; font-size: 0.9rem;">{{ currentPublicProfile.bio }}</p>
          </div>

          <!-- Nabídky -->
          <div style="padding: 16px; display: grid; gap: 10px; border-bottom: 1px solid var(--border);">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span class="profile-section-label">Nabídky</span>
              <button
                v-if="currentPublicProfile.listings.length > 3"
                class="profile-panel-link"
                type="button"
                style="font-size: 0.72rem;"
                @click="openPublicProfileListPage('offers')"
              >Zobrazit vše</button>
            </div>
            <div v-if="!currentPublicProfile.listings.length" class="profile-empty">
              Tento profil zatím nemá veřejné nabídky.
            </div>
            <div v-else style="display: grid; gap: 8px;">
              <button
                v-for="listingId in currentPublicProfile.listings.slice(0, 3)"
                :key="`pub-listing-${listingId}`"
                type="button"
                style="box-sizing: border-box; display: grid; grid-template-columns: 48px 1fr; align-items: center; gap: 10px; background: #fff; border: 1px solid var(--border); border-radius: 12px; padding: 10px 12px; text-align: left; cursor: pointer; width: 100%;"
                @click="openListing(listingId)"
              >
                <div style="width: 48px; height: 48px; border-radius: 10px; background: rgba(58,37,25,0.06); overflow: hidden;">
                  <img
                    v-if="listings.find(i => i.id === listingId)?.photo"
                    :src="listings.find(i => i.id === listingId)?.photo"
                    :alt="listings.find(i => i.id === listingId)?.title"
                    style="width: 100%; height: 100%; object-fit: cover; display: block;"
                  />
                </div>
                <div style="min-width: 0;">
                  <div style="font-size: 0.88rem; font-weight: 600; color: var(--brand); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    {{ listings.find(i => i.id === listingId)?.title ?? "Nabídka" }}
                  </div>
                  <div style="font-size: 0.76rem; color: var(--muted); margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    {{ listings.find(i => i.id === listingId)?.location ?? "" }}
                  </div>
                </div>
              </button>
            </div>
          </div>

          <!-- Recenze -->
          <div ref="publicReviewsSection" style="padding: 20px; display: grid; gap: 12px;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span class="profile-section-label">Recenze</span>
              <button
                v-if="currentPublicProfile.feedback?.length"
                class="profile-panel-link"
                type="button"
                style="font-size: 0.72rem;"
                @click="openPublicProfileReviews('owners')"
              >Ukázat všechna hodnocení</button>
            </div>
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
              <div v-if="!currentPublicProfile.feedback?.length" class="profile-empty" style="flex: 0 0 100%;">
                Zatím žádné recenze.
              </div>
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

        <div v-else-if="screen === 'public-profile-reviews'" class="screen-inner profile-page">

          <!-- Tabs sticky pod topbarem -->
          <div style="position: sticky; top: 56px; z-index: 9; background: var(--bg); border-bottom: 1px solid var(--border);">
            <div class="profile-list-tabs">
              <button
                class="profile-list-tab"
                :class="{ 'is-active': publicProfileReviewsTab === 'owners' }"
                type="button"
                @click="publicProfileReviewsTab = 'owners'"
              >Od majitelů</button>
              <button
                class="profile-list-tab"
                :class="{ 'is-active': publicProfileReviewsTab === 'renters' }"
                type="button"
                @click="publicProfileReviewsTab = 'renters'"
              >Od nájemců</button>
            </div>
          </div>

          <!-- Obsah -->
          <div class="profile-list-body" style="padding: 16px; display: grid; gap: 10px;">
            <template v-for="review in currentPublicProfile.feedback.filter(r => publicProfileReviewsTab === 'owners' ? r.role === 'Majitel' : r.role === 'Nájemce')" :key="`rev-${review.author}-${review.date}`">
              <div style="background: #fff; border: 1px solid var(--border); border-radius: 14px; padding: 14px; display: grid; gap: 10px;">

                <!-- Hlavička: avatar + jméno (proklikatelné) + datum -->
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                  <button
                    type="button"
                    style="display: flex; align-items: center; gap: 10px; min-width: 0; background: transparent; border: 0; padding: 0; cursor: pointer; text-align: left;"
                    @click="review.authorProfile && openPublicProfile(review.authorProfile)"
                  >
                    <div class="profile-review-avatar" style="flex-shrink: 0;">{{ review.avatar }}</div>
                    <div style="min-width: 0;">
                      <div style="font-size: 0.9rem; font-weight: 600; color: var(--brand-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ review.author }}</div>
                      <div style="font-size: 0.7rem; color: var(--muted-2); text-transform: uppercase; letter-spacing: 0.06em; font-weight: 700; margin-top: 1px;">{{ review.role }}</div>
                    </div>
                  </button>
                  <span style="font-size: 0.72rem; color: var(--muted-2); flex-shrink: 0;">{{ review.date }}</span>
                </div>

                <!-- Hvězdičky -->
                <div class="profile-review-stars" :aria-label="`Hodnocení ${review.stars} z 5`">
                  <i v-for="star in 5" :key="star" :class="['pi', star <= review.stars ? 'pi-star-fill' : 'pi-star']"></i>
                </div>

                <!-- Text recenze -->
                <p style="margin: 0; color: var(--muted); line-height: 1.55; font-size: 0.9rem;">{{ review.text }}</p>

                <!-- Název vercajku — proklikatelný -->
                <div v-if="review.listing" style="padding-top: 6px; border-top: 1px solid var(--border);">
                  <button
                    type="button"
                    style="display: flex; align-items: center; gap: 5px; background: transparent; border: 0; padding: 0; cursor: pointer; text-align: left;"
                    @click="review.listingId && openListing(review.listingId)"
                  >
                    <i class="pi pi-wrench" style="font-size: 0.7rem; color: var(--muted-2);"></i>
                    <span style="font-size: 0.76rem; color: var(--muted); font-style: italic;">{{ review.listing }}</span>
                  </button>
                </div>
              </div>
            </template>

            <div v-if="!currentPublicProfile.feedback.filter(r => publicProfileReviewsTab === 'owners' ? r.role === 'Majitel' : r.role === 'Nájemce').length" class="profile-empty">
              {{ publicProfileReviewsTab === 'owners' ? 'Zatím žádná hodnocení od majitelů.' : 'Zatím žádná hodnocení od nájemců.' }}
            </div>
          </div>
        </div>

        <div v-else-if="screen === 'onboarding'" class="screen-inner" style="background: var(--bg); min-height: 100vh; display: flex; flex-direction: column; padding: 0;">

          <!-- KROK 0: Welcome -->
          <template v-if="onboardingStep === 0">
            <div style="display: flex; justify-content: flex-end; padding: 16px 20px 0;">
              <button type="button" style="background: transparent; border: 0; font-size: 0.88rem; color: var(--muted); cursor: pointer;" @click="skipOnboarding">Přeskočit</button>
            </div>
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 0 24px 24px;">
              <div style="width: 200px; height: 200px; background: #fff; border-radius: 32px; display: grid; place-items: center; margin-bottom: 40px;">
                <svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M34 44l-8 8 22 22 32-32-8-8-24 24-14-14z" stroke="#1f1610" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                  <path d="M56 28c4-4 10-4 14 0l6 6-6 6" stroke="#1f1610" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                  <circle cx="30" cy="30" r="8" stroke="#1b5431" stroke-width="5" fill="none"/>
                  <path d="M22 38s-8 4-8 14" stroke="#1b5431" stroke-width="5" stroke-linecap="round" fill="none"/>
                </svg>
              </div>
              <span style="font-size: 0.68rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted-2); margin-bottom: 10px;">Vítej ve Vercajkovně</span>
              <h1 style="font-family: var(--font-raw); font-size: 2.2rem; font-weight: 800; color: var(--brand); line-height: 1.1; text-align: center; margin-bottom: 12px;">
                Ahoj {{ personal.firstName || user.name.split(' ')[0] }},<br>
                <em style="color: var(--brand-2); font-style: italic;">pojď dál.</em>
              </h1>
              <p style="font-size: 0.9rem; color: var(--muted); text-align: center; line-height: 1.55; max-width: 280px;">Komunita sousedů, kteří si půjčují věci. Ať už vrtačku, vozík nebo reproduktor.</p>
            </div>
            <div style="padding: 0 20px 12px; display: flex; flex-direction: column; gap: 8px;">
              <button type="button" style="background: var(--brand); color: #fff; border: 0; border-radius: 14px; padding: 16px; font-size: 0.95rem; font-weight: 600; cursor: pointer; width: 100%;" @click="onboardingStep = 1">Jdu do toho →</button>
              <p style="text-align: center; font-size: 0.82rem; color: var(--muted);">Už máš účet? <button type="button" style="background: transparent; border: 0; font-weight: 700; color: var(--brand); cursor: pointer; font-size: inherit;" @click="goToLoginFromOnboarding">Přihlásit se</button></p>
            </div>
          </template>

          <!-- KROK 1: Role -->
          <template v-else-if="onboardingStep === 1">
            <div style="padding: 16px 20px 0;">
              <button type="button" style="background: transparent; border: 0; font-size: 0.82rem; color: var(--muted); cursor: pointer; display: flex; align-items: center; gap: 6px;" @click="onboardingStep = 0"><i class="pi pi-arrow-left" style="font-size: 0.75rem;"></i> zpět</button>
            </div>
            <div style="flex: 1; padding: 20px 20px 0;">
              <span style="font-size: 0.68rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted-2); display: block; margin-bottom: 10px;">Vítej ve Vercajkovně</span>
              <h1 style="font-family: var(--font-raw); font-size: 2.2rem; font-weight: 800; color: var(--brand); line-height: 1.1; margin-bottom: 8px;">Půjčuješ,<br><em style="color: var(--brand-2); font-style: italic;">nebo hledáš?</em></h1>
              <p style="font-size: 0.84rem; color: var(--muted); margin-bottom: 28px;">Roli můžeš kdykoliv změnit.</p>

              <!-- Karta Půjčuji -->
              <div
                :style="{
                  background: onboardingRole === 'majitel' ? 'var(--brand)' : '#fff',
                  border: '1.5px solid ' + (onboardingRole === 'majitel' ? 'var(--brand)' : 'var(--border)'),
                  borderRadius: '18px', padding: '20px 20px', marginBottom: '12px', cursor: 'pointer',
                  transition: 'all 0.18s'
                }"
                @click="onboardingRole = 'majitel'; onboardingStep = 2"
              >
                <div style="display: flex; align-items: center; gap: 14px;">
                  <div :style="{ width: '46px', height: '46px', background: onboardingRole === 'majitel' ? 'rgba(255,255,255,0.15)' : 'rgba(58,37,25,0.07)', borderRadius: '12px', display: 'grid', placeItems: 'center', flexShrink: '0' }">
                    <i class="pi pi-wrench" :style="{ color: onboardingRole === 'majitel' ? '#fff' : 'var(--brand)', fontSize: '1.1rem' }"></i>
                  </div>
                  <div style="flex: 1;">
                    <strong :style="{ fontSize: '1.15rem', color: onboardingRole === 'majitel' ? '#fff' : 'var(--brand)', display: 'block', marginBottom: '3px' }">Půjčuji</strong>
                    <span :style="{ fontSize: '0.83rem', color: onboardingRole === 'majitel' ? 'rgba(255,255,255,0.7)' : 'var(--muted)' }">Mám věci pro sousedy</span>
                  </div>
                  <i class="pi pi-arrow-right" :style="{ color: onboardingRole === 'majitel' ? 'rgba(255,255,255,0.6)' : 'var(--muted-2)', fontSize: '0.85rem', flexShrink: '0' }"></i>
                </div>
              </div>

              <!-- Karta Hledám -->
              <div
                :style="{
                  background: onboardingRole === 'najemce' ? 'var(--brand)' : '#fff',
                  border: '1.5px solid ' + (onboardingRole === 'najemce' ? 'var(--brand)' : 'var(--border)'),
                  borderRadius: '18px', padding: '20px 20px', cursor: 'pointer',
                  transition: 'all 0.18s'
                }"
                @click="onboardingRole = 'najemce'; onboardingStep = 2"
              >
                <div style="display: flex; align-items: center; gap: 14px;">
                  <div :style="{ width: '46px', height: '46px', background: onboardingRole === 'najemce' ? 'rgba(255,255,255,0.15)' : 'rgba(58,37,25,0.07)', borderRadius: '12px', display: 'grid', placeItems: 'center', flexShrink: '0' }">
                    <i class="pi pi-search" :style="{ color: onboardingRole === 'najemce' ? '#fff' : 'var(--brand)', fontSize: '1.1rem' }"></i>
                  </div>
                  <div style="flex: 1;">
                    <strong :style="{ fontSize: '1.15rem', color: onboardingRole === 'najemce' ? '#fff' : 'var(--brand)', display: 'block', marginBottom: '3px' }">Hledám</strong>
                    <span :style="{ fontSize: '0.83rem', color: onboardingRole === 'najemce' ? 'rgba(255,255,255,0.7)' : 'var(--muted)' }">Potřebuji si půjčit</span>
                  </div>
                  <i class="pi pi-arrow-right" :style="{ color: onboardingRole === 'najemce' ? 'rgba(255,255,255,0.6)' : 'var(--muted-2)', fontSize: '0.85rem', flexShrink: '0' }"></i>
                </div>
              </div>
            </div>

            <div style="padding: 8px 20px 28px;">
              <button type="button" style="background: transparent; border: 0; font-size: 0.82rem; color: var(--muted); cursor: pointer; width: 100%; text-align: center;" @click="skipOnboarding">teď ne</button>
            </div>
          </template>

          <!-- KROKY 2–5: progress bar + role badge -->
          <template v-else>
            <!-- Back + progress bar + role badge -->
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 16px 20px 0; gap: 12px;">
              <button type="button" style="background: transparent; border: 0; cursor: pointer; color: var(--muted); display: flex; align-items: center; gap: 4px; font-size: 0.82rem; flex-shrink: 0; padding: 0;" @click="onboardingStep > 2 ? onboardingStep-- : onboardingStep = 1">
                <i class="pi pi-arrow-left" style="font-size: 0.75rem;"></i> zpět
              </button>
              <div style="display: flex; gap: 4px; flex: 1;">
                <div v-for="i in 4" :key="i" :style="{ flex: 1, height: '3px', borderRadius: '999px', background: i <= onboardingStep - 1 ? (onboardingRole === 'majitel' ? 'var(--brand)' : 'var(--brand-2)') : 'rgba(58,37,25,0.14)' }"></div>
              </div>
              <div :style="{ display: 'flex', alignItems: 'center', gap: '6px', background: onboardingRole === 'majitel' ? 'rgba(58,37,25,0.08)' : 'rgba(27,84,49,0.08)', border: '1px solid ' + (onboardingRole === 'majitel' ? 'rgba(58,37,25,0.2)' : 'rgba(27,84,49,0.2)'), borderRadius: '999px', padding: '4px 10px 4px 8px' }">
                <i :class="onboardingRole === 'majitel' ? 'pi pi-wrench' : 'pi pi-search'" style="font-size: 0.72rem; color: var(--brand-2);"></i>
                <span style="font-size: 0.75rem; font-weight: 600; color: var(--brand);">{{ onboardingRole === 'majitel' ? 'Majitel' : 'Nájemce' }}</span>
                <button type="button" style="background: transparent; border: 0; cursor: pointer; color: var(--muted-2); font-size: 0.72rem; padding: 0; margin-left: 2px; line-height: 1;" @click="onboardingStep = 1">×</button>
              </div>
            </div>

            <!-- KROK 2: Jak to funguje -->
            <template v-if="onboardingStep === 2">
              <div style="flex: 1; padding: 20px 24px 0;">
                <h1 style="font-family: var(--font-raw); font-size: 2.2rem; font-weight: 800; color: var(--brand); line-height: 1.1; margin-bottom: 8px;">
                  {{ onboardingRole === 'majitel' ? 'Jak to' : 'Jak si' }}<br>
                  <em :style="{ color: onboardingRole === 'majitel' ? 'var(--brand)' : 'var(--brand-2)', fontStyle: 'italic' }">{{ onboardingRole === 'majitel' ? 'funguje.' : 'půjčit.' }}</em>
                </h1>
                <p style="font-size: 0.84rem; color: var(--muted); margin-bottom: 32px;">{{ onboardingRole === 'majitel' ? 'Čtyři kroky, aby ti vercajk vydělával.' : 'Pět kroků a vercajk je tvůj.' }}</p>

                <div v-for="(step, i) in (onboardingRole === 'majitel'
                  ? [{ label: 'Přidej nabídku', desc: 'Foto, popis, cena a kauce' }, { label: 'Schval žádost', desc: 'Přijde notifikace, ty rozhoduješ' }, { label: 'Potvrď platbu', desc: 'Nájemce zaplatí, ty potvrdíš' }, { label: 'Předej a převezmi', desc: 'Napiš hodnocení' }]
                  : [{ label: 'Najdi', desc: 'Hledej podle kategorie nebo vzdálenosti' }, { label: 'Požádej', desc: 'Majitel tě schválí nebo odmítne' }, { label: 'Zaplať', desc: 'Pošli platbu, majitel potvrdí' }, { label: 'Vyzvedni a vrať', desc: 'Předání i vrácení probíhá osobně' }, { label: 'Ohodnoť', desc: 'Obě strany hodnotí — komunita stojí na důvěře' }])"
                  :key="i"
                  style="display: flex; align-items: flex-start; gap: 16px; margin-bottom: 22px;"
                >
                  <div :style="{ width: '34px', height: '34px', borderRadius: '999px', background: onboardingRole === 'majitel' ? 'var(--brand)' : 'var(--brand-2)', color: '#fff', display: 'grid', placeItems: 'center', fontSize: '0.85rem', fontWeight: '700', flexShrink: '0', marginTop: '1px' }">{{ i + 1 }}</div>
                  <div>
                    <strong style="font-size: 1rem; color: var(--brand); display: block; margin-bottom: 2px;">{{ step.label }}</strong>
                    <span style="font-size: 0.83rem; color: var(--muted);">{{ step.desc }}</span>
                  </div>
                </div>
              </div>
              <div style="padding: 16px 20px 28px; display: flex; flex-direction: column; gap: 8px;">
                <button type="button" :style="{ background: onboardingRole === 'majitel' ? 'var(--brand)' : 'var(--brand-2)', color: '#fff', border: '0', borderRadius: '14px', padding: '16px', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer', width: '100%' }" @click="onboardingStep = 3">Pokračovat →</button>
                <button type="button" style="background: transparent; border: 0; font-size: 0.82rem; color: var(--muted); cursor: pointer; padding: 4px; text-align: center;" @click="onboardingStep = 1">← zpět</button>
              </div>
            </template>

            <!-- KROK 3: Komunita -->
            <template v-else-if="onboardingStep === 3">
              <div style="flex: 1; padding: 20px 20px 0;">
                <h1 style="font-family: var(--font-raw); font-size: 1.9rem; font-weight: 800; color: var(--brand); line-height: 1.1; margin-bottom: 8px;">Komunita,<br><em style="color: var(--brand-2); font-style: italic;">co si věří.</em></h1>
                <p style="font-size: 0.84rem; color: var(--muted); margin-bottom: 20px;">Ověřené profily, kauce a hodnocení po každé půjčce.</p>

                <div v-for="item in (onboardingRole === 'majitel'
                  ? [{ icon: 'pi-verified', label: 'Ověřené profily', desc: 'Každý uživatel projde ověřením e-mailu.' }, { icon: 'pi-credit-card', label: 'Kauce', desc: 'Jako majitel si volíš kauci v případě poškození.' }, { icon: 'pi-star', label: 'Hodnocení', desc: 'Na reputaci záleží.' }]
                  : [{ icon: 'pi-verified', label: 'Ověřené profily', desc: 'Každý uživatel projde ověřením e-mailu.' }, { icon: 'pi-credit-card', label: 'Kauce', desc: 'Majitel může požadovat kauci. Vrátí se po vrácení vercajku.' }, { icon: 'pi-star', label: 'Hodnocení', desc: 'Na reputaci záleží.' }]
                )" :key="item.label"
                  style="background: #fff; border: 1px solid var(--border); border-radius: 14px; padding: 14px 16px; margin-bottom: 8px; display: flex; align-items: flex-start; gap: 12px;">
                  <div style="width: 40px; height: 40px; background: rgba(58,37,25,0.06); border-radius: 10px; display: grid; place-items: center; flex-shrink: 0; margin-top: 2px;"><i :class="['pi', item.icon]" style="color: var(--brand);"></i></div>
                  <div><strong style="font-size: 0.9rem; color: var(--brand); display: block; margin-bottom: 2px;">{{ item.label }}</strong><span style="font-size: 0.8rem; color: var(--muted); line-height: 1.4;">{{ item.desc }}</span></div>
                </div>
              </div>
              <div style="padding: 16px 20px 24px; display: flex; flex-direction: column; gap: 6px;">
                <button type="button" :style="{ background: onboardingRole === 'majitel' ? 'var(--brand)' : 'var(--brand-2)', color: '#fff', border: '0', borderRadius: '14px', padding: '16px', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer', width: '100%' }" @click="onboardingStep = 4">Pokračovat →</button>
              </div>
            </template>

            <!-- KROK 4: Kategorie -->
            <template v-else-if="onboardingStep === 4">
              <div style="flex: 1; padding: 20px 20px 0;">
                <h1 style="font-family: var(--font-raw); font-size: 1.9rem; font-weight: 800; color: var(--brand); line-height: 1.1; margin-bottom: 8px;">{{ onboardingRole === 'majitel' ? 'Co budeš' : 'Co tě' }}<br><em style="color: var(--brand-2); font-style: italic;">{{ onboardingRole === 'majitel' ? 'půjčovat?' : 'zajímá?' }}</em></h1>
                <p style="font-size: 0.84rem; color: var(--muted); margin-bottom: 16px;">{{ onboardingRole === 'majitel' ? 'Vyber kategorie — tržiště ti ukáže, jak na tom jsi v okolí.' : 'Vyber kategorie a ukážeme ti nejlepší nabídky v okolí.' }}</p>
                <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px;">
                  <button
                    v-for="cat in ['Elektrické nářadí','Ruční nářadí','Zahrada','Zvuk & světlo','Outdoor & stan','Vozíky & stěhování','Party výbava','Kola & sport','Dětské','Čištění & úklid']"
                    :key="cat"
                    type="button"
                    :style="{ background: onboardingCategories.includes(cat) ? 'var(--brand-2)' : '#fff', color: onboardingCategories.includes(cat) ? '#fff' : 'var(--brand)', border: '1px solid ' + (onboardingCategories.includes(cat) ? 'var(--brand-2)' : 'var(--border)'), borderRadius: '999px', padding: '8px 14px', fontSize: '0.82rem', cursor: 'pointer' }"
                    @click="onboardingCategories.includes(cat) ? onboardingCategories.splice(onboardingCategories.indexOf(cat), 1) : onboardingCategories.push(cat)"
                  >{{ cat }}</button>
                </div>
                <p style="font-size: 0.78rem; color: var(--muted-2);">Vyber aspoň jednu — nebo pokračuj bez výběru.</p>
              </div>
              <div style="padding: 16px 20px 24px; display: flex; flex-direction: column; gap: 6px;">
                <button type="button" :style="{ background: onboardingRole === 'majitel' ? 'var(--brand)' : 'var(--brand-2)', color: '#fff', border: '0', borderRadius: '14px', padding: '16px', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer', width: '100%' }" @click="onboardingStep = 5">Pokračovat →</button>
                <button type="button" style="background: transparent; border: 0; font-size: 0.82rem; color: var(--muted); cursor: pointer; text-align: center;" @click="onboardingStep = 5">přeskočit</button>
              </div>
            </template>

            <!-- KROK 5: Lokace -->
            <template v-else-if="onboardingStep === 5">
              <div style="flex: 1; padding: 20px 20px 0;">
                <h1 style="font-family: var(--font-raw); font-size: 1.9rem; font-weight: 800; color: var(--brand); line-height: 1.1; margin-bottom: 8px;">{{ onboardingRole === 'majitel' ? 'Kde máš' : 'Kde hledáš' }}<br><em style="color: var(--brand-2); font-style: italic;">{{ onboardingRole === 'majitel' ? 'verštat?' : 'vercajk?' }}</em></h1>
                <p style="font-size: 0.84rem; color: var(--muted); margin-bottom: 20px;">{{ onboardingRole === 'majitel' ? 'Nájemci uvidí čtvrť, ne adresu. Přesnost = víc zájemců.' : 'Najdeme sousedy s vercajkem co nejblíže tobě.' }}</p>

                <div :style="{ background: '#fff', border: onboardingLocMode === 'gps' ? '2px solid var(--brand-2)' : '1px solid var(--border)', borderRadius: '14px', padding: '14px 16px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }" @click="onboardingLocMode = 'gps'">
                  <div style="width: 40px; height: 40px; background: rgba(27,84,49,0.08); border-radius: 10px; display: grid; place-items: center; flex-shrink: 0;"><i class="pi pi-map-marker" style="color: var(--brand-2);"></i></div>
                  <div><strong style="font-size: 0.9rem; color: var(--brand); display: block;">Použít moji polohu</strong><span style="font-size: 0.78rem; color: var(--muted);">Jedno kliknutí, nejpřesnější výsledek.</span></div>
                </div>

                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                  <div style="flex: 1; height: 1px; background: var(--border);"></div>
                  <span style="font-size: 0.68rem; font-weight: 700; letter-spacing: 0.1em; color: var(--muted-2); text-transform: uppercase;">nebo</span>
                  <div style="flex: 1; height: 1px; background: var(--border);"></div>
                </div>

                <div :style="{ background: '#fff', border: onboardingLocMode === 'manual' ? '2px solid var(--brand-2)' : '1px solid var(--border)', borderRadius: '14px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }" @click="onboardingLocMode = 'manual'">
                  <div style="width: 40px; height: 40px; background: rgba(58,37,25,0.06); border-radius: 10px; display: grid; place-items: center; flex-shrink: 0;"><i class="pi pi-search" style="color: var(--muted);"></i></div>
                  <span style="font-size: 0.84rem; color: var(--muted-2);">Praha 7 — Letná...</span>
                </div>

                <div style="background: rgba(58,37,25,0.05); border-radius: 10px; padding: 10px 14px; margin-top: 10px;">
                  <span style="font-size: 0.78rem; color: var(--muted);">{{ onboardingRole === 'majitel' ? 'Nájemci uvidí čtvrť — přesnou adresu nikdo neuvidí.' : 'Tvoji polohu vidíš jen ty. Výsledky jsou anonymizované.' }}</span>
                </div>
              </div>
              <div style="padding: 16px 20px 24px; display: flex; flex-direction: column; gap: 6px;">
                <button type="button" :style="{ background: onboardingRole === 'majitel' ? 'var(--brand)' : 'var(--brand-2)', color: '#fff', border: '0', borderRadius: '14px', padding: '16px', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer', width: '100%' }" @click="onboardingStep = 6">Pokračovat →</button>
                <button type="button" style="background: transparent; border: 0; font-size: 0.82rem; color: var(--muted); cursor: pointer; text-align: center;" @click="onboardingStep = 6">přeskočit</button>
              </div>
            </template>

            <!-- KROK 6: CTA závěr -->
            <template v-else-if="onboardingStep === 6">
              <div style="flex: 1; padding: 20px 20px 0;">
                <h1 style="font-family: var(--font-raw); font-size: 1.9rem; font-weight: 800; color: var(--brand); line-height: 1.1; margin-bottom: 8px;">
                  <template v-if="onboardingRole === 'majitel'">Přidej první<br><em style="color: var(--brand-2); font-style: italic;">vercajk.</em></template>
                  <template v-else>Najdi první<br><em style="color: var(--brand-2); font-style: italic;">vercajk.</em></template>
                </h1>

                <div style="background: rgba(27,84,49,0.07); border-radius: 14px; padding: 14px 16px; margin-bottom: 16px;">
                  <p style="font-size: 0.86rem; font-weight: 600; color: var(--brand);">{{ onboardingRole === 'majitel' ? 'Skvělý start! Přidej první vercajk — za 2 minuty jsi v nabídce.' : 'Vítej v komunitě! Podívej se, co nabízejí sousedé v okolí.' }}</p>
                </div>

                <div v-for="(item, i) in (onboardingRole === 'majitel' ? [{ icon: 'pi-camera', label: 'Fotky', desc: 'Stačí 1–3 fotky.' }, { icon: 'pi-file-edit', label: 'Popis', desc: 'Co to je, stav, co přibalíš.' }, { icon: 'pi-credit-card', label: 'Cena a kauce', desc: 'Průměr v okolí ti poradíme.' }] : [{ icon: 'pi-search', label: 'Hledej v okolí', desc: 'Filtruj podle kategorie nebo vzdálenosti.' }, { icon: 'pi-heart', label: 'Ulož si oblíbené', desc: 'Věci, ke kterým se chceš vrátit.' }])" :key="i"
                  style="background: #fff; border: 1px solid var(--border); border-radius: 14px; padding: 12px 16px; margin-bottom: 8px; display: flex; align-items: center; gap: 12px;">
                  <div style="width: 40px; height: 40px; background: rgba(58,37,25,0.06); border-radius: 10px; display: grid; place-items: center; flex-shrink: 0;"><i :class="['pi', item.icon]" style="color: var(--brand);"></i></div>
                  <div style="flex: 1;"><strong style="font-size: 0.88rem; color: var(--brand); display: block;">{{ item.label }}</strong><span style="font-size: 0.78rem; color: var(--muted);">{{ item.desc }}</span></div>
                  <span style="font-size: 0.75rem; font-weight: 700; color: var(--muted-2);">0{{ i + 1 }}</span>
                </div>
              </div>
              <div style="padding: 16px 20px 24px; display: flex; flex-direction: column; gap: 6px;">
                <button type="button" :style="{ background: onboardingRole === 'majitel' ? 'var(--brand)' : 'var(--brand-2)', color: '#fff', border: '0', borderRadius: '14px', padding: '16px', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer', width: '100%' }"
                  @click="completeOnboarding">
                  {{ onboardingRole === 'majitel' ? 'Přidat vercajk →' : 'Prohlížet nabídky →' }}
                </button>
                <button type="button" style="background: transparent; border: 0; font-size: 0.82rem; color: var(--muted); cursor: pointer; text-align: center;" @click="skipOnboarding">přeskočit</button>
              </div>
            </template>
          </template>
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

          <!-- ── Banery stavu ── -->

          <!-- Zamítnuto -->
          <div v-if="pendingRequest.statusLabel === 'Zamítnuto'" class="pending-rejected-banner">
            <div class="pending-rejected-icon"><i class="pi pi-times-circle"></i></div>
            <div class="pending-payment-wait-copy">
              <strong>Žádost zamítnuta</strong>
              <span v-if="pendingRole === 'tenant'">Majitel tvou žádost zamítl. Zkus jinou nabídku v marketplace.</span>
              <span v-else>Žádost byla zamítnuta. Věc je opět dostupná pro ostatní.</span>
            </div>
          </div>

          <!-- Platba odeslána -->
          <div v-if="pendingRequest.statusLabel === 'Platba odeslána – čeká na potvrzení'" class="pending-payment-wait">
            <div class="pending-payment-wait-icon"><i class="pi pi-clock"></i></div>
            <div class="pending-payment-wait-copy">
              <strong v-if="pendingRole === 'tenant'">Čeká na potvrzení</strong>
              <strong v-else>Platba přijata — potvrďte ji</strong>
              <span v-if="pendingRole === 'tenant'">Majitel má 24 hodin na potvrzení. O výsledku tě budeme informovat v notifikacích.</span>
              <span v-else>Nájemce odeslal platbu. Potvrďte přijetí do 24 hodin.</span>
            </div>
          </div>

          <!-- Platba potvrzena -->
          <div v-if="pendingRequest.statusLabel === 'Platba potvrzena - od majitele'" class="pending-confirmed-banner">
            <div class="pending-confirmed-icon"><i class="pi pi-check-circle"></i></div>
            <div class="pending-payment-wait-copy">
              <strong>Platba potvrzena</strong>
              <span>Vše je v pořádku. Domluvte si předání s majitelem.</span>
            </div>
          </div>

          <!-- Vyzvednutí čeká -->
          <div v-if="pendingRequest.statusLabel === 'Vyzvednutí – čeká na potvrzení'" class="pending-payment-wait">
            <div class="pending-payment-wait-icon"><i class="pi pi-box"></i></div>
            <div class="pending-payment-wait-copy">
              <strong v-if="pendingRole === 'tenant'">Potvrďte převzetí</strong>
              <strong v-else>Čeká na potvrzení nájemce</strong>
              <span v-if="pendingRole === 'tenant'">Vercajk byl připraven k předání. Potvrďte, že jste ho převzali.</span>
              <span v-else>Nájemce zatím nepotvrdil převzetí. Počkejte na jeho potvrzení.</span>
            </div>
          </div>

          <!-- Vrácení čeká -->
          <div v-if="pendingRequest.statusLabel === 'Vrácení – čeká na potvrzení'" class="pending-payment-wait">
            <div class="pending-payment-wait-icon"><i class="pi pi-replay"></i></div>
            <div class="pending-payment-wait-copy">
              <strong v-if="pendingRole === 'tenant'">Potvrďte vrácení</strong>
              <strong v-else>Čeká na potvrzení vrácení</strong>
              <span v-if="pendingRole === 'tenant'">Výpůjčka skončila. Potvrďte, že jste vercajk vrátili majiteli.</span>
              <span v-else>Nájemce vrací vercajk. Potvrďte převzetí a zkontrolujte stav.</span>
            </div>
          </div>

          <!-- Zrušeno -->
          <div v-if="pendingRequest.statusLabel === 'Zrušeno'" class="pending-rejected-banner">
            <div class="pending-rejected-icon"><i class="pi pi-ban"></i></div>
            <div class="pending-payment-wait-copy">
              <strong>Rezervace zrušena</strong>
              <span v-if="pendingRole === 'tenant'">Rezervaci jsi zrušil. Věc je opět dostupná pro ostatní zájemce.</span>
              <span v-else>Nájemce zrušil rezervaci. Věc je opět dostupná v marketplace.</span>
            </div>
          </div>

          <!-- Vrácení potvrzeno -->
          <div v-if="pendingRequest.statusLabel === 'Vrácení potvrzeno'" class="pending-confirmed-banner">
            <div class="pending-confirmed-icon"><i class="pi pi-check-circle"></i></div>
            <div class="pending-payment-wait-copy">
              <strong>Vrácení potvrzeno</strong>
              <span>Výpůjčka je uzavřena. Nezapomeň ohodnotit druhou stranu.</span>
            </div>
          </div>

          <div class="pending-request-card">
            <div class="pending-request-thumb" aria-hidden="true"></div>
            <div class="pending-request-card-copy">
              <strong>{{ pendingListing.title }}</strong>
              <span>{{ fmt(pendingListing.priceValue) }} Kč / den</span>
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
              <strong>{{ fmt(pendingSummary.rental) }} Kč</strong>
            </div>
            <div>
              <span>Servisní poplatek</span>
              <strong>{{ fmt(pendingRequest.serviceFee) }} Kč</strong>
            </div>
            <div>
              <span>Vratná kauce</span>
              <strong>{{ fmt(pendingRequest.deposit) }} Kč</strong>
            </div>
            <div class="pending-request-total">
              <span>Celkem</span>
              <strong>{{ fmt(pendingSummary.total) }} Kč</strong>
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
                <strong>{{ fmt(pendingSummary.total) }} Kč</strong>
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
                aria-label="SMS"
                :disabled="pendingRequestActionsDisabled"
                :class="{ 'is-disabled': pendingRequestActionsDisabled }"
              >
                <i class="pi pi-comment"></i>
              </button>
              <button
                type="button"
                aria-label="E-mail"
                :disabled="pendingRequestActionsDisabled"
                :class="{ 'is-disabled': pendingRequestActionsDisabled }"
              >
                <i class="pi pi-envelope"></i>
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
              <div
                v-for="offer in filteredProfileOffers"
                :key="`page-offer-${offer.id}`"
                class="profile-item"
                :class="{
                  'is-dimmed':
                    offer.statusLabel === 'Pronájem ukončen' ||
                    offer.statusLabel === 'Zamítnutí' ||
                    offer.statusLabel === 'Zrušeno',
                }"
              >
                <button
                  type="button"
                  class="profile-item-main"
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
                  type="button"
                  class="profile-item-edit-icon"
                  :class="{ 'is-active': offer.canEdit }"
                  aria-label="Upravit nabídku"
                  :disabled="!offer.canEdit"
                  @click="offer.canEdit && openEditListing(offer.id)"
                >
                  <i class="pi pi-pencil"></i>
                </button>
              </div>
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
              <div
                v-for="request in filteredProfileRequests"
                :key="`page-request-${request.id}`"
                class="profile-item"
                :class="{
                  'is-dimmed':
                    request.statusLabel === 'Pronájem ukončen' ||
                  request.statusLabel === 'Zamítnutí' ||
                  request.statusLabel === 'Zrušeno',
                }"
              >
                <button
                  type="button"
                  class="profile-item-main"
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
              </div>
              <div v-if="!filteredProfileRequests.length" class="profile-empty">Zatím nic nepoptáváš.</div>
            </div>
          </div>
        </div>

        <div v-else-if="screen === 'add-listing'" class="screen-inner" :class="`add-listing-step-${addListingStep}`">
          <PvCard class="add-flow">
            <template #content>
              <!-- Mobilní header (skryt na desktopu pro krok 1) -->
              <div class="add-flow-header" :class="{ 'add-flow-header--hide-desktop': addListingStep === 1 }">
                <div class="add-flow-step-row">
                  <span class="add-flow-step">Krok {{ addListingStep }} z 4</span>
                  <span class="add-flow-step-label">
                    {{
                      addListingStep === 1
                        ? "Základní info"
                        : addListingStep === 2
                          ? "Nastavení pronájmu"
                          : addListingStep === 3
                            ? "Detail vercajku"
                            : "Předání a pravidla"
                    }}
                  </span>
                </div>
                <div class="add-flow-progress" aria-hidden="true">
                  <div
                    class="add-flow-progress-bar"
                    :style="{ width: `${Math.round((addListingStep / 4) * 100)}%` }"
                  />                </div>
              </div>

              <div v-if="addListingStep === 1" class="add-listing-body al-step1">

                <!-- ── LEVÝ PANEL: Fotografie ── -->
                <div class="al-col al-col-left">
                  <div class="al-editorial">
                    <span class="al-editorial-label">01 / Fotografie</span>
                    <h2 class="al-editorial-title">Ukažte svůj vercajk&nbsp;v&nbsp;akci</h2>
                    <p class="al-editorial-desc">Kvalitní fotky zvyšují šanci na zapůjčení až o&nbsp;40&nbsp;%. Nahrajte ideálně fotku celého setu a detail značky.</p>
                  </div>

                  <input
                    ref="addListingPhotoInput"
                    class="hidden"
                    type="file"
                    accept="image/*"
                    multiple
                    @change="handleAddListingFiles"
                  />

                  <div class="add-flow-dropzone" :class="{ 'is-error': addListingProceedAttempt && addListingPhotosError }">
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
                          <strong>Přetáhněte fotky sem</strong>
                          <span>Podporujeme JPG, PNG (max&nbsp;10MB)</span>
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

                  <div class="al-photo-note">
                    <i class="pi pi-info-circle" aria-hidden="true"></i>
                    <span>Všechny fotky budou automaticky optimalizovány</span>
                  </div>
                </div>

                <!-- ── PRAVÝ PANEL: Formulář ── -->
                <div class="al-col al-col-right">

                  <!-- Desktopový header (progress bar) -->
                  <div class="al-desktop-header">
                    <div class="add-flow-step-row">
                      <span class="add-flow-step">Krok 1 z 4</span>
                      <span class="add-flow-step-label">Základní info</span>
                    </div>
                    <div class="add-flow-progress" aria-hidden="true">
                      <div class="add-flow-progress-bar" style="width: 25%" />
                    </div>
                  </div>

                  <!-- Název -->
                  <div class="add-flow-section al-right-section">
                    <h3 class="add-flow-section-title">Název vercajku</h3>
                    <div class="add-flow-input" :class="{ 'is-error': addListingProceedAttempt && addListingTitleError }">
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

                  <!-- Kategorie -->
                  <div class="add-flow-section al-right-section" :class="{ 'is-error': addListingProceedAttempt && addListingCategoryError }">
                    <h3 class="al-section-heading">Vyberte kategorii</h3>
                    <!-- Desktop: dlaždice s ikonami -->
                    <div class="al-cat-tiles">
                      <button
                        v-for="item in categories.filter((cat) => cat.id !== 'all')"
                        :key="`al-tile-${item.id}`"
                        type="button"
                        class="al-cat-tile"
                        :class="{ 'is-active': addListingDraft.categoryId === item.id }"
                        @click="addListingDraft.categoryId = item.id"
                      >
                        <span class="al-cat-tile-icon" aria-hidden="true">
                          <i :class="['pi', item.id === 'stavba' ? 'pi-home' : item.id === 'dilna' ? 'pi-wrench' : item.id === 'udrzba' ? 'pi-cog' : item.id === 'mereni' ? 'pi-sliders-h' : 'pi-ellipsis-h']"></i>
                        </span>
                        <span class="al-cat-tile-label">{{ item.label.toUpperCase() }}</span>
                      </button>
                    </div>
                    <!-- Mobilní: chips -->
                    <div class="add-flow-chips al-chips-mobile" :class="{ 'is-error': addListingProceedAttempt && addListingCategoryError }">
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

                  <!-- Popis / Podrobnosti -->
                  <div class="add-flow-section al-right-section">
                    <div class="al-section-heading-row">
                      <h3 class="al-section-heading">Podrobnosti</h3>
                      <span class="al-badge-required">POVINNÉ</span>
                    </div>
                    <div class="add-flow-input add-flow-input-textarea">
                      <textarea
                        v-model="addListingDraft.description"
                        class="add-flow-native"
                        rows="5"
                        placeholder="V jakém stavu je nářadí? Co všechno nájemce dostane? (kufr, baterie, vrtáky...)"
                      ></textarea>
                    </div>
                  </div>

                  <!-- Akce (desktop spodní lišta) -->
                  <div class="al-right-actions">
                    <button type="button" class="al-btn-cancel" @click="prevAddListingStep">Zrušit</button>
                    <button type="button" class="al-btn-proceed" @click="nextAddListingStep">
                      Pokračovat
                      <i class="pi pi-chevron-right" aria-hidden="true"></i>
                    </button>
                  </div>

                </div>

                <!-- Mobilní CTA (skryto na desktopu) -->
                <div class="add-flow-section add-flow-inline-cta">
                  <button type="button" class="add-flow-cta-primary" @click="nextAddListingStep">Pokračovat</button>
                </div>

              </div>

              <div v-else-if="addListingStep === 2" class="add-listing-body add-flow-step2">
                <div class="add-flow-section">
                  <h3 class="add-flow-section-title">Cena za den</h3>
                  <div class="add-flow-input add-flow-input-suffix" :class="{ 'is-error': addListingProceedAttempt && addListingPriceError }">
                    <input v-model.number="addListingDraft.pricePerDay" class="add-flow-native" type="number" min="0" placeholder="0" />
                    <span class="add-flow-suffix">Kč</span>
                  </div>
                  <div v-if="addListingProceedAttempt && addListingPriceError" class="add-flow-error">
                    Zadej cenu za den (alespoň 1 Kč).
                  </div>
                </div>

                <div class="add-flow-section">
                  <label class="add-flow-toggle-card">
                    <div class="add-flow-toggle-card-copy">
                      <strong>Vratná kauce</strong>
                      <span>Vrátí se po hladkém předání.</span>
                    </div>
                    <div class="add-flow-toggle" role="presentation">
                      <input v-model="addListingDraft.depositEnabled" type="checkbox" />
                      <span aria-hidden="true"></span>
                    </div>
                  </label>
                  <div v-if="addListingDraft.depositEnabled" class="add-flow-input add-flow-input-suffix" :class="{ 'is-error': addListingProceedAttempt && addListingDepositError }">
                    <input
                      v-model.number="addListingDraft.depositAmount"
                      class="add-flow-native"
                      type="number"
                      min="0"
                      placeholder="0"
                    />
                    <span class="add-flow-suffix">Kč</span>
                  </div>
                  <div v-if="addListingProceedAttempt && addListingDepositError" class="add-flow-error">
                    Zadej výši kauce (alespoň 1 Kč), nebo ji vypni.
                  </div>
                </div>

                <div class="add-flow-section">
                  <h3 class="add-flow-section-title">Dostupnost pro vypůjčení</h3>
                  <div class="add-flow-chips">
                    <button type="button" class="add-flow-chip" :class="{ 'is-active': addListingDraft.availabilityMode === 'always' }" @click="applyAvailabilityPreset('always')">Vždy</button>
                    <button type="button" class="add-flow-chip" :class="{ 'is-active': addListingDraft.availabilityMode === 'weekdays' }" @click="applyAvailabilityPreset('weekdays')">Pracovní dny</button>
                    <button type="button" class="add-flow-chip" :class="{ 'is-active': addListingDraft.availabilityMode === 'weekends' }" @click="applyAvailabilityPreset('weekends')">Víkendy</button>
                    <button type="button" class="add-flow-chip" :class="{ 'is-active': addListingDraft.availabilityMode === 'custom' }" @click="applyAvailabilityPreset('custom')">Vlastní výběr</button>
                  </div>
                  <div class="add-flow-avail-until">
                    <label class="add-flow-avail-until-label">Dostupné do:</label>
                    <input type="date" v-model="addListingDraft.availabilityUntil" class="add-flow-native add-flow-avail-until-input" :min="new Date().toISOString().slice(0, 10)" />
                    <span class="add-flow-help">Nechte prázdné pro trvalou nabídku.</span>
                  </div>
                  <div class="add-flow-calendar" :class="{ 'is-error': addListingProceedAttempt && addListingAvailabilityError }" style="margin-top: 12px;">
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
                  <div v-if="addListingProceedAttempt && addListingAvailabilityError" class="add-flow-error">
                    Vyber aspoň jeden den (nebo rozmezí) v kalendáři.
                  </div>
                  <div class="add-flow-help">
                    <span v-if="availabilityRangeStart">Vyberte poslední den rozmezí.</span>
                    <span v-else>Klepnutím na preset předvyplníš dny — pak je můžeš libovolně upravit.</span>
                  </div>
                </div>

                <div class="add-flow-section">
                  <h3 class="add-flow-section-title">Lokalita vercajku</h3>
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

              <div v-else-if="addListingStep === 3" class="add-listing-body add-flow-step3">
                <div class="add-flow-section">
                  <h3 class="add-flow-section-title">Technické parametry</h3>
                  <div class="add-flow-grid">
                    <div class="add-flow-field">
                      <span>Značka <span class="add-flow-required">*</span></span>
                      <div class="add-flow-brand-wrap">
                        <div class="add-flow-input" :class="{ 'is-error': addListingProceedAttempt && addListingBrandError }">
                          <input
                            :value="addListingDraft.brand"
                            class="add-flow-native"
                            type="text"
                            placeholder="Po 3 znacích nabídneme značky…"
                            autocomplete="off"
                            @input="onBrandInput(($event.target as HTMLInputElement).value)"
                            @blur="clearBrandSuggestions()"
                          />
                        </div>
                        <div v-if="!brandSuggestions.length && addListingDraft.brand.length < 3 && addListingDraft.brand !== 'Ostatní'" class="add-flow-brand-hint">
                          zadej alespoň 3 znaky — nebo zvol
                          <button type="button" class="add-flow-brand-other" @mousedown.prevent="selectBrand('Ostatní')">Ostatní</button>
                        </div>
                        <div v-if="brandSuggestions.length" class="add-flow-brand-suggestions">
                          <button
                            v-for="brand in brandSuggestions"
                            :key="brand"
                            type="button"
                            class="add-flow-brand-option"
                            @mousedown.prevent="selectBrand(brand)"
                          >
                            {{ brand }}
                          </button>
                          <button type="button" class="add-flow-brand-option" @mousedown.prevent="selectBrand('Ostatní')">Ostatní</button>
                        </div>
                      </div>
                      <div v-if="addListingProceedAttempt && addListingBrandError" class="add-flow-error">Vyber nebo zadej značku.</div>
                    </div>
                    <div class="add-flow-field">
                      <span>Model</span>
                      <div class="add-flow-input">
                        <input v-model="addListingDraft.model" class="add-flow-native" type="text" placeholder="Přesné označení modelu" />
                      </div>
                    </div>
                    <div class="add-flow-field add-flow-field-full">
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
                        <div v-if="conditionDropdownOpen" class="add-flow-condition-list" role="listbox">
                          <button
                            v-for="option in conditionOptions"
                            :key="`condition-opt-${option.id}`"
                            type="button"
                            class="add-flow-condition-option"
                            :class="{ 'is-active': addListingDraft.condition === option.id }"
                            role="option"
                            @click="selectCondition(option.id)"
                          >
                            <strong>{{ option.label }}</strong>
                            <span> — {{ option.note }}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div class="add-flow-field add-flow-field-full">
                      <span>Příslušenství</span>
                      <div class="add-flow-input">
                        <input v-model="addListingDraft.accessories" class="add-flow-native" type="text" placeholder="Např. kufr, náhradní baterie..." maxlength="150" />
                      </div>
                      <div class="add-flow-char-count" :class="{ 'is-near': addListingDraft.accessories.length > 120 }">
                        {{ addListingDraft.accessories.length }} / 150
                      </div>
                    </div>
                    <div class="add-flow-field-full add-flow-show-more-toggle">
                      <button type="button" class="add-flow-show-more-btn" @click="addListingShowMore = !addListingShowMore">
                        <span>{{ addListingShowMore ? 'Skrýt' : 'Zobrazit více' }}</span>
                        <i :class="['pi', addListingShowMore ? 'pi-chevron-up' : 'pi-chevron-down']"></i>
                      </button>
                    </div>
                    <template v-if="addListingShowMore">
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
                        <span>Další parametry</span>
                        <div class="add-flow-input add-flow-input-textarea">
                          <textarea v-model="addListingDraft.additionalParams" class="add-flow-native" rows="4" placeholder="Výkon, rozměry, hmotnost nebo jiné důležité specifikace..."></textarea>
                        </div>
                      </div>
                    </template>
                  </div>
                </div>

              </div>

              <div v-else-if="addListingStep === 4" class="add-listing-body add-flow-step3">
                <div class="add-flow-section">
                  <h3 class="add-flow-section-title">Způsob vyzvednutí</h3>
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
                  <h3 class="add-flow-section-title">Čas předání</h3>
                  <div class="add-flow-grid">
                    <div class="add-flow-field">
                      <span>Vyzvednutí od</span>
                      <div class="add-flow-input">
                        <input v-model="addListingDraft.pickupTimeFrom" class="add-flow-native" type="time" />
                      </div>
                    </div>
                    <div class="add-flow-field">
                      <span>Vrácení do</span>
                      <div class="add-flow-input">
                        <input v-model="addListingDraft.pickupTimeTo" class="add-flow-native" type="time" />
                      </div>
                    </div>
                  </div>
                </div>
                <div class="add-flow-section">
                  <h3 class="add-flow-section-title">Pravidla a omezení</h3>
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
                    <div v-if="addListingDraft.rules.other" class="add-flow-rules-other">
                      <textarea
                        v-model="addListingDraft.rules.otherDescription"
                        class="rules-other-textarea"
                        :class="{ 'is-error': addListingProceedAttempt && !addListingDraft.rules.otherDescription.trim() }"
                        placeholder="Popište vlastní pravidla (povinné)"
                        rows="3"
                      ></textarea>
                      <div v-if="addListingProceedAttempt && !addListingDraft.rules.otherDescription.trim()" class="add-flow-error">
                        Popiš vlastní pravidla — pole nesmí být prázdné.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="add-flow-cta">
                <button type="button" class="add-flow-cta-primary" @click="nextAddListingStep">
                  {{ addListingStep === 4 ? (addListingMode === 'edit' ? "Uložit změny" : "Zveřejnit nabídku") : "Pokračovat" }}
                </button>
                <button type="button" class="add-flow-cta-ghost" @click="prevAddListingStep">Zpět</button>
              </div>
            </template>
          </PvCard>
        </div>

        <div v-else-if="screen === 'add-listing-confirmation'" class="screen-inner">
          <div class="add-success">
            <div class="add-success-icon">
              <i class="pi pi-check"></i>
            </div>
            <span class="add-success-kicker">Vercajk je zveřejněn</span>
            <h1 class="add-success-title">Hotovo!</h1>
            <p class="add-success-desc">
              Vercajk je teď vidět pro sousedy. Jakmile někdo pošle žádost, přijde ti oznámení.
            </p>
            <div class="add-success-actions">
              <button
                type="button"
                class="add-flow-cta-primary"
                @click="openPublishedListing"
              >
                Zobrazit nabídku
              </button>
              <button
                type="button"
                class="add-flow-cta-ghost"
                @click="profileListTab = 'offers'; setScreen('profile-list')"
              >
                Do profilu
              </button>
            </div>
          </div>
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

        <!-- CHAT LIST -->
        <div v-else-if="screen === 'chat'" class="screen-inner chat-page">
          <div v-if="chatConversations.length" class="chat-list">
            <button
              v-for="conv in chatConversations"
              :key="conv.id"
              class="chat-list-item"
              :class="{ 'is-unread': conv.unread > 0 }"
              type="button"
              @click="openChatDetail(conv.id)"
            >
              <div class="chat-list-avatar-wrap">
                <div class="chat-list-avatar">{{ conv.contactName.charAt(0) }}</div>
                <span v-if="conv.unread > 0" class="chat-list-badge">{{ conv.unread }}</span>
              </div>
              <div class="chat-list-copy">
                <div class="chat-list-row">
                  <strong class="chat-list-name">{{ conv.contactName }}</strong>
                  <span class="chat-list-time">{{ conv.lastTime }}</span>
                </div>
                <span class="chat-list-listing">o „{{ conv.listingTitle }}"</span>
                <span class="chat-list-preview" :class="{ 'is-unread': conv.unread > 0 }">{{ conv.lastMessage }}</span>
              </div>
            </button>
          </div>

          <div v-else class="chat-empty">
            <i class="pi pi-comments"></i>
            <p>Zatím žádné zprávy.<br>Začni konverzaci u konkrétní nabídky.</p>
            <button class="button-primary" type="button" @click="setScreen('market')">Prohlížet nabídky</button>
          </div>
        </div>

        <!-- CHAT DETAIL -->
        <div v-else-if="screen === 'chat-detail' && activeConversation" class="screen-inner chat-detail-page">
          <div class="chat-messages" ref="chatMessagesEl">
            <template v-for="msg in activeConversation.messages" :key="msg.id">
              <!-- Status event -->
              <div
                v-if="msg.type === 'status'"
                class="chat-status-event"
                :class="`is-${chatStatusMeta[msg.statusType].tone}`"
              >
                <span class="chat-status-icon"><i :class="`pi ${chatStatusMeta[msg.statusType].icon}`"></i></span>
                <span class="chat-status-body">
                  <strong>{{ chatStatusMeta[msg.statusType].label }}</strong>
                  <span>{{ msg.statusText }}</span>
                </span>
              </div>
              <!-- Regular message -->
              <div
                v-else
                class="chat-bubble-wrap"
                :class="msg.sender === 'me' ? 'is-me' : 'is-them'"
              >
                <div class="chat-bubble">{{ msg.text }}</div>
                <span class="chat-bubble-time">{{ msg.time }}</span>
              </div>
            </template>
          </div>

          <div v-if="isChatClosed" class="chat-input-bar chat-input-bar--closed">
            <i class="pi pi-lock"></i>
            <span>Konverzace je uzavřena — rezervace nebyla přijata.</span>
          </div>
          <div v-else class="chat-input-bar">
            <input
              v-model="chatInput"
              class="chat-input"
              type="text"
              placeholder="Napište zprávu…"
              @keydown.enter.prevent="sendChatMessage"
            />
            <button
              class="chat-send-btn"
              type="button"
              :disabled="!chatInput.trim()"
              @click="sendChatMessage"
              aria-label="Odeslat"
            >
              <i class="pi pi-send"></i>
            </button>
          </div>
        </div>

        <div v-else-if="screen === 'profile'" class="screen-inner profile-page">

          <!-- Notifikační panel -->
          <div v-if="notifCenterOpen" class="notif-center-overlay" @click.self="closeNotifCenter">
            <div class="notif-center-panel">
              <div class="notif-center-head">
                <strong>Oznámení</strong>
                <button type="button" class="notif-center-clear" @click="clearAllNotifs" v-if="appNotifications.length > 0">
                  Vymazat vše
                </button>
              </div>

              <div class="notif-center-list">
                <div v-if="appNotifications.length === 0" class="notif-center-empty">
                  <i class="pi pi-bell"></i>
                  <span>Žádná oznámení</span>
                </div>

                <template v-for="group in notifGroups" :key="group.label">
                  <div class="notif-center-group-label">{{ group.label }}</div>
                  <div
                    v-for="notif in group.items"
                    :key="notif.id"
                    class="notif-center-item"
                    :class="{ 'is-unread': notif.unread }"
                  >
                    <div class="notif-center-icon" :class="`tone-${notif.tone}`">
                      <i :class="['pi', notif.icon]"></i>
                    </div>
                    <div class="notif-center-copy">
                      <span>{{ notif.text }}</span>
                    </div>
                    <button type="button" class="notif-center-remove" @click="removeNotif(notif.id)" aria-label="Smazat">
                      <i class="pi pi-times"></i>
                    </button>
                  </div>
                </template>
              </div>
            </div>
          </div>

          <div class="profile-hero" style="grid-template-columns: auto 1fr auto; align-items: start;">
            <div class="profile-avatar" style="align-self: center;">{{ user.name.charAt(0).toUpperCase() }}</div>
            <div class="profile-hero-copy" style="min-width: 0; align-self: center;">
              <strong style="white-space: normal; word-break: break-word; display: block; line-height: 1.25;">{{ personal.firstName || user.name.split(' ')[0] }}</strong>
              <div class="profile-rating">
                <i class="pi pi-star-fill"></i>
                4.8
              </div>
              <button class="profile-public-button" type="button" style="white-space: nowrap;" @click="openPublicProfile(user.name)">
                Zobrazit veřejný profil
              </button>
            </div>
            <button type="button" class="notif-bell-btn" style="align-self: start; margin-left: 0; flex-shrink: 0;" @click="openNotifCenter" aria-label="Oznámení">
              <i class="pi pi-bell"></i>
              <span v-if="unreadNotifCount > 0" class="notif-bell-badge">{{ unreadNotifCount }}</span>
            </button>
          </div>

          <div class="profile-card-menu">
            <button class="profile-list-item" type="button" @click="openProfileListPage('offers')">
              <div class="profile-list-item-icon"><i class="pi pi-wrench"></i></div>
              <div class="profile-list-item-content">
                <span class="profile-list-item-title">Vercajk</span>
                <span class="profile-list-item-subtitle">{{ profileOffers.length }} nabídek · {{ profileRequests.length }} poptávek</span>
              </div>
              <i class="pi pi-chevron-right"></i>
            </button>
          </div>

          <div class="profile-card-menu">
            <button class="profile-list-item" type="button" @click="openProfilePersonal">
              <div class="profile-list-item-icon"><i class="pi pi-user"></i></div>
              <div class="profile-list-item-content">
                <span class="profile-list-item-title">Osobní údaje</span>
                <span class="profile-list-item-subtitle">Jméno, kontakt, bio</span>
              </div>
              <i class="pi pi-chevron-right"></i>
            </button>
            <button class="profile-list-item" type="button" @click="openProfilePayments">
              <div class="profile-list-item-icon"><i class="pi pi-credit-card"></i></div>
              <div class="profile-list-item-content">
                <span class="profile-list-item-title">Platby</span>
                <span class="profile-list-item-subtitle">•••• 4242</span>
              </div>
              <i class="pi pi-chevron-right"></i>
            </button>
            <button class="profile-list-item" type="button" @click="openProfileSecurity">
              <div class="profile-list-item-icon"><i class="pi pi-shield"></i></div>
              <div class="profile-list-item-content">
                <span class="profile-list-item-title">Zabezpečení</span>
                <span class="profile-list-item-subtitle">Heslo, 2FA</span>
              </div>
              <i class="pi pi-chevron-right"></i>
            </button>
            <button class="profile-list-item" type="button" @click="openProfileLanguage">
              <div class="profile-list-item-icon"><i class="pi pi-globe"></i></div>
              <div class="profile-list-item-content">
                <span class="profile-list-item-title">Jazyk a měna</span>
                <span class="profile-list-item-subtitle">Čeština · CZK</span>
              </div>
              <i class="pi pi-chevron-right"></i>
            </button>
            <button class="profile-list-item" type="button" @click="openProfilePrivacy">
              <div class="profile-list-item-icon"><i class="pi pi-eye-slash"></i></div>
              <div class="profile-list-item-content">
                <span class="profile-list-item-title">Soukromí</span>
                <span class="profile-list-item-subtitle">Jak mě kontaktovat</span>
              </div>
              <i class="pi pi-chevron-right"></i>
            </button>
            <button class="profile-list-item" type="button" @click="openProfileNotifications">
              <div class="profile-list-item-icon"><i class="pi pi-bell"></i></div>
              <div class="profile-list-item-content">
                <span class="profile-list-item-title">Oznámení</span>
                <span class="profile-list-item-subtitle">Zapnuto</span>
              </div>
              <i class="pi pi-chevron-right"></i>
            </button>
            <button class="profile-list-item" type="button" @click="openHelp">
              <div class="profile-list-item-icon"><i class="pi pi-question-circle"></i></div>
              <div class="profile-list-item-content">
                <span class="profile-list-item-title">Nápověda</span>
                <span class="profile-list-item-subtitle">FAQ, napiš nám</span>
              </div>
              <i class="pi pi-chevron-right"></i>
            </button>
          </div>
          <button type="button" style="display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 14px; background: transparent; border: 1px dashed var(--border); border-radius: 12px; color: var(--muted); font-size: 0.84rem; cursor: pointer; margin-bottom: 10px;" @click="resetOnboarding">
            <i class="pi pi-refresh" style="font-size: 0.8rem;"></i>
            Zobrazit onboarding znovu
          </button>
          <button class="logout-button-new" type="button" @click="logout">
            <i class="pi pi-sign-out"></i>
            Odhlásit se
          </button>
        </div>

        <div v-else-if="screen === 'profile-notifications'" class="screen-inner profile-page">

          <!-- Hlavní přepínače -->
          <div class="profile-section">
            <span class="personal-section-label">Obecná nastavení</span>
            <div class="add-flow-toggle-card" @click="notifications.pushEnabled = !notifications.pushEnabled">
              <div class="add-flow-toggle-card-copy">
                <strong>Push notifikace</strong>
                <span>{{ notifications.pushEnabled ? 'Zapnuto' : 'Vypnuto' }}</span>
              </div>
              <div class="add-flow-toggle" role="presentation">
                <input type="checkbox" :checked="notifications.pushEnabled" readonly />
                <span aria-hidden="true"></span>
              </div>
            </div>
            <div class="add-flow-toggle-card" @click="notifications.emailEnabled = !notifications.emailEnabled">
              <div class="add-flow-toggle-card-copy">
                <strong>E-mailová oznámení</strong>
                <span>{{ notifications.emailEnabled ? 'Zapnuto' : 'Vypnuto' }}</span>
              </div>
              <div class="add-flow-toggle" role="presentation">
                <input type="checkbox" :checked="notifications.emailEnabled" readonly />
                <span aria-hidden="true"></span>
              </div>
            </div>
          </div>

          <!-- Sekce oznámení -->
          <template v-for="section in [
            { label: 'Komunikace', items: [
              { icon: 'pi-comment', title: 'Nová zpráva v chatu', desc: null, key: 'chat' },
            ]},
            { label: 'Rezervace', items: [
              { icon: 'pi-inbox', title: 'Nová žádost', desc: 'Někdo chce půjčit tvoje nářadí', key: 'reservationNew' },
              { icon: 'pi-check-circle', title: 'Přijata nebo zamítnuta', desc: 'Stav tvé žádosti se změnil', key: 'reservationStatus' },
              { icon: 'pi-clock', title: 'Připomínka předání', desc: 'Den před začátkem výpůjčky', key: 'reservationReminder' },
            ]},
            { label: 'Platby', items: [
              { icon: 'pi-credit-card', title: 'Stav platby', desc: 'Přijata nebo potvrzena', key: 'payment' },
            ]},
            { label: 'Průběh výpůjčky', items: [
              { icon: 'pi-box', title: 'Stav zařízení', desc: 'Předání a vrácení potvrzeno', key: 'deviceStatus' },
            ]},
            { label: 'Hodnocení', items: [
              { icon: 'pi-star', title: 'Nové hodnocení', desc: null, key: 'ratingReceived' },
              { icon: 'pi-star-fill', title: 'Výzva k hodnocení', desc: 'Po skončení výpůjčky', key: 'ratingReminder' },
            ]},
            { label: 'Novinky', items: [
              { icon: 'pi-map-marker', title: 'Nové nabídky v okolí', desc: 'Nářadí blízko tebe', key: 'nearbyListings' },
              { icon: 'pi-megaphone', title: 'Novinky platformy', desc: 'Akce a tipy od Vercajkovny', key: 'platformNews' },
            ]},
          ]" :key="section.label">
            <div class="profile-section" :class="{ 'notif-section--muted': !notifications.pushEnabled && !notifications.emailEnabled }">
              <span class="personal-section-label">{{ section.label }}</span>
              <div class="notif-card">
                <div v-for="item in section.items" :key="item.key" class="notif-row-new">
                  <div class="notif-row-icon">
                    <i :class="['pi', item.icon]"></i>
                  </div>
                  <div class="notif-row-text">
                    <strong>{{ item.title }}</strong>
                    <span v-if="item.desc">{{ item.desc }}</span>
                  </div>
                  <div class="notif-toggles">
                    <button
                      class="notif-toggle-btn"
                      :class="{ 'is-on': notifications.items[item.key].push && notifications.pushEnabled }"
                      type="button"
                      :disabled="!notifications.pushEnabled"
                      :style="!notifications.pushEnabled ? { pointerEvents: 'none', opacity: '0.35', cursor: 'not-allowed' } : {}"
                      @click="notifications.pushEnabled && (notifications.items[item.key].push = !notifications.items[item.key].push)"
                      title="Push"
                    ><i class="pi pi-bell"></i></button>
                    <button
                      class="notif-toggle-btn"
                      :class="{ 'is-on': notifications.items[item.key].email && notifications.emailEnabled }"
                      type="button"
                      :disabled="!notifications.emailEnabled"
                      :style="!notifications.emailEnabled ? { pointerEvents: 'none', opacity: '0.35', cursor: 'not-allowed' } : {}"
                      @click="notifications.emailEnabled && (notifications.items[item.key].email = !notifications.items[item.key].email)"
                      title="E-mail"
                    ><i class="pi pi-envelope"></i></button>
                  </div>
                </div>
              </div>
            </div>
          </template>

        </div>

        <div v-else-if="screen === 'profile-privacy'" class="screen-inner profile-page">

          <!-- Info banner -->
          <div class="privacy-info-banner">
            <i class="pi pi-shield"></i>
            <span>Tvůj kontakt <strong>zůstane skrytý</strong> až do potvrzení rezervace. Teprve pak ho druhá strana uvidí.</span>
          </div>

          <!-- Jak mě kontaktovat -->
          <div class="profile-section">
            <span class="personal-section-label">Jak mě kontaktovat</span>

            <!-- Telefon — z profilu, nelze měnit -->
            <div class="add-flow-toggle-card" @click="togglePrivacyPhone">
              <div class="add-flow-toggle-card-copy">
                <strong>Telefon</strong>
                <span>{{ personal.phone || 'Není vyplněno' }}</span>
              </div>
              <div class="add-flow-toggle" role="presentation">
                <input type="checkbox" :checked="privacy.contactPhone" readonly />
                <span aria-hidden="true"></span>
              </div>
            </div>

            <!-- E-mail — z profilu, editace přes modal -->
            <div class="add-flow-toggle-card" @click="togglePrivacyEmail">
              <div class="add-flow-toggle-card-copy">
                <strong>E-mail</strong>
                <span>{{ privacy.emailValue || personal.email || 'Není vyplněno' }}</span>
              </div>
              <button v-if="privacy.contactEmail" type="button" class="privacy-edit-link" @click.stop="openEmailModal">Změnit</button>
              <div class="add-flow-toggle" role="presentation">
                <input type="checkbox" :checked="privacy.contactEmail" readonly />
                <span aria-hidden="true"></span>
              </div>
            </div>

            <!-- SMS — z profilu, nelze měnit -->
            <div class="add-flow-toggle-card" @click="togglePrivacySms">
              <div class="add-flow-toggle-card-copy">
                <strong>SMS</strong>
                <span>{{ personal.phone || 'Není vyplněno' }}</span>
              </div>
              <div class="add-flow-toggle" role="presentation">
                <input type="checkbox" :checked="privacy.contactSms" readonly />
                <span aria-hidden="true"></span>
              </div>
            </div>

          </div>

          <div v-if="privacy.contactError" class="privacy-error" style="margin: 0 16px 8px;">
            <i class="pi pi-exclamation-circle"></i>
            Musíš mít zapnutý alespoň Telefon nebo SMS.
          </div>

          <!-- E-mail modal -->
          <div v-if="privacy.emailModalOpen" class="confirm-modal" @click.self="privacy.emailModalOpen = false">
            <button class="confirm-modal-backdrop" type="button" aria-label="Zavřít" @click="privacy.emailModalOpen = false"></button>
            <div class="confirm-modal-card" @click.stop>
              <p class="confirm-modal-title">Kontaktní e-mail</p>
              <p class="confirm-modal-copy">Zadej e-mail, který chceš sdílet po schválení rezervace. Nemusí být stejný jako přihlašovací.</p>
              <div class="confirm-modal-field">
                <label>E-mail</label>
                <div class="personal-input-box">
                  <i class="pi pi-envelope personal-input-icon"></i>
                  <input
                    v-model="privacy.emailModalValue"
                    type="email"
                    class="payments-native-input"
                    placeholder="tomas@email.cz"
                    @keydown.enter="confirmEmailModal"
                  />
                </div>
              </div>
              <div class="confirm-modal-actions">
                <button class="confirm-modal-primary" type="button" @click="confirmEmailModal">Uložit</button>
                <button class="confirm-modal-ghost" type="button" @click="privacy.emailModalOpen = false">Zrušit</button>
              </div>
            </div>
          </div>

        </div>

        <div v-else-if="screen === 'profile-language'" class="screen-inner profile-page">

          <!-- Jazyk -->
          <div class="profile-section">
            <span class="personal-section-label">Jazyk aplikace</span>
            <div class="lang-currency-list">
              <button
                v-for="lang in [{id:'cz', label:'Čeština', flag:'🇨🇿'}, {id:'sk', label:'Slovenčina', flag:'🇸🇰', soon:true}, {id:'en', label:'English', flag:'🇬🇧', soon:true}]"
                :key="lang.id"
                type="button"
                class="lang-currency-row"
                :class="{ 'is-active': settings.language === lang.id, 'is-disabled': lang.soon }"
                :disabled="lang.soon"
                @click="!lang.soon && (settings.language = lang.id)"
              >
                <div class="lang-currency-icon">{{ lang.flag }}</div>
                <span class="lang-currency-label">{{ lang.label }}</span>
                <span v-if="lang.soon" class="lang-soon-badge">Brzy</span>
                <i v-else-if="settings.language === lang.id" class="pi pi-check lang-currency-check"></i>
              </button>
            </div>
          </div>

          <!-- Měna -->
          <div class="profile-section">
            <span class="personal-section-label">Preferovaná měna</span>
            <div class="lang-currency-list">
              <button
                v-for="curr in [{id:'CZK', label:'Koruna česká', symbol:'Kč'}, {id:'EUR', label:'Euro', symbol:'€'}]"
                :key="curr.id"
                type="button"
                class="lang-currency-row"
                :class="{ 'is-active': settings.currency === curr.id }"
                @click="settings.currency = curr.id"
              >
                <div class="lang-currency-icon lang-currency-symbol">{{ curr.symbol }}</div>
                <span class="lang-currency-label">{{ curr.label }}</span>
                <i v-if="settings.currency === curr.id" class="pi pi-check lang-currency-check"></i>
              </button>
            </div>
          </div>

          <button class="add-flow-cta-primary" @click="goBack">Uložit a zpět</button>

        </div>

        <div v-else-if="screen === 'profile-security'" class="screen-inner profile-page">

          <!-- Změna hesla -->
          <div class="profile-section">
            <span class="personal-section-label">Změna hesla</span>
            <div class="security-card">
              <div class="personal-field">
                <span class="personal-field-label">Současné heslo</span>
                <div class="personal-input-box">
                  <i class="pi pi-lock personal-input-icon"></i>
                  <input v-model="securityForm.currentPassword" :type="showCurrentPassword ? 'text' : 'password'" class="payments-native-input" placeholder="••••••••" />
                  <button class="security-eye-btn" type="button" :aria-label="showCurrentPassword ? 'Skrýt heslo' : 'Zobrazit heslo'" @click="showCurrentPassword = !showCurrentPassword">
                    <i :class="['pi', showCurrentPassword ? 'pi-eye-slash' : 'pi-eye']"></i>
                  </button>
                </div>
              </div>
              <div class="personal-field">
                <span class="personal-field-label">Nové heslo</span>
                <div class="personal-input-box">
                  <i class="pi pi-lock personal-input-icon"></i>
                  <input v-model="securityForm.newPassword" :type="showNewPassword ? 'text' : 'password'" class="payments-native-input" placeholder="••••••••" />
                  <button class="security-eye-btn" type="button" :aria-label="showNewPassword ? 'Skrýt heslo' : 'Zobrazit heslo'" @click="showNewPassword = !showNewPassword">
                    <i :class="['pi', showNewPassword ? 'pi-eye-slash' : 'pi-eye']"></i>
                  </button>
                </div>
                <div class="password-rules">
                  <div v-for="rule in securityPasswordRules" :key="rule.label" class="password-rule" :class="{ 'is-ok': rule.ok }">
                    <span class="password-rule-dot" />
                    <span>{{ rule.label }}</span>
                  </div>
                </div>
              </div>
              <div class="personal-field">
                <span class="personal-field-label">Potvrzení nového hesla</span>
                <div class="personal-input-box">
                  <i class="pi pi-lock personal-input-icon"></i>
                  <input v-model="securityForm.confirmPassword" :type="showConfirmPassword ? 'text' : 'password'" class="payments-native-input" placeholder="••••••••" />
                  <button class="security-eye-btn" type="button" :aria-label="showConfirmPassword ? 'Skrýt heslo' : 'Zobrazit heslo'" @click="showConfirmPassword = !showConfirmPassword">
                    <i :class="['pi', showConfirmPassword ? 'pi-eye-slash' : 'pi-eye']"></i>
                  </button>
                </div>
              </div>
              <button
                class="add-flow-cta-primary"
                :disabled="securityForm.isChangingPassword || !securityForm.newPassword"
                @click="changePassword"
              >
                <i v-if="securityForm.isChangingPassword" class="pi pi-spin pi-spinner"></i>
                {{ securityForm.isChangingPassword ? 'Ukládám...' : 'Aktualizovat heslo' }}
              </button>
            </div>
          </div>

          <!-- 2FA -->
          <div class="profile-section">
            <span class="personal-section-label">Extra zabezpečení</span>
            <div class="add-flow-toggle-card" @click="!securityForm.twoFactorEnabled ? start2FASetup() : disable2FA()">
              <div class="add-flow-toggle-card-copy">
                <strong>Dvoufázové ověření (2FA)</strong>
                <span>{{ securityForm.twoFactorEnabled ? 'Aktivní — účet je lépe chráněn' : 'Zvýší ochranu tvého účtu' }}</span>
              </div>
              <div class="add-flow-toggle" role="presentation">
                <input type="checkbox" :checked="securityForm.twoFactorEnabled" readonly />
                <span aria-hidden="true"></span>
              </div>
            </div>
          </div>

          <!-- Odhlásit ze všech zařízení -->
          <div class="profile-section">
            <span class="personal-section-label">Přístup</span>
            <button class="security-danger-row" type="button" @click="requestLogoutAll">
              <div class="security-danger-icon"><i class="pi pi-sign-out"></i></div>
              <span>Odhlásit se ze všech zařízení</span>
              <i class="pi pi-chevron-right"></i>
            </button>
          </div>

        </div>

        <div v-else-if="screen === 'profile-payments'" class="screen-inner profile-page">
          <div class="profile-section">

            <!-- Uložené karty -->
            <div v-if="cardForm.savedCards.length" class="payments-card-list">
              <div v-for="card in cardForm.savedCards" :key="card.id" class="payments-card-row">
                <div class="payments-card-icon">
                  <i class="pi pi-credit-card"></i>
                </div>
                <div class="payments-card-info">
                  <div class="payments-card-name-row">
                    <strong>{{ card.brand }} •••• {{ card.last4 }}</strong>
                    <span v-if="card.isDefault" class="payments-default-badge">Výchozí</span>
                  </div>
                  <span>Platnost {{ card.expiry }}</span>
                </div>
                <div class="payments-card-actions">
                  <button v-if="!card.isDefault" type="button" class="payments-set-default" @click="cardForm.savedCards.forEach(c => c.isDefault = c.id === card.id)" title="Nastavit jako výchozí">
                    <i class="pi pi-star"></i>
                  </button>
                  <button type="button" class="payments-card-remove" @click="requestRemoveCard(card.id)" aria-label="Odstranit kartu">
                    <i class="pi pi-trash"></i>
                  </button>
                </div>
              </div>
            </div>
            <div v-else class="payments-empty">
              <i class="pi pi-credit-card"></i>
              <span>Zatím žádné uložené karty</span>
            </div>

            <!-- Přidat kartu -->
            <div v-if="!isAddingCard" class="payments-add-btn-wrap">
              <button class="payments-add-btn" type="button" @click="isAddingCard = true">
                <i class="pi pi-plus"></i>
                Přidat platební kartu
              </button>
            </div>

            <!-- Historie transakcí -->
            <div class="payments-history">
              <span class="personal-section-label">Historie transakcí</span>
              <div class="payments-card-list">
                <div class="payments-tx-row">
                  <div class="payments-tx-icon is-income"><i class="pi pi-angle-right"></i></div>
                  <div class="payments-card-info">
                    <strong>Ponorná pila Festool TS 55</strong>
                    <span>15. 4. 2026</span>
                  </div>
                  <span class="payments-tx-amount is-income">+1 350 Kč</span>
                </div>
                <div class="payments-tx-row">
                  <div class="payments-tx-icon"><i class="pi pi-angle-left"></i></div>
                  <div class="payments-card-info">
                    <strong>Aku vrtačka Makita 18V</strong>
                    <span>10. 4. 2026</span>
                  </div>
                  <span class="payments-tx-amount">−540 Kč</span>
                </div>
                <div class="payments-tx-row">
                  <div class="payments-tx-icon is-income"><i class="pi pi-angle-right"></i></div>
                  <div class="payments-card-info">
                    <strong>Vysokotlaký čistič Kärcher</strong>
                    <span>3. 4. 2026</span>
                  </div>
                  <span class="payments-tx-amount is-income">+870 Kč</span>
                </div>
                <div class="payments-tx-row">
                  <div class="payments-tx-icon"><i class="pi pi-angle-left"></i></div>
                  <div class="payments-card-info">
                    <strong>Křížový laser Bosch GLL</strong>
                    <span>22. 3. 2026</span>
                  </div>
                  <span class="payments-tx-amount">−660 Kč</span>
                </div>
              </div>
            </div>

            <!-- Formulář nové karty -->
            <div v-if="isAddingCard" class="payments-new-card">
              <div class="personal-field">
                <span class="personal-field-label">Číslo karty</span>
                <div class="personal-input-box">
                  <i class="pi pi-credit-card personal-input-icon"></i>
                  <input v-model="newCardData.number" class="payments-native-input" placeholder="0000 0000 0000 0000" maxlength="19" />
                </div>
              </div>
              <div class="payments-row-2">
                <div class="personal-field">
                  <span class="personal-field-label">Platnost</span>
                  <div class="personal-input-box">
                    <input v-model="newCardData.expiry" class="payments-native-input" placeholder="MM/RR" maxlength="5" />
                  </div>
                </div>
                <div class="personal-field">
                  <span class="personal-field-label">CVC</span>
                  <div class="personal-input-box">
                    <input v-model="newCardData.cvc" class="payments-native-input" placeholder="000" maxlength="3" />
                  </div>
                </div>
              </div>
              <button type="button" class="add-flow-cta-primary" @click="addNewCard">Uložit kartu</button>
              <button type="button" class="add-flow-cta-ghost" @click="isAddingCard = false">Zrušit</button>
            </div>

          </div>
        </div>

        <div v-else-if="screen === 'profile-personal'" class="screen-inner profile-page">
          <div class="profile-section">

            <!-- Foto -->
            <div class="personal-photo-wrap" @click="openPersonalPhotoEditor">
              <div class="personal-photo-circle">
                <span>{{ (personal.firstName || personal.email || 'T').charAt(0).toUpperCase() }}</span>
                <div class="personal-photo-edit-badge"><i class="pi pi-pencil"></i></div>
              </div>
            </div>

            <!-- Jméno a příjmení — nelze měnit po registraci -->
            <div class="personal-section">
              <div class="personal-name-grid">
                <div class="personal-field">
                  <span class="personal-field-label">Jméno</span>
                  <div class="personal-input-box" style="cursor: default;">
                    <i class="pi pi-user personal-input-icon"></i>
                    <span class="personal-field-value" style="color: var(--muted); font-weight: 400;">{{ personal.firstName || '—' }}</span>
                    <span class="personal-locked-badge"><i class="pi pi-lock" style="font-size: 10px;"></i></span>
                  </div>
                </div>
                <div class="personal-field">
                  <span class="personal-field-label">Příjmení</span>
                  <div class="personal-input-box" style="cursor: default;">
                    <i class="pi pi-user personal-input-icon"></i>
                    <span class="personal-field-value" style="color: var(--muted); font-weight: 400;">{{ personal.lastName || '—' }}</span>
                    <span class="personal-locked-badge"><i class="pi pi-lock" style="font-size: 10px;"></i></span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Kontakt -->
            <div class="personal-section">
              <div class="personal-field">
                <span class="personal-field-label">E-mail</span>
                <div class="personal-input-box" @click="openPersonalEdit('email')">
                  <i class="pi pi-envelope personal-input-icon"></i>
                  <span class="personal-field-value">{{ personal.email || '—' }}</span>
                  <span v-if="personal.emailVerified" class="personal-verified-badge">✓ Ověřen</span>
                  <button v-else type="button" class="personal-verify-link" @click.stop="verifyEmail">Ověřit</button>
                </div>
              </div>
              <div class="personal-field">
                <span class="personal-field-label">Telefon</span>
                <div class="personal-input-box" @click="openPersonalEdit('phone')">
                  <i class="pi pi-phone personal-input-icon"></i>
                  <span class="personal-field-value">{{ personal.phone || '—' }}</span>
                  <span v-if="personal.phoneVerified" class="personal-verified-badge">✓ Ověřen</span>
                  <button v-else type="button" class="personal-verify-link personal-verify-link-danger" @click.stop="verifyPhone">Ověřit</button>
                </div>
              </div>
            </div>

            <!-- Adresa -->
            <div class="personal-section">
              <div class="personal-field">
                <span class="personal-field-label">Adresa</span>
                <div class="personal-input-box" @click="openPersonalEdit('address')">
                  <i class="pi pi-map-marker personal-input-icon"></i>
                  <span class="personal-field-value">{{ personal.address || '—' }}</span>
                </div>
              </div>
              <p class="personal-note">Ukazujeme jen čtvrť — přesná adresa zůstane skrytá.</p>
            </div>

            <!-- Bio -->
            <div class="personal-section">
              <div class="personal-field">
                <span class="personal-field-label">Bio</span>
                <div class="personal-input-box" style="height: auto; align-items: flex-start; padding: 10px 12px;">
                  <i class="pi pi-align-left personal-input-icon" style="margin-top: 2px;"></i>
                  <textarea
                    v-model="personal.bio"
                    class="payments-native-input"
                    rows="3"
                    placeholder="Pár slov o sobě — co rád/a půjčuješ, kde jsi..."
                    style="resize: vertical; background: transparent; border: none; outline: none; width: 100%; font: inherit;"
                  ></textarea>
                </div>
              </div>
              <p class="personal-note">Zobrazuje se na tvém veřejném profilu.</p>
            </div>

            <div style="margin-top: 16px;">
              <button
                type="button"
                class="add-flow-cta-primary"
                :disabled="!personalDirty"
                :style="!personalDirty ? { opacity: '0.45', cursor: 'not-allowed' } : {}"
                @click="savePersonalChanges"
              >Uložit změny</button>
              <div v-if="personal.saved" class="profile-personal-saved" style="text-align: center; margin-top: 8px;">Uloženo ✓</div>
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
                <div class="confirm-modal-input-wrap">
                  <textarea
                    v-if="personalEditMeta.textarea"
                    :id="`personal-edit-${personalEditField ?? 'field'}`"
                    :value="personalEditValue"
                    class="native-input"
                    rows="4"
                    :placeholder="personalEditMeta.placeholder"
                    @input="personalEditValue = ($event.target as HTMLTextAreaElement).value"
                  ></textarea>
                  <input
                    v-else
                    :id="`personal-edit-${personalEditField ?? 'field'}`"
                    :value="personalEditValue"
                    class="native-input"
                    :type="personalEditMeta.type"
                    :placeholder="personalEditMeta.placeholder"
                    autocomplete="off"
                    @input="personalEditField === 'address'
                      ? onAddressInput(($event.target as HTMLInputElement).value)
                      : (personalEditValue = ($event.target as HTMLInputElement).value)"
                    @blur="personalEditField === 'address' && clearAddressSuggestions()"
                  />
                  <div v-if="personalEditField === 'address' && addressSuggestions.length" class="address-suggestions">
                    <button
                      v-for="addr in addressSuggestions"
                      :key="addr"
                      type="button"
                      class="address-suggestion-item"
                      @mousedown.prevent="selectAddress(addr)"
                    >
                      <i class="pi pi-map-marker"></i>
                      {{ addr }}
                    </button>
                  </div>
                </div>
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

          <!-- Neuložené změny dialog -->
          <div v-if="personalUnsavedOpen" class="confirm-modal">
            <button class="confirm-modal-backdrop" type="button" @click="personalUnsavedOpen = false" aria-label="Zavřít"></button>
            <div class="confirm-modal-card">
              <p class="confirm-modal-title">Neuložené změny</p>
              <p class="confirm-modal-copy">Máš neuložené změny v osobních údajích. Chceš je uložit před odchodem?</p>
              <div class="confirm-modal-actions">
                <button type="button" class="confirm-modal-primary" @click="confirmPersonalSaveAndLeave">
                  Uložit a odejít
                </button>
                <button type="button" class="confirm-modal-ghost" @click="confirmPersonalDiscard">
                  Zahodit změny
                </button>
                <button type="button" class="confirm-modal-ghost" @click="personalUnsavedOpen = false">
                  Zůstat
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="screen === 'help'" class="screen-inner profile-page help-page">

          <!-- Hledání -->
          <div class="help-search-new">
            <i class="pi pi-search help-search-icon"></i>
            <input v-model="helpQuery" class="help-search-input" type="text" placeholder="Jak ti můžeme pomoci?" />
          </div>

          <!-- FAQ -->
          <div class="profile-section">
            <span class="personal-section-label">Časté dotazy</span>
            <div class="help-faq-list">
              <div
                v-for="item in filteredHelpFaq"
                :key="item.id"
                class="help-faq-card"
                :class="{ 'is-open': helpExpandedId === item.id }"
              >
                <button
                  type="button"
                  class="help-faq-card-head"
                  @click="helpExpandedId = helpExpandedId === item.id ? null : item.id"
                >
                  <span>{{ item.title }}</span>
                  <i :class="['pi', helpExpandedId === item.id ? 'pi-chevron-up' : 'pi-chevron-down']" class="help-faq-arrow"></i>
                </button>
                <div v-if="helpExpandedId === item.id" class="help-faq-answer">
                  <p>{{ item.body[0] }}</p>
                  <button v-if="item.body.length > 1" type="button" class="help-faq-more" @click="openHelpDetail(item.id)">
                    Číst celou odpověď
                  </button>
                </div>
              </div>
              <div v-if="filteredHelpFaq.length === 0 && helpQuery.trim()" class="help-faq-empty">
                <i class="pi pi-search" style="font-size: 1.5rem; opacity: 0.4;"></i>
                <p>Nic jsme nenašli pro „{{ helpQuery }}".</p>
                <button type="button" class="field-link" @click="openHelpContact">Napište nám přímo</button>
              </div>
            </div>
          </div>

          <!-- Kontakt -->
          <div class="profile-section">
            <span class="personal-section-label">Kontakt</span>
            <div class="help-contact-grid">
              <button type="button" class="help-contact-btn" @click="openHelpContact">
                <div class="help-contact-icon"><i class="pi pi-comment"></i></div>
                <span>Napiš nám</span>
              </button>
              <button type="button" class="help-contact-btn">
                <div class="help-contact-icon"><i class="pi pi-phone"></i></div>
                <span>Zavolej nám</span>
              </button>
            </div>
          </div>

        </div>

        <div v-else-if="screen === 'help-contact'" class="screen-inner profile-page">

          <!-- Odesláno -->
          <div v-if="contactForm.isSent" class="add-success">
            <div class="add-success-icon"><i class="pi pi-envelope"></i></div>
            <span class="add-success-kicker">Zpráva odeslána</span>
            <h1 class="add-success-title">Díky!</h1>
            <p class="add-success-desc">Ozveme se ti co nejdříve na tvůj e-mail.</p>
            <div class="add-success-actions">
              <button class="add-flow-cta-primary" @click="goBack">Zpět do nápovědy</button>
            </div>
          </div>

          <!-- Formulář -->
          <div v-else class="profile-section">
            <p class="help-contact-desc">Máš potíže s výpůjčkou nebo tě trápí technický šotek? Dej nám vědět.</p>
            <div class="security-card">
              <div v-if="!isAuthenticated" class="personal-field">
                <span class="personal-field-label">Tvůj e-mail</span>
                <div class="personal-input-box">
                  <i class="pi pi-envelope personal-input-icon"></i>
                  <input v-model="contactForm.email" class="payments-native-input" type="email" placeholder="tvuj@email.cz" />
                </div>
              </div>
              <div class="personal-field">
                <span class="personal-field-label">Téma</span>
                <div class="personal-input-box">
                  <i class="pi pi-tag personal-input-icon"></i>
                  <select v-model="contactForm.topic" class="payments-native-input" style="cursor: pointer;">
                    <option>Průběh výpůjčky</option>
                    <option>Problém s platbou</option>
                    <option>Technická chyba</option>
                    <option>Jiný dotaz</option>
                  </select>
                </div>
              </div>
              <div class="personal-field">
                <span class="personal-field-label">Zpráva</span>
                <div class="personal-input-box help-textarea-box">
                  <textarea
                    v-model="contactForm.message"
                    class="payments-native-input help-textarea"
                    placeholder="Popište nám, s čím vám můžeme pomoci..."
                    rows="5"
                  ></textarea>
                </div>
              </div>
            </div>
            <button
              class="add-flow-cta-primary"
              :disabled="contactForm.isSending || !contactForm.message.trim() || (!isAuthenticated && !contactForm.email.trim())"
              @click="submitContact"
            >
              <i v-if="contactForm.isSending" class="pi pi-spin pi-spinner"></i>
              {{ contactForm.isSending ? 'Odesílám...' : 'Odeslat zprávu' }}
            </button>
            <button class="add-flow-cta-ghost" @click="goBack">Zpět</button>
            <p v-if="isAuthenticated" class="personal-note" style="text-align:center;">Odpovíme na e-mail registrovaný u tvého profilu.</p>
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

    <footer v-if="screen !== 'onboarding'" class="bottom-nav" aria-label="Spodní navigace">
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
      <button class="bottom-nav-item" :class="{ 'is-active': screen === 'chat' || screen === 'chat-detail' }" type="button" @click="openStatus">
        <span v-if="unreadChatCount > 0" class="bottom-nav-badge">{{ unreadChatCount }}</span>
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

    <!-- Lightbox -->
    <div v-if="lightboxSrc" class="lightbox-overlay" @click="lightboxSrc = null">
      <button class="lightbox-close" type="button" @click="lightboxSrc = null" aria-label="Zavřít">
        <i class="pi pi-times"></i>
      </button>
      <img :src="lightboxSrc" class="lightbox-img" @click.stop />
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
