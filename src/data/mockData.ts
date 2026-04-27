export type Listing = {
  id: string;
  title: string;
  price: string;
  priceValue: number;
  location: string;
  distance: string;
  distanceValue: number;
  rating: number;
  category: string;
  availability: string;
  depositRequired: boolean;
  description: string;
  owner: string;
  ownerSince: string;
  badges: string[];
  photo?: string;
  pickupMode?: "personal" | "other";
  pickupDescription?: string;
};

export const categories = [
  { id: "all", label: "Vše" },
  { id: "stavba", label: "Stavba" },
  { id: "dilna", label: "Dílna" },
  { id: "udrzba", label: "Údržba" },
  { id: "mereni", label: "Měření" },
  { id: "ostatni", label: "Ostatní" },
];

export const listings: Listing[] = [
  {
    id: "festool-ts55",
    title: "Kompaktní kotoučová pila Festool TS 55",
    price: "450 Kč / den",
    priceValue: 450,
    location: "Praha 7",
    distance: "1.8 km",
    distanceValue: 1.8,
    rating: 4.9,
    category: "stavba",
    availability: "K dispozici dnes",
    depositRequired: true,
    description:
      "Přesná ponorná pila pro řezání laminovaných desek, podlah i masivu. Pila jede jako hodinky, řez je čistý bez otřepů. Přibalím i vodicí lištu 1400 mm, paralelní doraz a sadu pilových kotoučů pro různé materiály. Ideální na rekonstrukce podlah, výrobu nábytku i jemné tesařské práce. Vercajk je v perfektním stavu, pravidelně servisovaný.",
    owner: "Tomáš",
    ownerSince: "na platformě 3 roky",
    badges: ["Ov. profil", "Bezpečné předání", "Okamžitý kontakt"],
    pickupMode: "other",
    pickupDescription: "Garáž s kódem — kód dostaneš po potvrzení rezervace",
    photo: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&q=80",
  },
  {
    id: "makita-drill",
    title: "Aku vrtačka Makita 18V",
    price: "180 Kč / den",
    priceValue: 180,
    location: "Brno-střed",
    distance: "0.9 km",
    distanceValue: 0.9,
    rating: 4.8,
    category: "dilna",
    availability: "Možné vyzvednout dnes večer",
    depositRequired: false,
    description:
      "Lehká, spolehlivá a připravená na montáž nábytku i drobné domácí opravy.",
    owner: "Pavel",
    ownerSince: "ověřený hostitel",
    badges: ["Top rating", "Rychlá odpověď", "Osobní předání"],
    pickupMode: "personal",
    photo: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=600&q=80",
  },
  {
    id: "karcher-wash",
    title: "Tlaková myčka Kärcher K5",
    price: "300 Kč / den",
    priceValue: 300,
    location: "Ostrava",
    distance: "2.4 km",
    distanceValue: 2.4,
    rating: 4.7,
    category: "udrzba",
    availability: "Na víkend volné",
    depositRequired: true,
    description:
      "Na terasy, auto i zahradní povrchy. Přehledný listing pro ukázku produktu i rezervace.",
    owner: "Lucie",
    ownerSince: "na platformě 11 měsíců",
    badges: ["Rychlé schválení", "Připraveno k půjčení", "Fotky stavu"],
    pickupMode: "other",
    pickupDescription: "Dovoz do 5 km nebo zásilkovna",
    photo: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
  },
  {
    id: "laser-level",
    title: "Křížový laser Bosch",
    price: "220 Kč / den",
    priceValue: 220,
    location: "Plzeň",
    distance: "3.2 km",
    distanceValue: 3.2,
    rating: 4.9,
    category: "mereni",
    availability: "Rezervace od pátku",
    depositRequired: false,
    description:
      "Pro přesné srovnání polic, obrazů a kuchyňských linek. Hodí se jako elegantní detail.",
    owner: "Jana",
    ownerSince: "ověřená",
    badges: ["Záruka stavu", "Doprava domluvou", "Oblíbené"],
    pickupMode: "personal",
    photo: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=600&q=80",
  },
  {
    id: "bosch-drill",
    title: "Příklepová vrtačka Bosch GSB 18V-50",
    price: "320 Kč / den",
    priceValue: 320,
    location: "Praha 4",
    distance: "2.1 km",
    distanceValue: 2.1,
    rating: 4.8,
    category: "dilna",
    availability: "K dispozici zítra",
    depositRequired: true,
    description:
      "Silná vrtačka pro beton i dřevo. Skvělá pro rychlé vrtání a menší rekonstrukce.",
    owner: "Tomáš",
    ownerSince: "na platformě 2 roky",
    badges: ["Ověřený profil", "Kauce online", "Rychlé schválení"],
    pickupMode: "personal",
    photo: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&q=80",
  },
  {
    id: "hilti-breaker",
    title: "Bourací kladivo Hilti TE 500",
    price: "550 Kč / den",
    priceValue: 550,
    location: "Brno",
    distance: "4.3 km",
    distanceValue: 4.3,
    rating: 4.6,
    category: "stavba",
    availability: "Volné celý týden",
    depositRequired: true,
    description:
      "Pro náročnější bourací práce, pevný kufr a příslušenství v ceně.",
    owner: "Lucie",
    ownerSince: "na platformě 8 měsíců",
    badges: ["Dostupné ihned", "Top rating", "Fotky stavu"],
    photo: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=600&q=80",
  },
];

export type ChatStatusType =
  | "reservation-sent"
  | "reservation-accepted"
  | "reservation-rejected"
  | "reservation-cancelled"
  | "payment-sent"
  | "payment-confirmed"
  | "handover"
  | "return"
  | "rating";

export type ChatMessage =
  | {
      id: string;
      type: "message";
      text: string;
      sender: "me" | "them";
      time: string;
    }
  | {
      id: string;
      type: "status";
      statusType: ChatStatusType;
      statusText: string;
      time: string;
    };

export type Conversation = {
  id: string;
  contactName: string;
  listingId: string;
  listingTitle: string;
  unread: number;
  lastMessage: string;
  lastTime: string;
  messages: ChatMessage[];
};

export const chatStatusMeta: Record<ChatStatusType, { icon: string; label: string; tone: "neutral" | "success" | "danger" | "warning" }> = {
  "reservation-sent":     { icon: "pi-send",         label: "Rezervace odeslána",    tone: "neutral"  },
  "reservation-accepted": { icon: "pi-check-circle",  label: "Rezervace přijata",     tone: "success"  },
  "reservation-rejected": { icon: "pi-times-circle",  label: "Rezervace zamítnuta",   tone: "danger"   },
  "reservation-cancelled":{ icon: "pi-ban",           label: "Rezervace zrušena",     tone: "danger"   },
  "payment-sent":         { icon: "pi-credit-card",   label: "Platba odeslána",       tone: "warning"  },
  "payment-confirmed":    { icon: "pi-check-circle",  label: "Platba potvrzena",      tone: "success"  },
  "handover":             { icon: "pi-box",           label: "Předání proběhlo",      tone: "success"  },
  "return":               { icon: "pi-replay",        label: "Vrácení potvrzeno",     tone: "success"  },
  "rating":               { icon: "pi-star-fill",     label: "Hodnocení odesláno",    tone: "success"  },
};

export const conversations: Conversation[] = [
  {
    id: "conv-1",
    contactName: "Tomáš",
    listingId: "festool-ts55",
    listingTitle: "Kompaktní kotoučová pila Festool TS 55",
    unread: 2,
    lastMessage: "Super, tak v pátek v 9 hodin u mě.",
    lastTime: "9:41",
    messages: [
      { id: "m1", type: "message", text: "Dobrý den, mám zájem o půjčení pily na víkend. Je k dispozici od pátku?", sender: "me", time: "Pá 8:12" },
      { id: "m2", type: "message", text: "Ahoj! Ano, je volná. Na jak dlouho by to bylo?", sender: "them", time: "Pá 8:30" },
      { id: "m3", type: "message", text: "Pátek–neděle, takže 3 dny. Jaká je záloha?", sender: "me", time: "Pá 8:45" },
      { id: "m4", type: "message", text: "Záloha je 500 Kč, vrátím po vrácení v pořádku. Platba přes platformu.", sender: "them", time: "Pá 9:02" },
      { id: "m5", type: "message", text: "Perfektní, to mi vyhovuje. Kde probíhá předání?", sender: "me", time: "Pá 9:15" },
      { id: "m6", type: "message", text: "Super, tak v pátek v 9 hodin u mě.", sender: "them", time: "Pá 9:41" },
      { id: "s1", type: "status", statusType: "reservation-sent", statusText: "Odeslali jste žádost o rezervaci na 12.–14. 6.", time: "Pá 9:50" },
      { id: "s2", type: "status", statusType: "reservation-accepted", statusText: "Tomáš přijal vaši rezervaci.", time: "Pá 10:15" },
      { id: "s3", type: "status", statusType: "payment-sent", statusText: "Platba 1 435 Kč odeslána. Čeká na potvrzení.", time: "Pá 10:30" },
    ],
  },
  {
    id: "conv-2",
    contactName: "Pavel",
    listingId: "makita-drill",
    listingTitle: "Aku vrtačka Makita 18V",
    unread: 0,
    lastMessage: "Díky, bylo to super!",
    lastTime: "Včera",
    messages: [
      { id: "m1", type: "message", text: "Čau, mám zájem o vrtačku. Je ještě volná na tento víkend?", sender: "me", time: "St 10:00" },
      { id: "m2", type: "message", text: "Ahoj, ano, je. Kdy bys ji potřeboval?", sender: "them", time: "St 10:20" },
      { id: "m3", type: "message", text: "V sobotu ráno, vrátil bych v neděli večer.", sender: "me", time: "St 10:35" },
      { id: "m4", type: "message", text: "To jde. Rezervuj přes platformu a dej vědět.", sender: "them", time: "St 11:00" },
      { id: "s1", type: "status", statusType: "reservation-sent",     statusText: "Odeslali jste žádost o rezervaci na So–Ne.", time: "St 11:10" },
      { id: "s2", type: "status", statusType: "reservation-accepted", statusText: "Pavel přijal vaši rezervaci.", time: "St 14:00" },
      { id: "s3", type: "status", statusType: "payment-sent",         statusText: "Platba 540 Kč odeslána.", time: "St 14:20" },
      { id: "s4", type: "status", statusType: "payment-confirmed",    statusText: "Pavel potvrdil přijetí platby.", time: "St 15:00" },
      { id: "s5", type: "status", statusType: "handover",             statusText: "Předání potvrzeno — So 9:05.", time: "So 9:06" },
      { id: "m5", type: "message", text: "Díky, bylo to super!", sender: "me", time: "Ne 19:30" },
      { id: "s6", type: "status", statusType: "return",               statusText: "Vrácení potvrzeno — Ne 19:35.", time: "Ne 19:35" },
      { id: "s7", type: "status", statusType: "rating",               statusText: "Hodnocení odesláno. Děkujeme!", time: "Ne 20:00" },
    ],
  },
  {
    id: "conv-3",
    contactName: "Lucie",
    listingId: "karcher-wash",
    listingTitle: "Tlaková myčka Kärcher K5",
    unread: 0,
    lastMessage: "Dobrý den, myčka je teď obsazená do příštího pátku.",
    lastTime: "Pondělí",
    messages: [
      { id: "m1", type: "message", text: "Dobrý den, byl bych zájem o myčku tento víkend, je volná?", sender: "me", time: "Po 14:00" },
      { id: "m2", type: "message", text: "Dobrý den, myčka je teď obsazená do příštího pátku.", sender: "them", time: "Po 14:45" },
      { id: "s1", type: "status", statusType: "reservation-sent",     statusText: "Odeslali jste žádost o rezervaci.", time: "Po 15:00" },
      { id: "s2", type: "status", statusType: "reservation-rejected",  statusText: "Lucie zamítla žádost o rezervaci.", time: "Po 16:30" },
    ],
  },
];
