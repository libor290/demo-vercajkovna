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
      "Pro přesné řezy, čistý finish a víkendové projekty. Ideální jako hlavní listing demo flow.",
    owner: "Tomáš",
    ownerSince: "na platformě 3 roky",
    badges: ["Ov. profil", "Bezpečné předání", "Okamžitý kontakt"],
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
  },
];
